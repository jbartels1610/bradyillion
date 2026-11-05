# NFL data, definitions, and limits

The checked-in bank contains **3,250 distinct predicates and 3,250 distinct complete eligible sets** within the stated source coverage, comprising 127,418 question-answer pairs. Every published question has at least 10 eligible answers (mean 39.21, maximum 467). There are no wording-only variants. The reproducible audit is `npm run questions:audit`; the saved report is `data/question-audit.json`.

| Category | Published questions |
| --- | ---: |
| Draft room | 600 |
| Defense (draft positions only) | 373 |
| College pipeline | 600 |
| Connections | 209 |
| Pass catchers | 600 |
| Ground game | 406 |
| Franchises | 141 |
| Quarterbacks | 321 |

## Sources and attribution

Statistics and identity data are sourced from the **nflverse contributors**, [nflverse-data](https://github.com/nflverse/nflverse-data). Its [DESCRIPTION](https://github.com/nflverse/nflverse-data/blob/master/DESCRIPTION) declares **CC BY 4.0**. The nflreadr project additionally notes that underlying NFL data belong to their respective owners and remain governed by their terms. Retain this attribution. A separate source-rights review remains necessary before commercial public launch; repository licensing alone is not a blanket rights guarantee.

The exact download URLs, SHA-256 checksums, import timestamp, counts, declared coverage, known limitations, and content-derived dataset version are in `data/manifest.json`. No external data request occurs during answer submission.

| Imported material | Records |
| --- | ---: |
| Public identity-source rows | 24,864 |
| Canonical imported player identities, with historical source additions | 24,958 |
| Regular-season weekly statistic rows, 1999–2024 | 128,878 |
| Player-season aggregates, 1999–2024 | 15,102 |
| Draft picks, 1980–2024 | 12,413 |
| Current NFL franchise identities | 32 |

The original statistics CSV contains 134,470 rows. Its 5,592 postseason rows are excluded. The current identity source can include players' later display names and activity dates; this does not expand statistical question coverage beyond 2024. Only a stable canonical ID joins identities to facts.

## Definitions

- **Season** means NFL season year, not the year of its January games. Only completed 1999–2024 regular seasons are included.
- **Season totals** sum all included regular-season weeks for a player, including multiple teams in a traded player's season. A team-constrained player question explicitly says “full-season totals.”
- **Game records** remain separate from season totals and preserve season/week as evidence.
- **Offensive touch** in a connection prompt means at least one pass attempt, carry, or reception in a regular-season game. Mere roster, practice-squad, preseason, or postseason membership does not qualify. The wording states this narrower relationship.
- **Franchise milestones** aggregate a player's statistics for that franchise within a season, so traded players' production for other teams does not count toward a franchise's threshold.
- **Franchise aliases** resolve historical locations to current franchise identity. Houston Oilers map to Tennessee; Baltimore Colts map to Indianapolis; Ravens remain distinct. Historical draft names also distinguish St. Louis Cardinals from Rams by draft year and LA Raiders from Rams. Team-in-a-specific-season identity prompts are not generated.
- **Draft selection** refers to the recorded NFL draft year, pick, round, college and position. Drafted running-back prompts include FB; defensive-back prompts include source DB/CB/S/FS/SS position labels. Awards and subsequent NFL appearance are not inferred from draft position.
- An unknown name does not establish ineligibility. The interface offers reporting; moderation never automatically changes ranked scores.

## Generation and rarity

`lib/questions/generate.ts` evaluates parameterized season thresholds, game thresholds, franchise constraints, full-season team relationships, draft positions, draft colleges and franchise draft histories. Every accepted predicate computes all source-backed eligible entities, with exact qualifying evidence. Unsupported historical periods and unsupported fact types have no enabled template.

Generation evaluates 24,664 candidate predicates. It rejects insufficient eligible counts, overly broad pools, exact duplicate eligible sets, and detected near duplicates. Eight deterministic MinHash buckets identify likely near-duplicate pairs; an exact Jaccard comparison rejects pairs at or above 0.97. This is detection, not proof that every similar pair was found. At most 600 deterministic questions per category are retained to fit the deployment memory budget. Omitted candidates do not inflate the published count.

Rarity is an **editorial estimate**, not measured popularity. The scoring model combines configurable recognition (0.55), question-context prominence (0.35), and recency (0.10). Covered statistical production, draft prominence, and reviewed star exceptions inform the initial recognition proxy; it is imperfect and requires editorial review. The question context orders each qualifying pool independently, so an entity does not receive a universal rarity score. Small answer pools cannot receive GOAT merely because a name is obscure. Each answer preserves model version, numerical input explanation, fixed tier, and points. Game snapshots freeze these values; aggregate submissions do not silently recalibrate live scores.

## Refresh and verification

```sh
python3 scripts/import-data.py
npm run questions:generate
npm run questions:audit
npm test
```

The importer uses Python's standard library and normal HTTPS certificate verification. To reprocess an already downloaded source snapshot, pass `--source-dir` containing `player_stats.csv`, `players.csv`, and `draft.csv`. Downloads are versioned by content checksums; the source release URLs may change later, so a future refresh can legitimately produce a new version and audited bank. Refreshes should be reviewed before publishing future challenges.

The audit regenerates predicates from normalized source facts and compares the persisted bank's IDs, texts, signatures, eligible entities, fixed scores, dataset versions, evidence and provenance. It reports category/era/difficulty distributions, all rejection reasons, answer counts, tier counts and coverage gaps. Unit tests cover aliases, ambiguity, unrecognized names, franchise history, contextual tiers, distinct eligible sets, source provenance and exclusion of postseason totals.

Runtime loads only the 2.2 MB compressed bank and canonical identity file. The large raw normalized fact files are used by the offline generator and audit. This keeps the application suitable for a modest Render preview instance.

## Unsupported content

There are no complete pre-1999 or post-2024 statistics, defensive season/game histories, coaches, awards, Hall of Fame membership, Super Bowl results, stadiums, or live scores. Those prompts remain disabled. This is a substantial verified baseline for playtesting, with named coverage limits; it does not claim every category in the master specification is finished or every qualifying fact from all of NFL history is imported.
