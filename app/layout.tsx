import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Bradyillion — Rare answers win",description:"Seven rounds. Twenty-five seconds. A daily NFL knowledge game where the rare answer wins."};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
