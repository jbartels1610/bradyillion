import {randomUUID} from 'node:crypto';
import {applyAction,createGame,GameError,publicGame,syncClock,type Game,type Mode} from '../game/engine';
import {selectQuestions,utcDate} from '../daily';
import {resolveEntity} from '../nfl';
import {transaction,type Queryable} from './db';
import type {Question} from '../questions';
export const DATA_VERSION='nflverse-1999-2024-v1';
const NICKNAMES=['Pocket','Audible','Huddle','Blitz','Sideline','Redzone','Endzone','Spiral'];
async function ensurePlayer(db:Queryable,id:string){const nickname=`${NICKNAMES[parseInt(id.replace(/-/g,'').slice(0,2),16)%8]} ${id.slice(0,5).toUpperCase()}`;await db.query('INSERT INTO anonymous_players(id,nickname) VALUES($1,$2) ON CONFLICT DO NOTHING',[id,nickname]);}
async function frozenChallenge(db:Queryable,date:string):Promise<Question[]>{const existing=await db.query<{questions:Question[]}>('SELECT questions FROM daily_challenges WHERE date=$1',[date]);if(existing.rows[0])return existing.rows[0].questions;const questions=selectQuestions(`bradyillion-v1:${date}`);await db.query('INSERT INTO daily_challenges(date,questions) VALUES($1,$2)',[date,JSON.stringify(questions)]);return questions;}
export async function prepareChallenges(){await transaction(async db=>{const midnight=Date.parse(utcDate());for(let day=0;day<=7;day++)await frozenChallenge(db,utcDate(midnight+day*86400000));});}
async function persist(db:Queryable,game:Game){await db.query('UPDATE game_sessions SET state=$2,finished_at=$3 WHERE id=$1',[game.id,JSON.stringify(game),game.finishedAt?new Date(game.finishedAt).toISOString():null]);}
async function ownedGame(db:Queryable,id:string,playerId:string){const found=await db.query<{state:Game}>('SELECT state FROM game_sessions WHERE id=$1 AND player_id=$2 FOR UPDATE',[id,playerId]);if(!found.rows[0])throw new GameError('Game not found.',404);return found.rows[0].state;}
export async function startGame(playerId:string,mode:Mode,options:{date?:string;category?:string;difficulty?:string}={}){return transaction(async db=>{
 const now=Date.now(),today=utcDate(now),date=mode==='archive'?options.date||'':today;
 if(mode==='archive'&&(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date))||date>=today||Date.parse(date)<now-366*86400000))throw new GameError('Choose an archive date within the past year.');
 await ensurePlayer(db,playerId);
 if(mode==='daily'){const existing=await db.query<{state:Game}>("SELECT state FROM game_sessions WHERE player_id=$1 AND date=$2 AND mode='daily'",[playerId,date]);if(existing.rows[0]){const game=syncClock(existing.rows[0].state,now);await persist(db,game);return publicGame(game,now);}}
 let questions:Question[];
 try {if(mode==='archive'){const archive=await db.query<{questions:Question[]}>('SELECT questions FROM daily_challenges WHERE date=$1',[date]);if(!archive.rows[0])throw new GameError('This date has no published challenge. Archive games become available after the first daily reset.',404);questions=archive.rows[0].questions;}else questions=mode==='practice'?selectQuestions(randomUUID(),options):await frozenChallenge(db,date);}catch(error){if(mode==='practice'&&error instanceof Error)throw new GameError(error.message);throw error;}
 const game=createGame(randomUUID(),playerId,mode,date,questions,now);await db.query('INSERT INTO game_sessions(id,player_id,mode,date,state) VALUES($1,$2,$3,$4,$5)',[game.id,playerId,mode,date,JSON.stringify(game)]);return publicGame(game,now);
});}
export async function getGame(playerId:string,id?:string){return transaction(async db=>{let game:Game;if(id)game=await ownedGame(db,id,playerId);else{const found=await db.query<{state:Game}>("SELECT state FROM game_sessions WHERE player_id=$1 AND date=$2 AND mode='daily' ORDER BY created_at DESC LIMIT 1",[playerId,utcDate()]);if(!found.rows[0])return null;game=found.rows[0].state;}const now=Date.now();syncClock(game,now);await persist(db,game);return publicGame(game,now);});}
export async function actOnGame(playerId:string,id:string,action:'start'|'next'|'skip'|'submit',answer='',entityId?:string,expectedRound?:number){return transaction(async db=>{
 const game=await ownedGame(db,id,playerId),now=Date.now();syncClock(game,now);if(expectedRound!==undefined&&expectedRound!==game.roundIndex)throw new GameError('The round has already advanced. Refresh your game.',409);
 const round=game.rounds[game.roundIndex],prior=new Set(round.submissions),candidates=action==='submit'?resolveEntity(answer,round.question.entityType):[];
 const feedback=applyAction(game,action,now,answer,candidates,entityId);
 for(const entity of round.submissions.filter(id=>!prior.has(id))){const valid=round.question.answers.some(answer=>answer.entityId===entity);await db.query('INSERT INTO answer_aggregates(question_id,entity_id,valid,submissions) VALUES($1,$2,$3,1) ON CONFLICT(question_id,entity_id,valid) DO UPDATE SET submissions=answer_aggregates.submissions+1',[round.question.id,entity,valid]);}
 await persist(db,game);return {game:publicGame(game,now),...(feedback?{feedback}:{})};
});}
export interface PlayerStatistics {dailyGamesPlayed:number;practiceGamesPlayed:number;currentStreak:number;longestStreak:number;bestScore:number;averageScore:number;correctPercentage:number;totalGoats:number;proBowlers:number;lifetimePoints:number}
export async function getStatistics(playerId:string):Promise<PlayerStatistics>{return transaction(async db=>{
 const rows=await db.query<{state:Game}>('SELECT state FROM game_sessions WHERE player_id=$1 AND finished_at IS NOT NULL',[playerId]);const games=rows.rows.map(row=>row.state),daily=games.filter(game=>game.mode==='daily'),results=daily.flatMap(game=>game.rounds.map(round=>round.result!)),scores=daily.map(game=>game.rounds.reduce((sum,round)=>sum+(round.result?.points||0),0));
 const dates=[...new Set(daily.map(game=>game.date))].sort();let longestStreak=0,run=0;for(let i=0;i<dates.length;i++){run=i&&Date.parse(dates[i])-Date.parse(dates[i-1])===86400000?run+1:1;longestStreak=Math.max(longestStreak,run);}let currentStreak=0,cursor=Date.parse(utcDate());if(!dates.includes(utcDate(cursor)))cursor-=86400000;while(dates.includes(utcDate(cursor))){currentStreak++;cursor-=86400000;}
 return {dailyGamesPlayed:daily.length,practiceGamesPlayed:games.filter(game=>game.mode==='practice').length,currentStreak,longestStreak,bestScore:Math.max(0,...scores),averageScore:scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length):0,correctPercentage:results.length?Math.round(results.filter(r=>r.points>0).length/results.length*100):0,totalGoats:results.filter(r=>r.points===100).length,proBowlers:results.filter(r=>r.points===75).length,lifetimePoints:scores.reduce((a,b)=>a+b,0)};
});}
export async function leaderboard(period:'today'|'week'|'all'){return transaction(async db=>{
 const since=period==='today'?utcDate():period==='week'?utcDate(Date.now()-6*86400000):'0000-00-00';
 const rows=await db.query<{state:Game;nickname:string}>("SELECT s.state,p.nickname FROM game_sessions s JOIN anonymous_players p ON p.id=s.player_id WHERE s.mode='daily' AND s.finished_at IS NOT NULL AND s.date>=$1",[since]);
 const ranked=rows.rows.map(row=>({nickname:row.nickname,score:row.state.rounds.reduce((sum,round)=>sum+(round.result?.points||0),0),correct:row.state.rounds.filter(round=>(round.result?.points||0)>0).length,date:row.state.date})).sort((a,b)=>b.score-a.score||b.correct-a.correct||a.nickname.localeCompare(b.nickname));return ranked.slice(0,50).map((row,index)=>({...row,rank:index+1}));
});}
