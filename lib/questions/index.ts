import{readFileSync}from'node:fs';
import{join}from'node:path';
import{gunzipSync}from'node:zlib';
import{entities}from'../nfl';
import{RARITY_MODEL_VERSION,TIERS,type Points}from'../scoring';
import type{Question}from'./types';
export type{Answer,Question}from'./types';
export type CompactBank={facts:string[];reasons:string[];sources:string[];questions:(Omit<Question,'answers'>&{answers:[string,Points,number,number,number][]})[]};
let bank:Question[]|undefined;
export function getQuestions():Question[]{
 if(!bank){const wire=JSON.parse(gunzipSync(readFileSync(join(process.cwd(),'data/question-bank.json.gz'))).toString())as CompactBank;const names=new Map(entities.map(e=>[e.id,e.name]));bank=wire.questions.map(q=>({...q,answers:q.answers.map(([entityId,points,fact,reason,source])=>({entityId,name:names.get(entityId)!,points,tier:TIERS.find(t=>t.points===points)!.tier,evidence:wire.facts[fact],source:wire.sources[source],rarityReason:wire.reasons[reason],modelVersion:RARITY_MODEL_VERSION}))}));}
 return bank;
}
export function getQuestion(id:string):Question|undefined{return getQuestions().find(q=>q.id===id);}
