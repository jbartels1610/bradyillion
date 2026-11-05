import{writeFileSync,readFileSync}from'node:fs';
import{gzipSync,gunzipSync}from'node:zlib';
import{getQuestions,getGenerationAudit}from'../lib/questions/generate';
import{entities}from'../lib/nfl';
import type{CompactBank}from'../lib/questions';
const questions=getQuestions(),audit=getGenerationAudit();
const ids=new Set(entities.map(e=>e.id)),uniqueIds=new Set(questions.map(q=>q.id)),eligibleSets=new Set(questions.map(q=>q.answers.map(a=>a.entityId).sort().join('|')));
if(uniqueIds.size!==questions.length||eligibleSets.size!==questions.length)throw Error('Duplicate question or eligible set');
for(const q of questions){if(q.answers.length<10)throw Error('Insufficient answer count');if(new Set(q.answers.map(a=>a.entityId)).size!==q.answers.length)throw Error('Duplicate answer');for(const a of q.answers)if(!ids.has(a.entityId)||!a.evidence||!a.source||![10,20,40,75,100].includes(a.points))throw Error('Invalid verified answer');}
const counts=(values:string[])=>values.reduce((acc,v)=>(acc[v]=(acc[v]??0)+1,acc),{}as Record<string,number>);
const lengths=questions.map(q=>q.answers.length);
const report={...audit,distinctPredicates:uniqueIds.size,distinctEligibleSets:eligibleSets.size,byCategory:counts(questions.map(q=>q.category)),byEra:counts(questions.map(q=>q.era)),difficulty:counts(questions.map(q=>q.difficulty)),answerCounts:{total:lengths.reduce((a,b)=>a+b,0),mean:lengths.reduce((a,b)=>a+b,0)/questions.length,min:Math.min(...lengths),max:Math.max(...lengths)},rarity:counts(questions.flatMap(q=>q.answers.map(a=>a.tier))),duplicateCount:questions.length-uniqueIds.size,nearDuplicatePolicy:'Eight deterministic MinHash buckets identify candidates; exact Jaccard >=0.97 rejects a candidate. Exact duplicate eligible sets are always rejected. This is near-duplicate detection, not proof every similar pair is found.',coverageGaps:['Player statistics: NFL regular seasons 1999–2024 only','Draft picks: 1980–2024 only','Defense supported for draft-position questions only; no defensive game or season statistics','Coaches, stadiums, awards, Super Bowls, and pre-1999 statistics excluded'],bankPolicy:'At most 600 deterministic questions per category to fit preview memory budget; omitted verified candidates do not count as published questions.'};
if(!process.argv.includes('--audit')){
 const facts:string[]=[],reasons:string[]=[],sources:string[]=[];const factMap=new Map<string,number>(),reasonMap=new Map<string,number>(),sourceMap=new Map<string,number>();
 function intern(s:string,list:string[],map:Map<string,number>){if(!map.has(s)){map.set(s,list.length);list.push(s);}return map.get(s)!;}
 const wire:CompactBank={facts,reasons,sources,questions:questions.map(q=>({...q,answers:q.answers.map(a=>[a.entityId,a.points,intern(a.evidence,facts,factMap),intern(a.rarityReason,reasons,reasonMap),intern(a.source,sources,sourceMap)])}))};
 writeFileSync('data/question-bank.json.gz',gzipSync(JSON.stringify(wire),{level:9}));writeFileSync('data/question-audit.json',JSON.stringify(report,null,2)+'\n');console.log('Wrote checked-in question bank and audit.');
}else{
 const saved=JSON.parse(gunzipSync(readFileSync('data/question-bank.json.gz')).toString())as CompactBank;
 if(JSON.stringify(saved.questions.map(q=>[q.id,q.answers.map(a=>[a[0],a[1]])]))!==JSON.stringify(questions.map(q=>[q.id,q.answers.map(a=>[a.entityId,a.points])])))throw Error('Saved question bank is stale; run questions:generate');
 for(let i=0;i<questions.length;i++){const q=questions[i],actual=saved.questions[i];if(q.text!==actual.text||q.signature!==actual.signature||q.dataVersion!==actual.dataVersion)throw Error('Stale question metadata');for(let j=0;j<q.answers.length;j++){const a=q.answers[j],w=actual.answers[j];if(a.evidence!==saved.facts[w[2]]||a.rarityReason!==saved.reasons[w[3]]||a.source!==saved.sources[w[4]])throw Error('Stale answer evidence or provenance');}}
 console.log('Saved bank matches regenerated predicates, eligible IDs, evidence and frozen scores.');
}
console.log(JSON.stringify(report,null,2));
