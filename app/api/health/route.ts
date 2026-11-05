import {NextResponse} from 'next/server';
import {health} from '../../../lib/server/db';
import {prepareChallenges} from '../../../lib/server/games';
export const runtime='nodejs',dynamic='force-dynamic';
export async function GET(){try{await health();await prepareChallenges();return NextResponse.json({status:'ok',database:'connected'},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({status:'unavailable'},{status:503});}}
