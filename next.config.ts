import type { NextConfig } from 'next';
const config: NextConfig = {
 poweredByHeader:false,
 outputFileTracingIncludes:{'/*':['./data/question-bank.json.gz','./data/entities.json','./data/manifest.json']},
 serverExternalPackages:['@electric-sql/pglite','pg'],
 async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'},{key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'}]}];}
};
export default config;
