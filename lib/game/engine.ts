import type { Question } from '../questions';
export const ROUND_COUNT=7, PREVIEW_MS=2000, ROUND_MS=25000;
export const TIER_POINTS={'Practice Squad':10,Rookie:20,Starter:40,'Pro Bowler':75,GOAT:100} as const;
export type Mode='daily'|'practice'|'archive';
export type Phase='intro'|'preview'|'active'|'result'|'complete';
export interface RoundResult {answer:string;entityId:string|null;points:number;tier:string;evidence:string;source:string;reason:string}
export interface Round {question:Question;previewEndsAt:number|null;deadline:number|null;incorrectAttempts:number;submissions:string[];result:RoundResult|null}
export interface Game {id:string;playerId:string;mode:Mode;date:string;phase:Phase;roundIndex:number;rounds:Round[];createdAt:number;finishedAt:number|null;datasetVersion:string}
export interface EntityLike {id:string;name:string;label:string;type:string;aliases:string[]}
export interface Feedback {kind:'unknown'|'ambiguous'|'incorrect'|'preview';message:string;candidates?:EntityLike[]}
export class GameError extends Error {constructor(message:string,public status=400){super(message);}}
export function createGame(id:string,playerId:string,mode:Mode,date:string,questions:Question[],now:number):Game {
 if(questions.length!==ROUND_COUNT)throw new GameError('A challenge must contain exactly seven questions.');
 return {id,playerId,mode,date,phase:'intro',roundIndex:0,createdAt:now,finishedAt:null,datasetVersion:'nflverse-1999-2024-v1',rounds:questions.map(question=>({question:structuredClone(question),previewEndsAt:null,deadline:null,incorrectAttempts:0,submissions:[],result:null}))};
}
function miss(round:Round,reason:string){round.result={answer:'',entityId:null,points:0,tier:'Miss',evidence:'',source:'',reason};}
export function syncClock(game:Game,now:number):Game {
 const round=game.rounds[game.roundIndex];
 if(game.phase==='preview'&&now>=round.previewEndsAt!)game.phase='active';
 if(game.phase==='active'&&now>=round.deadline!){miss(round,'Time expired.');game.phase='result';}
 return game;
}
export function beginRound(game:Game,now:number){const round=game.rounds[game.roundIndex];round.previewEndsAt=now+PREVIEW_MS;round.deadline=round.previewEndsAt+ROUND_MS;game.phase='preview';}
export function applyAction(game:Game,action:'start'|'next'|'skip'|'submit',now:number,input='',candidates:EntityLike[]=[],entityId?:string):Feedback|undefined {
 syncClock(game,now);
 if(action==='start'){if(game.phase==='intro')beginRound(game,now);return;}
 if(action==='next'){if(game.phase!=='result')return;if(game.roundIndex===6){game.phase='complete';game.finishedAt=now;}else{game.roundIndex++;beginRound(game,now);}return;}
 if(game.phase==='result'||game.phase==='complete')return;
 if(game.phase==='preview')return {kind:'preview',message:'Get ready. Answering opens after the preview.'};
 if(game.phase!=='active')throw new GameError('Kick off your game first.');
 const round=game.rounds[game.roundIndex];
 if(action==='skip'){miss(round,'Round skipped.');game.phase='result';return;}
 const possible=!input.trim()?[]:entityId?candidates.filter(candidate=>candidate.id===entityId):candidates;
 if(!possible.length)return {kind:'unknown',message:'We could not identify that name. Check the spelling or select a suggestion. No attempt used.'};
 if(possible.length>1)return {kind:'ambiguous',message:'Which one did you mean? The timer is still running.',candidates:possible};
 const entity=possible[0];
 if(round.submissions.includes(entity.id))return {kind:'incorrect',message:'You already tried that answer. Choose another name.'};
 round.submissions.push(entity.id);
 const answer=round.question.answers.find(answer=>answer.entityId===entity.id);
 if(!answer){round.incorrectAttempts++;if(round.incorrectAttempts>=3){miss(round,'Three recognized answers did not qualify.');game.phase='result';}return {kind:'incorrect',message:"That doesn't fit this question in the covered dataset."};}
 if(!Object.values(TIER_POINTS).includes(answer.points as 10))throw new GameError('Invalid scoring snapshot.',500);
 round.result={answer:answer.name,entityId:answer.entityId,points:answer.points,tier:answer.tier,evidence:answer.evidence,source:answer.source,reason:'Correct answer.'};game.phase='result';
}
export function publicGame(game:Game,now:number){
 syncClock(game,now);
 const rounds=game.rounds.map((round,index)=>({number:index+1,question:index<=game.roundIndex||game.phase==='complete'?{id:round.question.id,text:round.question.text,category:round.question.category,entityType:round.question.entityType}:null,previewEndsAt:round.previewEndsAt,deadline:round.deadline,incorrectAttempts:round.incorrectAttempts,result:round.result,...(game.phase==='complete'?{alternatives:round.question.answers.filter(answer=>answer.entityId!==round.result?.entityId).sort((a,b)=>b.points-a.points).slice(0,5)}:{})}));
 const results=game.rounds.flatMap(round=>round.result?[round.result]:[]);
 return {id:game.id,mode:game.mode,date:game.date,status:game.phase,roundIndex:game.roundIndex,total:results.reduce((sum,result)=>sum+result.points,0),correct:results.filter(result=>result.points>0).length,rounds,current:game.phase==='complete'?null:rounds[game.roundIndex],serverNow:now,challengeNumber:Math.floor((Date.parse(game.date)-Date.parse('2026-01-01'))/86400000)+1};
}
