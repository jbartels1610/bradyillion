import {NextResponse} from 'next/server';
import {leaderboard} from '../../../lib/server/games';
import {errorResponse,guard,identity,noCache} from '../../../lib/server/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const player=await identity();await guard(request,player);const requested=new URL(request.url).searchParams.get('period'),period=requested==='week'||requested==='all'?requested:'today';return NextResponse.json({entries:await leaderboard(period),period},{headers:noCache});}catch(error){return errorResponse(error);}}
