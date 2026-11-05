import {createHash} from 'node:crypto';
import {getQuestions,type Question} from '../questions';
export function utcDate(now=Date.now()){return new Date(now).toISOString().slice(0,10);}
export function stableNumber(seed:string){return createHash('sha256').update(seed).digest().readUInt32BE(0);}
export function selectQuestions(seed:string,options:{category?:string;difficulty?:string}={}):Question[]{
 let pool=getQuestions();
 if(seed.startsWith('bradyillion-v1:'))pool=pool.filter(q=>q.answers.length>=15&&q.answers.length<=200);
 if(options.category&&options.category!=='all')pool=pool.filter(q=>q.category.toLowerCase().includes(options.category!.toLowerCase()));
 if(options.difficulty==='casual')pool=pool.filter(q=>q.answers.length>=20);
 if(options.difficulty==='expert')pool=pool.filter(q=>q.answers.length<=60);
 if(pool.length<7)throw new Error('This filter does not have seven supported questions. Try all categories.');
 const ordered=[...pool].sort((a,b)=>stableNumber(`${seed}:${a.id}`)-stableNumber(`${seed}:${b.id}`));
 const picked:Question[]=[],categories=new Set<string>();
 for(const question of ordered){if(!categories.has(question.category)){picked.push(question);categories.add(question.category);}if(picked.length===7)break;}
 for(const question of ordered){if(picked.length===7)break;if(!picked.includes(question))picked.push(question);}
 return seed.startsWith('bradyillion-v1:')?picked.sort((a,b)=>b.answers.length-a.answers.length):picked;
}
