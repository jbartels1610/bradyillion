export type Entity={id:string;name:string;label:string;type:string;aliases?:string[]};
export type Answer={entityId:string;name:string;points:number;tier:string;evidence:string;source:string};
export type RoundResult={answer:string;points:number;tier:string;evidence:string;source:string;reason:string};
export type PublicRound={number:number;question:{id:string;text:string;category:string;entityType:string}|null;previewEndsAt:number|null;deadline:number|null;incorrectAttempts:number;result:RoundResult|null;alternatives?:Answer[]};
export type PublicGame={id:string;mode:"daily"|"practice"|"archive";date:string;status:"intro"|"preview"|"active"|"result"|"complete";roundIndex:number;total:number;correct:number;rounds:PublicRound[];current:PublicRound|null;serverNow:number;challengeNumber:number};
export type Stats={dailyGamesPlayed?:number;practiceGamesPlayed?:number;currentStreak?:number;longestStreak?:number;bestScore?:number;averageScore?:number;correctPercentage?:number;totalGoats?:number;proBowlers?:number;lifetimePoints?:number};
export type Feedback={kind:string;message:string;candidates?:Entity[]};
export type LeaderEntry={rank:number;nickname:string;score:number;correct:number;date:string};
