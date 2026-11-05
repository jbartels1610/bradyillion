import {afterEach,describe,expect,it,vi} from 'vitest';
import {checkOrigin,requireAdmin} from '../lib/server/http';
afterEach(()=>vi.unstubAllEnvs());
describe('API access boundaries',()=>{
 it('accepts the browser target host when Next uses an internal listener URL',()=>{
  expect(()=>checkOrigin(new Request('http://0.0.0.0:3100/api/game',{headers:{origin:'http://127.0.0.1:3100',host:'127.0.0.1:3100'}}))).not.toThrow();
  expect(()=>checkOrigin(new Request('http://0.0.0.0:3100/api/game',{headers:{origin:'https://evil.test',host:'127.0.0.1:3100','x-forwarded-host':'evil.test'}}))).toThrow('Origin is not allowed');
 });
 it('disables admin without sufficiently strong secret',()=>{vi.stubEnv('ADMIN_TOKEN','short');expect(()=>requireAdmin(new Request('https://game.test/api/admin'))).toThrow('disabled');});
 it('rejects invalid and Unicode tokens with stable Unauthorized',()=>{vi.stubEnv('ADMIN_TOKEN','a'.repeat(32));for(const token of ['wrong','é'.repeat(32)])expect(()=>requireAdmin(new Request('https://game.test/api/admin',{headers:{authorization:`Bearer ${token}`}}))).toThrow('Unauthorized');expect(()=>requireAdmin(new Request('https://game.test/api/admin',{headers:{authorization:`Bearer ${'a'.repeat(32)}`}}))).not.toThrow();});
 it('rejects cross-site mutations and trusts configured Render origin only',()=>{expect(()=>checkOrigin(new Request('http://localhost:3000/api/game',{headers:{origin:'https://evil.test'}}))).toThrow('Origin is not allowed');vi.stubEnv('RENDER_EXTERNAL_URL','https://bradyillion.onrender.com');expect(()=>checkOrigin(new Request('http://localhost:3000/api/game',{headers:{origin:'https://bradyillion.onrender.com'}}))).not.toThrow();expect(()=>checkOrigin(new Request('http://localhost:3000/api/game',{headers:{origin:'https://bradyillion.onrender.com','sec-fetch-site':'cross-site'}}))).toThrow('Cross-site');});
});
