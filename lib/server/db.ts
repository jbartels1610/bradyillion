import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import type {Pool,PoolClient} from 'pg';
import type {PGlite} from '@electric-sql/pglite';
export interface Queryable {query<T extends Record<string,unknown>=Record<string,unknown>>(sql:string,params?:unknown[]):Promise<{rows:T[]}>}
const schema=`
CREATE TABLE IF NOT EXISTS anonymous_players(id TEXT PRIMARY KEY,nickname TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS daily_challenges(date TEXT PRIMARY KEY,questions JSONB NOT NULL,dataset_version TEXT NOT NULL DEFAULT 'nflverse-1999-2024-v1',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
ALTER TABLE daily_challenges ADD COLUMN IF NOT EXISTS dataset_version TEXT NOT NULL DEFAULT 'nflverse-1999-2024-v1';
CREATE TABLE IF NOT EXISTS game_sessions(id TEXT PRIMARY KEY,player_id TEXT NOT NULL REFERENCES anonymous_players(id),mode TEXT NOT NULL,date TEXT NOT NULL,state JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),finished_at TIMESTAMPTZ);
CREATE UNIQUE INDEX IF NOT EXISTS one_ranked_attempt ON game_sessions(player_id,date) WHERE mode='daily';
CREATE INDEX IF NOT EXISTS player_games ON game_sessions(player_id,created_at DESC);
CREATE TABLE IF NOT EXISTS reported_answer_issues(id TEXT PRIMARY KEY,player_id TEXT NOT NULL,question_id TEXT NOT NULL,answer TEXT NOT NULL,reason TEXT NOT NULL,evidence TEXT NOT NULL DEFAULT '',dataset_version TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'open',created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS answer_aggregates(question_id TEXT NOT NULL,entity_id TEXT NOT NULL,valid BOOLEAN NOT NULL,submissions INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(question_id,entity_id,valid));
CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,hits INTEGER NOT NULL,expires_at BIGINT NOT NULL);
CREATE TABLE IF NOT EXISTS admin_audit(id BIGSERIAL PRIMARY KEY,action TEXT NOT NULL,details JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
`;
interface State {pool?:Pool;local?:PGlite;ready?:Promise<void>;tail:Promise<unknown>}
const globals=globalThis as typeof globalThis&{bradyDb?:State};
const state=globals.bradyDb??={tail:Promise.resolve()};
async function initialize(){
 if(process.env.DATABASE_URL){const {Pool:PgPool}=await import('pg');state.pool??=new PgPool({connectionString:process.env.DATABASE_URL,max:10});await state.pool.query(schema);}
 else {const {PGlite:LocalPg}=await import('@electric-sql/pglite');const path=resolve(process.env.LOCAL_DATABASE_PATH||'.data/postgres');mkdirSync(path,{recursive:true});state.local??=new LocalPg(path);await state.local.exec(schema);}
}
export async function transaction<T>(work:(db:Queryable)=>Promise<T>):Promise<T>{
 await(state.ready??=initialize().catch(async error=>{state.ready=undefined;if(state.pool){const failed=state.pool;state.pool=undefined;await failed.end().catch(()=>undefined);}throw error;}));
 const execute=async()=>{const rawClient=state.pool?await state.pool.connect():state.local!;const client=rawClient as unknown as Queryable;
 try {await client.query('BEGIN');if(state.pool)await client.query('SELECT pg_advisory_xact_lock(719301)');const result=await work(client);await client.query('COMMIT');return result;}
 catch(error){await client.query('ROLLBACK');throw error;}finally{if(state.pool)(rawClient as PoolClient).release();}};
 const pending=state.tail.then(execute,execute);state.tail=pending.catch(()=>undefined);return pending;
}
export async function health(){return transaction(async db=>{await db.query('SELECT 1 AS healthy');return true;});}
