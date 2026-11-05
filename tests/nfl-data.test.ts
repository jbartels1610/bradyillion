import{describe,it,expect}from'vitest';
import{getQuestions}from'../lib/questions';
import{resolveEntity,searchEntities,normalizeName,franchises}from'../lib/nfl';
import{editorialRarity,TIERS}from'../lib/scoring';
import{readFileSync}from'node:fs';
import manifest from'../data/manifest.json';
const seasons=JSON.parse(readFileSync('data/seasons.json','utf8'))as{id:string;year:number;passing_yards:number}[];

describe('canonical NFL identities',()=>{
 it('normalizes punctuation, initials, accents and suffixes',()=>{
  expect(normalizeName('Patrick Mahomes II')).toBe(normalizeName('Patrick Mahomes'));
  expect(resolveEntity('patrick mahomes ii')[0]?.name).toBe('Patrick Mahomes');expect(resolveEntity('Odell Beckham')[0]?.name).toBe('Odell Beckham Jr.');expect(resolveEntity('TJ Watt')[0]?.name).toBe('T.J. Watt');expect(resolveEntity('CJ Stroud')[0]?.name).toBe('C.J. Stroud');
 });
 it('keeps ambiguous identities separate without considering eligibility',()=>{const names=resolveEntity('Josh Allen');expect(names.length).toBeGreaterThanOrEqual(2);expect(new Set(names.map(n=>n.id)).size).toBe(names.length);});
 it('does not silently accept spelling guesses or unknown text',()=>{expect(resolveEntity('Patrcik Mahomse')).toEqual([]);expect(resolveEntity('Not A Football Player')).toEqual([]);});
 it('searches the whole corpus without score or validity leakage',()=>{expect(searchEntities('Tom Brady','player').some(p=>p.name==='Tom Brady')).toBe(true);expect(searchEntities('TJ Watt','player').some(p=>p.name==='T.J. Watt')).toBe(true);expect(searchEntities('Aaron','player').every(p=>!('points'in p)&&!('valid'in p))).toBe(true);});
 it('maps historical franchise aliases without merging different franchises',()=>{expect(Object.keys(franchises)).toHaveLength(32);expect(resolveEntity('Oakland Raiders','team')[0]?.id).toBe('team:LV');expect(resolveEntity('St Louis Rams','team')[0]?.id).toBe('team:LAR');expect(resolveEntity('Houston Oilers','team')[0]?.id).toBe('team:TEN');expect(resolveEntity('Baltimore Colts','team')[0]?.id).toBe('team:IND');expect(resolveEntity('Baltimore Ravens','team')[0]?.id).toBe('team:BAL');});
});

describe('editorial scoring',()=>{
 it('awards the five mandatory fixed tiers',()=>{expect(TIERS.map(t=>t.points)).toEqual([10,20,40,75,100]);for(const[estimate,points]of[[1,10],[.7,20],[.5,40],[.3,75],[.1,100]])expect(editorialRarity(estimate,estimate,estimate,100).points).toBe(points);});
 it('depends on question context and reserves GOAT for broad answer pools',()=>{expect(editorialRarity(.6,1,.5,100).points).not.toBe(editorialRarity(.6,0,.5,100).points);expect(editorialRarity(.01,.01,.01,10).points).toBe(75);expect(editorialRarity(.1,.1,.1,100).reason).toContain('No observed selection frequencies');});
});

describe('published generated bank',()=>{
 const questions=getQuestions();
 it('contains 3000+ distinct predicates and eligible sets',()=>{expect(questions.length).toBeGreaterThanOrEqual(3000);expect(new Set(questions.map(q=>q.signature)).size).toBe(questions.length);expect(new Set(questions.map(q=>q.answers.map(a=>a.entityId).sort().join('|'))).size).toBe(questions.length);});
 it('enforces coverage, many-answer thresholds and factual provenance',()=>{expect(new Set(questions.map(q=>q.category)).size).toBeGreaterThanOrEqual(8);for(const q of questions){expect(q.answers.length).toBeGreaterThanOrEqual(10);expect(q.dataVersion).toBe(manifest.version);for(const a of q.answers){expect(a.evidence.length).toBeGreaterThan(20);expect(a.source).toMatch(/^https:\/\/github.com\/nflverse\//);expect([10,20,40,75,100]).toContain(a.points);}}});
 it('verifies season totals excluding postseason and unsupported eras',()=>{const brady=resolveEntity('Tom Brady')[0];expect(seasons.find(s=>s.id===brady.id&&s.year===2011)?.passing_yards).toBe(5235);expect(seasons.every(s=>s.year>=1999&&s.year<=2024)).toBe(true);expect(manifest.counts.postseasonRowsExcluded).toBe(5592);});
 it('uses all tiers, keeps score reasons and caps seven-round score at 700',()=>{expect(new Set(questions.flatMap(q=>q.answers.map(a=>a.points)))).toEqual(new Set([10,20,40,75,100]));expect(questions.every(q=>q.answers.every(a=>a.rarityReason&&a.modelVersion))).toBe(true);expect(7*Math.max(...TIERS.map(t=>t.points))).toBe(700);});
});
