import {NextResponse} from 'next/server';
import {getQuestions} from '../../../lib/questions';
import {DATA_VERSION} from '../../../lib/server/games';
export const dynamic='force-dynamic';
export function GET(){return NextResponse.json({categories:[...new Set(getQuestions().map(q=>q.category))],dataVersion:DATA_VERSION});}
