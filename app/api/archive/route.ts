import {NextResponse} from 'next/server';
import {utcDate} from '../../../lib/daily';
import {transaction} from '../../../lib/server/db';
import {errorResponse,noCache} from '../../../lib/server/http';
export const dynamic='force-dynamic';
export async function GET(){try{const rows=await transaction(db=>db.query<{date:string}>('SELECT date FROM daily_challenges WHERE date<$1 ORDER BY date DESC LIMIT 365',[utcDate()]));return NextResponse.json({dates:rows.rows.map(row=>row.date)},{headers:noCache});}catch(error){return errorResponse(error);}}
