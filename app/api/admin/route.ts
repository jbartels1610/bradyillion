import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getQuestions,type Question} from '../../../lib/questions';
import {TIER_POINTS,GameError} from '../../../lib/game/engine';
import {utcDate} from '../../../lib/daily';
import {transaction} from '../../../lib/server/db';
import {DATA_VERSION,prepareChallenges} from '../../../lib/server/games';
import {checkOrigin,errorResponse,noCache,requireAdmin} from '../../../lib/server/http';
export const dynamic='force-dynamic',runtime='nodejs';
const input=z.discriminatedUnion('action',[
 z.object({action:z.literal('schedule'),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),questionIds:z.array(z.string().min(1).max(150)).length(7)}),
 z.object({action:z.literal('rarity'),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),questionId:z.string().max(150),entityId:z.string().max(100),tier:z.enum(['Practice Squad','Rookie','Starter','Pro Bowler','GOAT']),reason:z.string().min(5).max(500).default('Administrator editorial override for a future challenge.')}),
 z.object({action:z.literal('report'),id:z.string().uuid(),status:z.enum(['open','reviewed','resolved','dismissed'])})]);
export async function GET(request:Request){try{
 requireAdmin(request);await prepareChallenges();const query=new URL(request.url).searchParams.get('q')||'',content=getQuestions();
 const result=await transaction(async db=>({challenges:(await db.query('SELECT date,questions,dataset_version FROM daily_challenges WHERE date>=$1 ORDER BY date LIMIT 30',[utcDate()])).rows,reports:(await db.query('SELECT id,question_id,answer,reason,evidence,dataset_version,status,created_at FROM reported_answer_issues ORDER BY created_at DESC LIMIT 100')).rows,frequencies:(await db.query('SELECT question_id,entity_id,valid,submissions FROM answer_aggregates ORDER BY submissions DESC LIMIT 100')).rows}));
 return NextResponse.json({...result,datasetVersion:DATA_VERSION,totalQuestions:content.length,categories:[...new Set(content.map(q=>q.category))],questions:content.filter(q=>!query||q.text.toLowerCase().includes(query.toLowerCase())||q.id===query).slice(0,50),scoring:{version:'editorial-v1',calibrated:false,note:'Editorial estimates. Aggregate counts are observed submissions and never change active scores.'}},{headers:noCache});
}catch(error){return errorResponse(error);}}
export async function POST(request:Request){try{
 requireAdmin(request);checkOrigin(request);const data=input.parse(await request.json());
 await transaction(async db=>{
  if(data.action==='report'){await db.query('UPDATE reported_answer_issues SET status=$2 WHERE id=$1',[data.id,data.status]);}
  else {
   if(data.date<=utcDate()||Number.isNaN(Date.parse(data.date)))throw new GameError('Only future challenges can be edited. Active and completed scoring is immutable.');
   if(data.action==='schedule'){
    if(new Set(data.questionIds).size!==7)throw new GameError('Choose seven distinct questions.');const all=getQuestions(),questions=data.questionIds.map(id=>all.find(q=>q.id===id));if(questions.some(q=>!q))throw new GameError('Unknown question in schedule.');
    await db.query('INSERT INTO daily_challenges(date,questions,dataset_version) VALUES($1,$2,$3) ON CONFLICT(date) DO UPDATE SET questions=EXCLUDED.questions,dataset_version=EXCLUDED.dataset_version',[data.date,JSON.stringify(questions),DATA_VERSION]);
   }else{
    const stored=await db.query<{questions:Question[]}>('SELECT questions FROM daily_challenges WHERE date=$1',[data.date]),questions=stored.rows[0]?.questions;if(!questions)throw new GameError('Schedule this date first.');const answer=questions.find(q=>q.id===data.questionId)?.answers.find(a=>a.entityId===data.entityId);if(!answer)throw new GameError('That answer is not eligible for this question.');answer.tier=data.tier;answer.points=TIER_POINTS[data.tier];answer.rarityReason=data.reason;await db.query('UPDATE daily_challenges SET questions=$2 WHERE date=$1',[data.date,JSON.stringify(questions)]);
   }
  }
  await db.query('INSERT INTO admin_audit(action,details) VALUES($1,$2)',[data.action,JSON.stringify(data)]);
 });return NextResponse.json({ok:true});
}catch(error){return errorResponse(error);}}
