import Link from "next/link";
export function Football({size=24}:{size?:number}) {return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true"><path d="M6 34S-1 14 13 7 34 6 34 6s7 20-7 27S6 34 6 34Z" stroke="currentColor" strokeWidth="2.5"/><path d="m13 27 14-14m-13 7 6 6m-2-10 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>}
export function Brand() {return <Link href="/" className="brand" aria-label="Bradyillion home"><span className="brand-mark"><Football/></span>BRADYILLION<span className="brand-dot">.</span></Link>}
