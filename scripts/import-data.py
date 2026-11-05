#!/usr/bin/env python3
"""Refresh frozen NFL facts using Python standard library with TLS verification.
Usage: python3 scripts/import-data.py [--source-dir DIRECTORY]
"""
import argparse, csv, datetime, hashlib, json, pathlib, tempfile, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCES={'player_stats':'https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats.csv','players':'https://github.com/nflverse/nflverse-data/releases/download/players/players.csv','draft':'https://github.com/nflverse/nflverse-data/releases/download/draft_picks/draft_picks.csv'}
TEAM_MAP={'GNB':'GB','KAN':'KC','NWE':'NE','NOR':'NO','SFO':'SF','TAM':'TB','SD':'LAC','SDG':'LAC','LA':'LAR','STL':'LAR','OAK':'LV','LVR':'LV','WSH':'WAS','RAM':'LAR','RAI':'LV','PHO':'ARI'}
def team(s):return TEAM_MAP.get(s,s)
def number(s):return int(float(s or 0))
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--source-dir');args=parser.parse_args()
 raw=pathlib.Path(args.source_dir) if args.source_dir else pathlib.Path(tempfile.mkdtemp(prefix='bradyillion-import-'));raw.mkdir(parents=True,exist_ok=True)
 if not args.source_dir:
  for name,url in SOURCES.items():print('Downloading',name);urllib.request.urlretrieve(url,raw/(name+'.csv'))
 files={name:raw/(name+'.csv') for name in SOURCES};rows={name:list(csv.DictReader(p.open())) for name,p in files.items()}
 players={r['gsis_id']:{'id':r['gsis_id'],'name':r['display_name'],'label':f"{r['position']} · {r['rookie_season'] or '?'}–{r['last_season'] or '?'}",'type':'player','aliases':list(dict.fromkeys(filter(None,[r['short_name'],f"{r['first_name']} {r['last_name']}",f"{r['common_first_name']} {r['last_name']}" ])))} for r in rows['players']}
 pfr_to_id={r['pfr_id']:r['gsis_id'] for r in rows['players'] if r['pfr_id']};draft=[]
 for r in rows['draft']:
  if not 1980<=number(r['season'])<=2024:continue
  pid=pfr_to_id.get(r['pfr_player_id']) or r['gsis_id'] or 'draft:'+r['pfr_player_id']
  franchise='IND' if r['team']=='BAL' and number(r['season'])<=1983 else 'ARI' if r['team']=='STL' and number(r['season'])<=1987 else 'TEN' if r['team']=='HOU' and number(r['season'])<2002 else team(r['team'])
  players.setdefault(pid,{'id':pid,'name':r['pfr_player_name'],'label':f"{r['position']} · drafted {r['season']}",'type':'player','aliases':[]})
  draft.append({'id':pid,'year':number(r['season']),'round':number(r['round']),'pick':number(r['pick']),'team':franchise,'position':r['position'],'college':r['college']})
 stats=['passing_yards','passing_tds','attempts','rushing_yards','rushing_tds','carries','receiving_yards','receiving_tds','receptions'];seasons={};team_seasons={};games=[]
 for r in rows['player_stats']:
  if r['season_type']!='REG' or not 1999<=number(r['season'])<=2024:continue
  pid=r['player_id'];yr=number(r['season']);tm=team(r['recent_team'])
  players.setdefault(pid,{'id':pid,'name':r['player_display_name'],'label':f"{r['position']} · {yr}",'type':'player','aliases':list(filter(None,[r['player_name']]))})
  s=seasons.setdefault((pid,yr),{'id':pid,'year':yr,'positions':[],'teams':[],'games':0,**{k:0 for k in stats}})
  if r['position'] and r['position'] not in s['positions']:s['positions'].append(r['position'])
  if number(r['attempts'])+number(r['carries'])+number(r['receptions'])>0 and tm not in s['teams']:s['teams'].append(tm)
  s['games']+=1
  for k in stats:s[k]+=number(r[k])
  ts=team_seasons.setdefault((pid,yr,tm),{'id':pid,'year':yr,'team':tm,**{k:0 for k in stats}})
  for k in stats:ts[k]+=number(r[k])
  games.append({'id':pid,'year':yr,'week':number(r['week']),'team':tm,**{k:number(r[k]) for k in ['passing_yards','passing_tds','rushing_yards','rushing_tds','receiving_yards','receiving_tds','receptions']}})
 assert set(s['year'] for s in seasons.values())==set(range(1999,2025)),'Missing season coverage'
 assert all(s['games']<=18 for s in seasons.values()),'Possible duplicate weekly records'
 aliases={'00-0033873':['Patrick Mahomes II','Mahomes'],'00-0031235':['Odell Beckham','OBJ'],'00-0023459':['Aaron Rodgers'],'00-0019596':['Tom Brady','Brady'],'00-0033077':['Dak Prescott'],'00-0039163':['C.J. Stroud','CJ Stroud'],'00-0033886':['T.J. Watt','TJ Watt']}
 for pid,names in aliases.items():
  if pid in players:players[pid]['aliases']=list(dict.fromkeys(players[pid]['aliases']+names))
 out=ROOT/'data';out.mkdir(exist_ok=True)
 def save(name,value):(out/name).write_text(json.dumps(value,separators=(',',':'),ensure_ascii=False)+'\n')
 save('entities.json',sorted(players.values(),key=lambda p:p['id']));save('seasons.json',sorted(seasons.values(),key=lambda s:(s['year'],s['id'])));save('team-seasons.json',sorted(team_seasons.values(),key=lambda s:(s['year'],s['id'],s['team'])));save('games.json',games);save('draft.json',draft)
 content_hash=hashlib.sha256(''.join(hashlib.sha256(files[n].read_bytes()).hexdigest() for n in sorted(files)).encode()).hexdigest()[:12]
 manifest={'version':'nflverse-1999-2024-'+content_hash,'importedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'license':'CC BY 4.0 as declared by nflverse-data DESCRIPTION; individual source-owner terms still apply','licenseReference':'https://github.com/nflverse/nflverse-data/blob/master/DESCRIPTION','seasonCoverage':[1999,2024],'draftCoverage':[1980,2024],'counts':{'sourceWeeklyRows':len(rows['player_stats']),'regularSeasonRows':len(games),'postseasonRowsExcluded':sum(r['season_type']=='POST' for r in rows['player_stats']),'playerSeasons':len(seasons),'playerIdentities':len(players),'draftPicks':len(draft)},'sources':[{'name':n,'url':SOURCES[n],'sha256':hashlib.sha256(files[n].read_bytes()).hexdigest(),'rows':len(rows[n])} for n in SOURCES],'knownLimitations':['No statistical coverage before 1999 or after 2024.','No complete defense, coaching, Super Bowl, stadium or award histories; those templates are disabled.','Team connections require a regular-season pass attempt, carry or reception, not mere roster membership.','Draft selections cover 1980–2024; no claim of all-time draft completeness.','No live statistics or inferred current records.']}
 save('manifest.json',manifest);print(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
