import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getGame,getStatistics,startGame} from '../../../lib/server/games';
import {errorResponse,guard,identity,noCache} from '../../../lib/server/http';
import {utcDate} from '../../../lib/daily';
export const runtime='nodejs',dynamic='force-dynamic';
const input=z.object({mode:z.enum(['daily','practice','archive']).default('daily'),date:z.string().max(10).optional(),category:z.string().max(80).optional(),difficulty:z.enum(['casual','standard','expert']).optional()});
export async function GET(request:Request){try{const player=await identity();await guard(request,player);return NextResponse.json({game:await getGame(player,new URL(request.url).searchParams.get('id')||undefined),stats:await getStatistics(player),today:utcDate(),serverNow:Date.now()},{headers:noCache});}catch(error){return errorResponse(error);}}
export async function POST(request:Request){try{const player=await identity();await guard(request,player,true);const data=input.parse(await request.json());return NextResponse.json({game:await startGame(player,data.mode,data)},{headers:noCache});}catch(error){return errorResponse(error);}}
