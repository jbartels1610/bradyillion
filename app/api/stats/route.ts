import {NextResponse} from 'next/server';
import {getStatistics} from '../../../lib/server/games';
import {errorResponse,guard,identity,noCache} from '../../../lib/server/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const player=await identity();await guard(request,player);return NextResponse.json({stats:await getStatistics(player)},{headers:noCache});}catch(error){return errorResponse(error);}}
