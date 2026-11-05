/** Editorial estimates, never invented user popularity data. Frozen into each game snapshot. */
export const RARITY_MODEL_VERSION='editorial-context-v1';
export const TIERS=[{tier:'Practice Squad',points:10},{tier:'Rookie',points:20},{tier:'Starter',points:40},{tier:'Pro Bowler',points:75},{tier:'GOAT',points:100}]as const;
export type Points=10|20|40|75|100;
export const EDITORIAL_WEIGHTS={recognition:.55,questionProminence:.35,recency:.10};
export function editorialRarity(recognition:number,questionProminence:number,recency:number,answerCount:number){
 const recall=recognition*EDITORIAL_WEIGHTS.recognition+questionProminence*EDITORIAL_WEIGHTS.questionProminence+recency*EDITORIAL_WEIGHTS.recency;
 const index=recall>=.78?0:recall>=.61?1:recall>=.43?2:recall>=.24||answerCount<25?3:4;
 return{...TIERS[index],reason:`Editorial context estimate (${RARITY_MODEL_VERSION}); recognition ${recognition.toFixed(2)}, relevance prominence ${questionProminence.toFixed(2)}, recency ${recency.toFixed(2)}. No observed selection frequencies are claimed.`,modelVersion:RARITY_MODEL_VERSION};
}
