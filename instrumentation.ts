export async function register(){
 if(process.env.NEXT_RUNTIME==='nodejs'&&process.env.NEXT_PHASE!=='phase-production-build'){
  const {prepareChallenges}=await import('./lib/server/games');await prepareChallenges();
 }
}
