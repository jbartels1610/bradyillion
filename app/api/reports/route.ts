import {randomUUID} from 'node:crypto';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {transaction} from '../../../lib/server/db';
import {DATA_VERSION} from '../../../lib/server/games';
import {errorResponse,guard,identity,rateLimit} from '../../../lib/server/http';
const input=z.object({questionId:z.string().min(1).max(150),answer:z.string().min(1).max(120),reason:z.string().min(5).max(2000),evidence:z.string().max(2000).optional()});
export async function POST(request:Request){try{const player=await identity();await guard(request,player,true);await rateLimit(`reports:${player}`,10);const data=input.parse(await request.json());await transaction(db=>db.query('INSERT INTO reported_answer_issues(id,player_id,question_id,answer,reason,evidence,dataset_version) VALUES($1,$2,$3,$4,$5,$6,$7)',[randomUUID(),player,data.questionId,data.answer,data.reason,data.evidence||'',DATA_VERSION]));return NextResponse.json({ok:true});}catch(error){return errorResponse(error);}}
