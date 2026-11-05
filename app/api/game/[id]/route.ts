import {NextResponse} from 'next/server';
import {z} from 'zod';
import {actOnGame,getGame} from '../../../../lib/server/games';
import {errorResponse,guard,identity,noCache} from '../../../../lib/server/http';
export const runtime='nodejs',dynamic='force-dynamic';
const input=z.object({action:z.enum(['start','next','skip','submit']),answer:z.string().max(120).default(''),entityId:z.string().max(100).optional(),roundIndex:z.number().int().min(0).max(6)});
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){try{const player=await identity();await guard(request,player);return NextResponse.json({game:await getGame(player,(await context.params).id)},{headers:noCache});}catch(error){return errorResponse(error);}}
export async function POST(request:Request,context:Context){try{const player=await identity();await guard(request,player,true);const data=input.parse(await request.json());return NextResponse.json(await actOnGame(player,(await context.params).id,data.action,data.answer,data.entityId,data.roundIndex),{headers:noCache});}catch(error){return errorResponse(error);}}
