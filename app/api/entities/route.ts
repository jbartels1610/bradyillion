import {NextResponse} from 'next/server';
import {searchEntities} from '../../../lib/nfl';
import {errorResponse,guard,identity,noCache} from '../../../lib/server/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const player=await identity();await guard(request,player);const params=new URL(request.url).searchParams,query=(params.get('q')||'').slice(0,100),type=params.get('type')||'player';return NextResponse.json({entities:query.trim().length>=2?searchEntities(query,type).slice(0,10):[]},{headers:noCache});}catch(error){return errorResponse(error);}}
