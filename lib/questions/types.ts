import type {Points} from '../scoring';
export type Answer={entityId:string;name:string;points:Points;tier:string;evidence:string;source:string;rarityReason:string;modelVersion:string};
export type Question={id:string;text:string;category:string;entityType:'player'|'team';answers:Answer[];signature:string;era:string;difficulty:string;template:string;dataVersion:string};
