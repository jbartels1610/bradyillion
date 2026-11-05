# CODEX MASTER DEVELOPMENT PROMPT
# BRADYILLION — THE ULTIMATE DAILY NFL KNOWLEDGE GAME

## 0. YOUR ROLE AND OBJECTIVE

You are an expert full-stack developer, professional game designer, UI/UX specialist, NFL historian, sports data engineer, and quality-assurance engineer.

Your job is to **build a complete, polished, fully functional NFL knowledge game called Bradyillion.**

This is intended to become a real, publicly accessible daily browser game, not a demonstration or school project.

The game should draw inspiration from the engaging gameplay format of Krillion, but feature exclusively NFL-related questions, an original football-inspired identity, and an independently developed answer database and rarity scoring system.

**Do not simply provide a development plan. Actually implement the game.**

Create the source files, install dependencies, build the database, write the gameplay logic, design the website, test the functionality, and prepare the application for deployment.

The finished product should feel like a professionally developed game that NFL fans would genuinely enjoy playing every day.

### Core priorities

1. Extremely enjoyable, addictive gameplay.
2. Accurate NFL knowledge and historical statistics.
3. Thousands of creative, open-ended NFL questions.
4. A rarity-based scoring system that rewards unusual answers.
5. A complete and reliable player/answer database.
6. A beautiful, football-themed user interface.
7. Fast, responsive mobile and desktop performance.
8. Daily challenges, unlimited mode, and player statistics.
9. Fair gameplay and reliable answer validation.
10. An architecture capable of supporting thousands of users.

The game must work, not merely look like it works.

---

# 1. THE FUNDAMENTAL GAME CONCEPT

## 1.1 What is Bradyillion?

Bradyillion is a daily NFL trivia game built around a simple concept:

**Anyone can give a correct answer. The challenge is giving a correct answer that nobody else thinks of.**

Players are presented with broad, open-ended NFL trivia prompts.

For example:

"Name an NFL quarterback who has thrown for at least 4,000 yards in a single regular season."

The player might answer Patrick Mahomes, Peyton Manning, Tom Brady, or another qualifying quarterback.

All valid answers receive points, but less obvious answers receive significantly more.

The player is trying to find the most uncommon valid answer they can remember before the timer runs out.

This creates a combination of:

- NFL trivia knowledge.
- Creativity.
- Memory.
- Strategic thinking.
- Risk versus reward.
- Competition with other NFL fans.

The game should produce moments where a player remembers an obscure running back, forgotten quarterback, or unusual historical fact and feels genuinely rewarded for knowing it.

## 1.2 Basic game structure

The main daily game contains exactly **seven rounds**.

Each round:

1. Displays one NFL-related prompt.
2. Gives the player a short preview before the timer starts.
3. Starts a 25-second countdown.
4. Allows the player to type an answer.
5. Validates the answer against the NFL database.
6. Awards rarity-based points for a correct answer.
7. Displays the answer's rarity tier.
8. Allows the player to advance to the next round.

Each player receives the same seven daily questions.

The maximum possible daily score is 700 points.

The player should be able to complete a full game in approximately three to five minutes, including result screens.

The game must be accessible without creating an account.

## 1.3 The fundamental rule

**A question must not have only one intended correct answer.**

The majority of prompts should have dozens or hundreds of valid answers.

For example:

GOOD QUESTION:

"Name a player who has won Super Bowl MVP."

BAD QUESTION:

"Who won Super Bowl MVP in Super Bowl XLIX?"

The first encourages original thinking.

The second is conventional trivia with a single answer.

Bradyillion should primarily reward recall and originality, rather than the ability to remember one exact fact.

---

# 2. EXACT ROUND MECHANICS

## 2.1 Starting the daily game

The homepage displays a prominent button:

**PLAY TODAY'S BRADYILLION**

After clicking it, the player sees a short introductory screen:

"7 Rounds. 25 Seconds Each. Rare Answers Win."

Include a "Kick Off" button.

The game should not begin counting down until the player explicitly starts.

## 2.2 Question preview

Before each round, show a two-second question preview.

The player should see the complete question during the preview, but cannot submit an answer until the 25-second window begins.

Keep this process consistent between rounds.

The preview must not introduce excessive waiting.

The preview phase is also an opportunity for a subtle football-themed animation.

## 2.3 Countdown timer

Each round lasts exactly 25 seconds.

Display a prominent countdown.

Suggested behavior:

- 25–11 seconds: Normal countdown.
- 10–6 seconds: Timer becomes more visually noticeable.
- 5–1 seconds: Stronger visual urgency.
- 0 seconds: Automatically lock the round.

Include an optional ticking-sound setting, disabled by default.

Support reduced-motion preferences.

The timer must not restart because the player refreshes the page, changes browser tabs, or temporarily loses network connectivity.

For ranked games, time expiration must be enforced server-side using authoritative timestamps.

The server should be able to reject late submissions.

Handle reasonable network latency and race conditions consistently.

## 2.4 Answer entry

Provide a large, prominent answer field directly below the question.

Placeholder:

"Think of a rare answer..."

The player should be able to press Enter or click Submit.

Support:

- Player names.
- Team names.
- Coaches.
- Stadiums when relevant.
- Colleges when relevant to NFL draft history.
- Other explicitly defined answer types.

Implement case-insensitive matching and normalized punctuation.

Support common aliases, nicknames, initials, suffixes, and reasonable spelling variations.

For example:

- Patrick Mahomes II / Patrick Mahomes.
- Odell Beckham Jr. / Odell Beckham.
- T.J. Watt / TJ Watt.
- C.J. Stroud / CJ Stroud.

Only accept aliases that map unambiguously to a canonical entity.

If a name could refer to multiple players, provide a clarification interface.

Do not silently choose a player based solely on the current question's answer set, because that could reveal eligibility.

### Autocomplete

Autocomplete should help users find names without accidentally revealing whether those names are correct answers.

Important:

- Search across the full relevant NFL entity database.
- Do not restrict suggestions to correct answers.
- Do not expose rarity scores in autocomplete.
- Do not show "valid for this question" indicators.
- Provide efficient keyboard navigation.
- Prioritize accuracy over aggressive fuzzy matching.

## 2.5 Answer attempts

Allow a maximum of **three incorrect recognized answers per round** during the 25-second window.

This prevents players from brute-forcing the answer database.

An accepted correct answer immediately locks the round.

An incorrect but recognized NFL entity consumes one incorrect attempt.

A clear spelling error or unknown text should produce a correction message without consuming an attempt, although the timer continues running.

After three incorrect recognized submissions:

- Award zero points.
- End the round.
- Show a concise explanation.
- Allow the player to advance.

An expired timer also awards zero points if no valid answer was locked.

Never allow the player to replace a successfully submitted answer after seeing its rarity score.

## 2.6 Correct answer feedback

After a valid answer, display a football-themed result card.

Example:

**CORRECT!**

Patrick Mahomes

**+20 POINTS**

**ROOKIE**

"Correct answer. A familiar name that plenty of fans will remember."

The example tier above is illustrative, not a permanent classification for that player.

Where applicable, provide a concise verified fact explaining why the answer qualifies.

For instance:

"Mahomes exceeded 4,000 regular-season passing yards in the 2018 season."

The evidence must correspond to the question.

Do not generate unverified facts.

## 2.7 Incorrect answer feedback

An incorrect response should show:

"That doesn't fit this question."

Where useful, provide a brief reason.

Example:

"That player does not have a qualifying season in the verified database."

Do not show the full list of valid answers while the round remains active.

Avoid frustrating or sarcastic error messages.

## 2.8 Moving to the next round

After the result is displayed, the player controls when to continue.

Show a button:

**NEXT ROUND**

Do not immediately start another 25-second countdown while the player is reading their result.

The next question should load quickly.

## 2.9 Skipping

Include a Skip button.

Skipping:

- Immediately ends the active round.
- Awards zero points.
- Cannot be undone.
- Advances to the results screen for that round.

---

# 3. ORIGINAL FOOTBALL SCORING SYSTEM

The rarity scoring system is central to Bradyillion.

Implement five distinct scoring categories with football-inspired names.

| Tier | Points | Description |
|---|---|---|
| Practice Squad | 10 | Obvious, highly recognizable answer |
| Rookie | 20 | Familiar answer |
| Starter | 40 | Somewhat uncommon answer |
| Pro Bowler | 75 | Obscure and impressive answer |
| GOAT | 100 | Exceptional, unusually memorable deep-cut answer |

These are mandatory initial tier names and point values.

Incorrect answers earn zero points.

Every correct answer must earn at least 10 points.

Seven GOAT-tier answers produce the maximum possible score of 700.

## 3.1 Rarity depends on the question

The most important scoring rule:

**A player or team must not have one universal rarity rating.**

Tom Brady might be extremely obvious when the question is about Super Bowl-winning quarterbacks.

However, a very specific qualifying question could make Brady a less obvious response.

Similarly, a relatively obscure NFL player should not automatically receive 100 points for every question.

Rarity must be attached to the combination of:

- Question.
- Canonical answer.
- Estimated likelihood that players would remember that answer in this context.

## 3.2 Initial editorial scoring

At launch, the game will not have real answer-popularity data.

Do not fabricate such data.

Implement a deterministic initial scoring model using editorial rarity estimates.

Consider:

- General player name recognition.
- Career prominence.
- Pro Bowl and All-Pro recognition.
- NFL awards.
- Major career achievements.
- Historical period.
- Relationship to the question.
- How obvious the answer is for that particular category.
- Whether the question specifically calls attention to a famous accomplishment.
- Manually reviewed exceptions.

Do not assume that fewer career statistics automatically make someone a rarer answer.

For example, if a question asks about first-overall draft picks, a well-known player and a forgotten historical pick should receive different ratings based on plausible recall difficulty.

If a player is obscure generally but famous for the precise fact in the question, account for that.

Use configurable editorial scoring weights.

Record the score and reasoning used for each answer.

## 3.3 GOAT-tier answers

The 100-point tier should feel special.

Prefer reserving it for especially surprising but indisputably correct responses.

For some challenges, there may be several GOAT-tier answers.

Do not invent GOAT answers purely to ensure every question contains a 100-point option.

The player should feel genuinely excited when they earn 100.

Display a distinctive but tasteful animation for GOAT answers.

## 3.4 Real player frequency data

Prepare the scoring engine for eventual calibration using actual answer submissions.

Record anonymized aggregate counts of:

- Which prompt was shown.
- Which answer was submitted.
- Whether it was valid.
- How frequently each valid answer was selected.
- How many total players answered the prompt.

Actual player frequencies may inform future rarity calculations.

Use smoothing and minimum sample thresholds so early results are not distorted by a handful of players.

Do not retroactively change scores for already active daily games.

All players attempting a particular daily challenge must compete under a frozen scoring snapshot.

## 3.5 Preventing scoring exploits

Prevent:

- Repeated submissions after a correct answer.
- Refreshing to replace a locked answer.
- Changing browser data to modify scores.
- Selecting different answers after reviewing results.
- Using the same ranked attempt multiple times through normal application behavior.
- Submitting client-computed point totals.
- Artificial manipulation of popularity statistics through repeated automated requests.

The backend is authoritative for ranked game state and scoring.

---

# 4. NFL QUESTION CATEGORIES

The game needs tremendous variety.

It must cover the entire NFL, not just Tom Brady, quarterbacks, and Super Bowls.

Implement the following major question categories.

## 4.1 Quarterbacks

Examples:

- Name an NFL quarterback who has thrown for 4,000+ yards in a regular season.
- Name a quarterback drafted in the first round.
- Name a quarterback who has started a Super Bowl.
- Name a quarterback who has thrown 30+ touchdown passes in one regular season.
- Name a quarterback who played for at least three NFL franchises.
- Name a quarterback who won a regular-season MVP award.
- Name a quarterback drafted after the first round who later started a Super Bowl.
- Name a quarterback who recorded at least 300 passing yards in a postseason game.

## 4.2 Running backs

Examples:

- Name a player with a 1,000-yard rushing season.
- Name a running back selected in the first round.
- Name a running back who played for multiple franchises.
- Name a running back who reached 10,000 career rushing yards.
- Name a player with at least 15 rushing touchdowns in one regular season.
- Name a running back who earned a first-team All-Pro selection.

## 4.3 Wide receivers and tight ends

Examples:

- Name a receiver with a 1,000-yard receiving season.
- Name a tight end who has appeared in a Super Bowl.
- Name a player with 100+ receptions in one regular season.
- Name a receiver drafted outside the first round who earned a Pro Bowl selection.
- Name a player who had 10+ receiving touchdowns in a regular season.
- Name a receiver who played for four or more NFL franchises.

## 4.4 Defensive players

Examples:

- Name a defensive player with a 10-sack season.
- Name a player who won Defensive Player of the Year.
- Name a defensive back selected in the first round.
- Name a player who recorded at least six interceptions in one regular season.
- Name a defensive player who won Super Bowl MVP.
- Name a linebacker who earned a first-team All-Pro selection.

## 4.5 NFL teams and franchises

Examples:

- Name an NFL franchise that has won a Super Bowl.
- Name a franchise that has appeared in at least three Super Bowls.
- Name a franchise that changed its city or team name.
- Name an NFL franchise that has had a winless regular season.
- Name a franchise that has drafted a future Hall of Fame player.
- Name a franchise with at least 12 regular-season wins in a specified season range.

When questions involve teams, distinguish between the current team identity and historical franchise identity.

## 4.6 Super Bowls and playoffs

Examples:

- Name a Super Bowl MVP.
- Name a quarterback who won multiple Super Bowls as a starting quarterback.
- Name a player who caught a touchdown in a Super Bowl.
- Name a head coach who has won a Super Bowl.
- Name a team that lost a Super Bowl.
- Name a player with multiple postseason games of 100+ receiving yards.

## 4.7 NFL Draft

Examples:

- Name a player drafted first overall.
- Name a player drafted in the seventh round who later made a Pro Bowl.
- Name a quarterback drafted in the top 10.
- Name a player from Alabama selected in the first round.
- Name a player drafted by one franchise who later won a Super Bowl with another.
- Name a player selected in the NFL Draft after 2010 who earned first-team All-Pro honors.

## 4.8 Coaches

Examples:

- Name a head coach who has appeared in a Super Bowl.
- Name a coach with at least 100 regular-season wins.
- Name a coach who has led multiple NFL franchises.
- Name a former NFL player who later became an NFL head coach.
- Name an NFL Coach of the Year award winner.

## 4.9 NFL history

Examples:

- Name an NFL MVP from before 2000.
- Name an NFL player inducted into the Pro Football Hall of Fame.
- Name a player who played in the NFL during the 1980s.
- Name a quarterback who played for the Oakland Raiders.
- Name a player who spent part of his career with the Houston Oilers.
- Name a player who won a recognized NFL rushing title.

Historical questions need reliable historical data. Do not generate them from incomplete modern datasets.

## 4.10 Player connections

These should be particularly fun.

Examples:

- Name a player who appeared in a regular-season game for both the Patriots and Buccaneers.
- Name a player who played for both the Packers and Vikings.
- Name a quarterback who played for two specified franchises.
- Name a player who played for a team coached by Bill Belichick.
- Name a player who was teammates with a specified quarterback during a particular season.
- Name a player who played for at least three franchises in his career.

Generate hundreds of variations using verified career and roster relationships.

## 4.11 Records and unusual achievements

Examples:

- Name a player with a 200-yard receiving game.
- Name a player who scored at least four touchdowns in one game.
- Name a quarterback who threw six touchdown passes in one game.
- Name a player who had a 90+ yard touchdown play.
- Name a player who returned a kickoff for a touchdown in a postseason game.
- Name a player who recorded 20+ sacks in a regular season.

Use exact, verified data.

Make sure game-level, season-level, and career-level statistics are never confused.

## 4.12 Creative compound questions

These may be among the game's best categories.

Examples:

- Name a quarterback who played for at least three franchises AND started a Super Bowl.
- Name a first-round draft pick who played for both the Cowboys and Packers.
- Name a player who won a Super Bowl AND was drafted after the third round.
- Name a running back who reached 1,000 rushing yards for two different franchises.
- Name an NFL MVP who played for more than one franchise.
- Name a Pro Bowler who played for the Detroit Lions before 2015.

The question generator must be capable of combining verified facts into creative challenges.

Every logical condition must be validated independently.

---

# 5. NFL DATABASE REQUIREMENTS

The quality of the answer database will determine whether Bradyillion succeeds.

A correct answer that the database fails to recognize is one of the most frustrating experiences a trivia game can create.

**Prioritize comprehensive answer coverage over an artificially large number of questions.**

## 5.1 Player database

Implement canonical player records with:

- Unique player ID.
- Full legal or commonly recognized playing name.
- Display name.
- Known aliases.
- Position or positions.
- Years active.
- NFL franchises played for.
- Season-by-season team records.
- Draft year.
- Draft round.
- Draft selection number.
- Drafting franchise.
- College, where reliably available.
- Pro Bowl selections.
- First-team All-Pro selections.
- MVP awards.
- Other supported awards.
- Super Bowl appearances and championships, where verified.
- Hall of Fame status, where verified.
- Career statistical records.
- Individual season records.
- Individual game records, where supported.
- Source references.
- Data freshness information.

Do not assume a player's most recent position or team describes their entire career.

## 5.2 Franchise database

Include:

- All 32 current NFL franchises.
- Historical franchise identities.
- Former locations.
- Former team names.
- Conference and division history where available.
- Season-by-season records.
- Super Bowl appearances.
- Super Bowl championships.
- Stadium history where available.
- Franchise relationships and aliases.

For example, historical Oakland Raiders, Los Angeles Raiders, and Las Vegas Raiders references must follow a clear, documented franchise-identity policy.

If a question asks for a franchise, historical aliases may resolve to one canonical franchise.

If it asks for a team in a particular season, the historical identity matters.

## 5.3 Coach database

Include verified head-coaching records:

- Canonical coach ID.
- Name.
- Aliases.
- NFL franchises coached.
- Coaching seasons.
- Regular-season records.
- Playoff records.
- Super Bowl appearances and wins.
- Awards.
- Other verified attributes.

Do not substitute assistant-generated guesses when historical coaching information is unavailable.

## 5.4 Statistical coverage

Prioritize a reliable statistical baseline covering the modern NFL era, with particular emphasis on seasons from 1999 through the latest fully verified season.

Expand historical coverage as reliable datasets are imported.

Do not imply that modern play-by-play datasets are complete for the entire history of professional football.

For every question template, calculate whether the available dataset adequately covers the period requested.

If it does not, disable the question.

Examples:

- Modern player statistics can be generated from appropriately verified seasonal data.
- Older Hall of Fame membership and award history may require separate curated data.
- Detailed historical game events must only be used if sufficient trustworthy records exist.

Do not generate all-time questions from a dataset that starts in 1999.

## 5.5 Suggested data sources

Investigate:

- nflverse datasets and releases: https://github.com/nflverse/nflverse-data
- nflfastR ecosystem and documentation.
- Pro Football Reference for factual cross-checking where access and usage terms allow.
- Pro Football Hall of Fame records.
- Official NFL historical records, subject to permitted access and licensing.
- Licensed or otherwise authorized football data providers.

Use structured data rather than relying on an AI model to decide statistical facts.

Review the licensing and usage restrictions of every dataset before importing or deploying it.

Build an ingestion pipeline that can import permitted data and normalize it into a consistent internal format.

Do not scrape websites in violation of their access restrictions.

Do not make live external API calls for every answer submission.

Cache approved source data in the application's database.

## 5.6 Important statistical definitions

Define explicitly:

- Regular season versus postseason.
- NFL season year versus calendar year.
- Player appearance versus being on an offseason roster.
- Super Bowl appearance versus Super Bowl championship.
- Starting quarterback versus backup quarterback.
- Career stats versus season stats versus game stats.
- Franchise membership versus current franchise name.
- First-team All-Pro versus other All-Pro recognition.
- Pro Bowl selection versus actually playing in the Pro Bowl.
- Official versus unofficial historical sack statistics.
- Award name and awarding organization.

These definitions must be applied consistently.

For example, if a question says a player "played for" a team, define that as appearing in at least one qualifying regular-season or postseason game, according to the displayed question's rules.

A player who only participated in a preseason game should not automatically qualify.

Make data assumptions available on an About the Data page.

---

# 6. ANSWER VALIDATION ENGINE

Build a deterministic NFL fact-validation system.

Do not ask an AI model whether a submitted answer is correct during gameplay.

## 6.1 Validation process

When an answer is submitted:

1. Normalize the user's input.
2. Search the relevant canonical entity type.
3. Resolve approved aliases.
4. Handle ambiguous names.
5. Identify the canonical entity ID.
6. Evaluate that entity against the question's logical predicates.
7. Determine validity.
8. Retrieve the frozen rarity tier.
9. Return the score and a verified explanation.
10. Save the result server-side.

## 6.2 Full eligible-answer sets

For each generated question, calculate all verified qualifying entities in the covered dataset.

Do not only store a handful of expected responses.

If 148 players satisfy the question, the system should recognize all 148.

If the data supports 700 qualifying players, all 700 should be eligible.

Never deliberately reject a correct answer merely because it was not considered popular enough to appear on a small hand-written list.

## 6.3 Ambiguous answers

Some NFL players share names.

Do not automatically resolve those names to whichever candidate happens to satisfy the question.

Instead, ask the user to choose the intended individual from a small list of matching entities.

This clarification must not reveal which option is correct.

The timer continues during clarification.

## 6.4 Missing-answer reporting

Include a way for users to report:

"My answer should have counted."

Reports must store:

- Question ID.
- Submitted answer.
- Intended player or entity if identifiable.
- Reason for rejection.
- Dataset version.
- Relevant evidence if the user supplies it.

Provide a moderation workflow for reviewing these reports.

Do not automatically award points based on unverified user reports.

---

# 7. AUTOMATIC QUESTION GENERATION

I want Bradyillion to have enough questions to remain fresh for years.

Do not manually hardcode 100 questions and repeatedly recycle them.

Implement a genuine question-generation engine.

## 7.1 Target content volume

The initial target is:

**At least 3,000 distinct, verified, playable question instances.**

Also include a smaller hand-reviewed collection of especially engaging questions for daily use.

Do not count changes in wording as separate questions.

The generator must produce demonstrably different NFL challenges.

## 7.2 Question templates

Each template should consist of:

- Unique template ID.
- Question category.
- Logical constraints.
- Required data fields.
- Question text generator.
- Answer entity type.
- Eligibility evaluator.
- Difficulty estimate.
- Rarity calculation method.
- Explanation generator.
- Source requirements.

Example template:

`PLAYER_PLAYED_FOR_BOTH_TEAMS`

Parameters:

- Franchise A.
- Franchise B.
- Optional season range.

Generated question:

"Name an NFL player who appeared for both the Packers and Vikings."

Eligibility:

The player has qualifying appearances for both franchises.

Another template:

`QB_PASSING_YARDS_THRESHOLD`

Parameters:

- Minimum yards.
- Season range.

Generated question:

"Name an NFL quarterback who threw for at least 4,500 yards in a single regular season between 2000 and 2025."

Eligibility:

The player has at least one verified qualifying season.

The dataset must establish whether all relevant years are sufficiently covered.

## 7.3 Parameterized generation

Use combinations of:

- Player position.
- Franchise.
- Season.
- Decade.
- Career milestones.
- Draft position.
- Award.
- Statistical threshold.
- Playoff achievement.
- Team-history relationship.
- Compound criteria.

This allows hundreds or thousands of distinct, data-verifiable prompts.

## 7.4 Answer-count requirements

Favor questions with at least 10 correct answers.

For the standard daily mode, ideally choose questions with 15–200 valid answers.

Allow carefully reviewed exceptions if they are especially interesting.

Reject questions with zero correct answers.

Avoid questions with just one intended answer.

Do not make questions so broad that almost every NFL player qualifies.

## 7.5 Question diversity

Each daily seven-question set should contain a balanced selection of categories.

A suggested daily distribution:

- One quarterback-related question.
- One running back, wide receiver, or tight end question.
- One defense-related question.
- One NFL history question.
- One franchise or Super Bowl question.
- One draft, coaching, or awards question.
- One creative wildcard question.

This is a starting framework, not a permanent rigid formula.

Rotate categories so the game doesn't feel predictable.

Avoid too many quarterback questions in a single day.

Fans of different NFL eras, positions, and franchises should all have opportunities to shine.

## 7.6 Difficulty progression

Use a varied difficulty curve.

Suggested:

- Round 1: Accessible.
- Round 2: Accessible to moderate.
- Round 3: Moderate.
- Round 4: Moderate.
- Round 5: Moderate to challenging.
- Round 6: Challenging.
- Round 7: Creative or memorable final question.

The final question should feel like a satisfying finale.

Do not make all seven prompts obscure.

The game's challenge should primarily come from choosing rare answers, not simply recognizing what the question means.

## 7.7 Deduplication

Do not count these as different questions:

"Name a player who played for both Green Bay and Minnesota."

"Name a player who played for both Minnesota and Green Bay."

Their predicates are identical.

Use canonical question signatures.

Also detect near-duplicate questions that have substantially overlapping answer sets.

Track question usage history to prevent excessive repetition.

## 7.8 Validation before publication

Before publishing a question:

1. Verify every required dataset exists.
2. Calculate eligible answers.
3. Check historical completeness.
4. Verify the exact wording.
5. Estimate difficulty.
6. Assign preliminary answer rarity.
7. Check answer-count thresholds.
8. Check for duplicates.
9. Check recent question history.
10. Freeze the generated question and scoring data.

If a question fails validation, reject it.

Do not silently substitute invented answers.

## 7.9 Content auditing

Implement commands similar to:

`npm run questions:generate`

`npm run questions:audit`

The audit must report:

- Total generated questions.
- Number passing validation.
- Number rejected.
- Exact rejection reasons.
- Count by question category.
- Count by era.
- Average number of valid answers.
- Minimum and maximum valid-answer counts.
- Difficulty distribution.
- Duplicate count.
- Rarity distribution.
- Data coverage gaps.

Actually run the audit.

Do not claim that 3,000 questions exist unless the application can demonstrate them.

---

# 8. DAILY CHALLENGE SYSTEM

## 8.1 One shared challenge

Every player receives the same seven questions on the same UTC date.

Daily questions must be frozen before the day begins.

Use 00:00 UTC as the default daily reset.

Show a countdown until the next daily game.

## 8.2 Daily attempt policy

Players should receive one ranked attempt per daily game.

Allow anonymous gameplay without login.

Use persistent, secure anonymous session identification.

Store game progress server-side.

A refresh must not reset the score or timer.

Completed daily challenges cannot be restarted as ranked attempts through the normal interface.

## 8.3 Deterministic scoring

Every player's answer to the same daily question must be scored using the same frozen scoring data.

Never change a score in the middle of the day based on new answer popularity.

Changes to rarity estimates should apply to future questions.

## 8.4 Daily archive

Create an Archive page.

Allow players to replay previous daily question sets in unranked mode.

Archive games should not affect daily streaks or leaderboards.

Display their original question date and number.

---

# 9. UNLIMITED MODE

Include a fully functional Unlimited Mode.

Players should be able to:

- Play additional randomized seven-question games.
- Practice NFL trivia indefinitely.
- Receive rarity scores.
- Play different question sets.
- Track practice statistics separately.
- Choose optional categories or eras.

Suggested category filters:

- All NFL.
- Quarterbacks.
- Offensive players.
- Defense.
- Super Bowls.
- Draft history.
- NFL history.
- Teams and coaches.

Provide three broad difficulty options for practice only:

- Casual.
- Standard.
- Expert.

The standard daily game must use the same difficulty for everyone.

Unlimited Mode must not alter ranked daily scores.

---

# 10. DESIGN AND VISUAL IDENTITY

This is extremely important.

**Bradyillion needs to look and feel like a real football game, not a generic trivia application.**

Develop a distinct football-inspired design.

Do not copy Krillion's underwater theme, graphics, wording, or branding.

## 10.1 Visual direction

The design should feel like a combination of:

- A modern NFL broadcast scoreboard.
- A polished sports video game.
- A clean daily puzzle website.
- A stylish football statistics application.

Use an original visual identity.

Suggested colors:

- Deep midnight navy.
- Dark charcoal.
- Off-white.
- Muted metallic silver.
- Electric green for successful answers.
- Gold for the GOAT tier.

Do not use official team branding in the site's visual identity.

Use typography that feels sporty but still readable.

Avoid clutter.

## 10.2 Logo

Create a simple custom Bradyillion wordmark.

Consider:

- Bold lettering.
- Subtle football-inspired shapes.
- A stylized field or yard-line motif.
- An original football icon.

Do not use:

- NFL shield.
- Patriots logo.
- Buccaneers logo.
- Tom Brady's photograph or signature.
- Official Super Bowl trophy imagery.
- Other protected branded assets without appropriate rights.

The logo should be original and work at small sizes.

## 10.3 Homepage

Build a polished homepage featuring:

**BRADYILLION**

"Seven rounds. Twenty-five seconds. One shot at greatness."

A prominent start button.

Supporting text:

"Think you know football? The obvious answer won't get you very far."

Display:

- Today's challenge number.
- Time until the next game.
- Play Daily.
- Unlimited Mode.
- How to Play.
- Statistics.
- Leaderboard, if available.

Use a football-field-inspired visual without overwhelming the interface.

## 10.4 Game interface

The primary gameplay screen should show:

- Bradyillion wordmark.
- Round number.
- Total score.
- Current question.
- Prominent 25-second timer.
- Answer input.
- Submit button.
- Incorrect attempts remaining.
- Seven-round progress display.

A small seven-segment progress indicator can resemble a football scoreboard.

Keep the primary question readable.

Mobile usability is the priority.

## 10.5 Field progression mechanic

Add a distinctive visual way to show score progress.

I recommend a stylized football field.

Each round can represent an offensive drive.

When the player scores points, a football marker advances down a miniature 100-yard field by a distance proportional to that round's 0–100 point result.

For example:

- 10 points = 10 yards.
- 20 points = 20 yards.
- 40 points = 40 yards.
- 75 points = 75 yards.
- 100 points = 100 yards.

This is an illustrative visual metaphor, not an actual simulation of football scoring.

After seven rounds, the total score can also be displayed as total Bradyillion yards earned.

Keep the conventional numerical score prominent so players aren't confused.

Do not make the football animation slow.

## 10.6 Rarity animations

Each tier should have a distinctive result style.

**Practice Squad — 10**

Muted gray, subtle feedback.

**Rookie — 20**

Light blue, modest animation.

**Starter — 40**

Green or teal, positive feedback.

**Pro Bowler — 75**

Purple or silver, more impressive animation.

**GOAT — 100**

Gold, celebratory animation.

GOAT answers should feel exciting.

Use restrained particle effects, scoreboard lighting, or football-inspired motion.

Do not interrupt gameplay with long cinematic animations.

Support reduced-motion settings.

## 10.7 Responsive layout

Design for:

- Mobile phones.
- Tablets.
- Laptop screens.
- Desktop monitors.

The site must function beautifully at approximately 360px viewport width.

No horizontal scrolling.

Use large touch targets and readable text.

Keep the answer input visible when mobile keyboards open.

## 10.8 Sound effects

Optional sounds could include:

- Subtle stadium ambience.
- Successful answer confirmation.
- Countdown warning.
- GOAT-tier celebration.

Sounds must be optional and muted by default.

Do not use copyrighted broadcast audio, announcer recordings, or music without permission.

---

# 11. RESULTS SCREEN

After the seventh round, display a polished post-game report.

Include:

- Final score out of 700.
- Correct answers out of seven.
- Highest-scoring answer.
- Number of GOAT answers.
- Average points per question.
- Rarity tier breakdown.
- Individual round results.
- Current streak.
- Personal best.
- Share button.

Example:

**BRADYILLION**

**FINAL SCORE: 485/700**

5 correct answers

1 GOAT answer

2 Pro Bowlers

1 Starter

1 Rookie

2 Misses

The displayed totals must match actual round results.

Do not fabricate comparison statistics.

## 11.1 Shareable results

Create a shareable, spoiler-free text summary.

Example:

BRADYILLION 🏈  
Daily #001  
Score: 485/700  

🟡🟣🟢⚫🟣🔵⚫

5/7 Correct  
1 GOAT  

Can you beat me?

[Game URL]

The squares should correspond to the actual rarity tiers.

Use a configurable real domain once deployed.

Support copying results and native device sharing when available.

## 11.2 Post-game answer exploration

After completing the daily challenge, let players review each question.

Show:

- Their answer.
- Their rarity tier.
- Their score.
- A verified qualifying fact.
- Several interesting alternative correct answers.

Do not reveal other answers during the active round.

Include an option to hide spoilers when viewing shared results.

---

# 12. PLAYER STATISTICS

Track:

- Daily games played.
- Current streak.
- Longest streak.
- Best score.
- Average score.
- Correct-answer percentage.
- Total GOAT answers.
- Pro Bowler answers.
- Lifetime points.
- Practice games played.

Save statistics persistently.

Avoid fake rankings or fake comparison percentages.

Use local preferences for nonessential interface settings, but store authoritative ranked results on the server.

---

# 13. LEADERBOARDS

Implement a leaderboard architecture for comparing player performance.

Suggested categories:

- Today's top scores.
- Weekly top scores.
- All-time personal bests.

Display:

- Rank.
- Anonymous nickname.
- Score.
- Correct answers.
- Date or challenge ID.

Do not require an account to play.

Implement rate limits and reasonable protections against automated score manipulation.

Do not display fabricated users or scores.

If a reliable public leaderboard cannot be completed immediately, keep it disabled rather than displaying fake data.

---

# 14. ADMIN DASHBOARD

Build a protected administrator interface for managing the game.

I want to be able to:

1. View upcoming daily challenges.
2. Preview every question and its valid answers.
3. Review rarity classifications.
4. Adjust individual answer tiers.
5. Replace a question before publication.
6. Review player-submitted correction reports.
7. Inspect question-generation statistics.
8. See which questions players struggle with.
9. View anonymized answer-frequency statistics.
10. Manage approved data imports.
11. Review upcoming challenge diversity.
12. Regenerate unassigned future challenges.
13. Publish a curated question set.
14. Check database freshness.

Admin access must be properly authenticated.

The administrator should not need to edit application code to change a question or scoring tier.

Changes to future puzzles should be straightforward.

Prevent edits to active ranked scoring snapshots unless a documented emergency correction procedure is used.

---

# 15. TECHNICAL STACK

Unless the existing project requires otherwise, use:

**Frontend**

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Accessible UI components.
- Lucide icons or equivalent.

**Backend**

- Next.js server-side routes/actions.
- TypeScript.
- Structured NFL validation engine.
- Dedicated scoring engine.
- Dedicated question-generation engine.

**Database**

- PostgreSQL.
- Prisma ORM or another reliable typed ORM.

**Validation**

- Zod.

**Testing**

- Vitest.
- Playwright.

**Development**

- npm.
- Environment configuration.
- Automated linting.
- Clear project organization.

Keep the technology stack maintainable.

Do not add external services without a clear reason.

## 15.1 Suggested database entities

Create models for:

- Player.
- PlayerAlias.
- Franchise.
- FranchiseHistory.
- PlayerSeason.
- PlayerGameStatistic.
- PlayerTeamTenure.
- DraftPick.
- Coach.
- CoachTenure.
- Award.
- AwardWinner.
- SuperBowl.
- NFLSeason.
- DataSource.
- DataVersion.
- QuestionTemplate.
- QuestionInstance.
- QuestionEligibleAnswer.
- AnswerRarity.
- RarityModelVersion.
- DailyChallenge.
- AnonymousPlayer.
- GameSession.
- GameRound.
- PlayerStatistics.
- AnswerSubmissionAggregate.
- ReportedAnswerIssue.

Normalize relationships appropriately.

You may consolidate or expand entities based on actual engineering needs.

## 15.2 Server-side authority

The server controls:

- Question selection.
- Accepted answers.
- Current round.
- Timer deadlines.
- Attempt counts.
- Locked answers.
- Point awards.
- Daily completion.
- Ranked game results.

The browser must not be able to modify its total score.

## 15.3 Security

Implement:

- Secure anonymous session cookies.
- Server-side validation.
- Submission rate limiting.
- Idempotent round submissions.
- Database transactions.
- CSRF protection where applicable.
- Safe input handling.
- Protected admin routes.
- Environment-variable secrets.
- Reasonable anti-cheating protections.

A double-click or network retry must not award points twice.

---

# 16. QUESTION-GENERATION SOFTWARE ARCHITECTURE

Separate the game into independent modules.

Suggested structure:

`app/` — Website routes and layouts.

`components/` — Shared user-interface components.

`components/game/` — Timer, answer input, question cards, scoreboard, rarity results.

`components/admin/` — Administrative tools.

`lib/nfl/` — NFL data relationships, player identity matching, fact validation.

`lib/questions/` — Question templates, parameter generation, eligibility rules.

`lib/scoring/` — Rarity estimates, editorial overrides, score snapshots, calibration.

`lib/game/` — Game state transitions, timed rounds, submission handling.

`lib/daily/` — Daily question selection, reset, reproducibility.

`lib/server/` — Database services, authorization, rate limiting.

`data/` — Versioned NFL data imports and fixtures.

`scripts/` — NFL importers, data validation, question generation, audits.

`tests/` — Unit, integration, and browser tests.

`docs/` — Architecture, licenses, data definitions, deployment.

Do not put all logic into a single React component.

---

# 17. DATA REFRESH AND HISTORICAL ACCURACY

NFL data changes throughout the season.

The question system must handle this safely.

## 17.1 Dataset versioning

Every dataset import should record:

- Source.
- Import date.
- Season coverage.
- Licensing notes.
- Version identifier.
- Completeness status.
- Known limitations.

## 17.2 Current NFL statistics

Do not automatically incorporate incomplete games or ongoing live statistics into daily answer sets.

Use completed and validated source data.

Where statistical corrections are possible, prefer frozen datasets for published daily challenges.

New imports should apply to future challenge generation.

## 17.3 Historical coverage

Support questions involving past eras only when the underlying sources adequately cover those eras.

Make the generator exclude unsupported historical categories.

Do not use a modern NFL statistics dataset as proof that no older player qualifies.

## 17.4 Data provenance

For a player who qualifies for a question, preserve enough source information to explain the qualification.

For example:

Question:

"Name a quarterback with a 4,000-yard passing season."

Answer explanation:

"[Player] passed for [verified yards] during the [verified season] regular season."

Populate those values from data.

Never ask an AI model to invent the explanation.

---

# 18. AUTOMATED TESTING

I expect a thoroughly tested application.

## 18.1 Answer-validation tests

Test:

- Correct full names.
- Common abbreviations.
- Name suffixes.
- Typographical errors.
- Ambiguous player names.
- Incorrect players.
- Incorrect teams.
- Correct historical franchise aliases.
- Players with multiple franchises.
- Players with multiple positions.
- Regular-season versus postseason statistics.
- Correct award recognition.
- Missing historical data.
- Unverified answers.

## 18.2 Scoring tests

Verify:

- Practice Squad always awards 10.
- Rookie awards 20.
- Starter awards 40.
- Pro Bowler awards 75.
- GOAT awards 100.
- Invalid answers award 0.
- Scores cannot exceed 700.
- Daily scores are frozen.
- Duplicate submissions do not award points twice.
- Rarity belongs to the question-answer combination.
- Editorial overrides are applied consistently.

## 18.3 Timer tests

Test:

- Timer starts correctly.
- Question preview ends correctly.
- Submission before deadline.
- Submission exactly at deadline.
- Submission after deadline.
- Refresh during an active round.
- Network interruption.
- Browser tab switching.
- Multiple simultaneous submission requests.
- Expiration after three incorrect attempts.

## 18.4 Question-generation tests

Verify:

- Every generated prompt has the required verified answer set.
- Missing data blocks publication.
- No invalid answer is intentionally included.
- Duplicate prompts are detected.
- Historical coverage is respected.
- Rarity calculations remain valid.
- Question text matches actual logical conditions.
- The content audit reports accurate totals.

## 18.5 Full gameplay tests

Automate a complete seven-round daily game.

Test:

- Seven correct answers.
- Seven incorrect answers.
- Mixed correct and incorrect rounds.
- Timer expirations.
- Refresh and resume.
- Practice games.
- Daily completion.
- Shareable results.
- Leaderboard submission.
- Mobile responsiveness.

## 18.6 UI quality

Run browser tests for desktop and mobile.

Fix:

- Overflow.
- Broken input focus.
- Poor keyboard behavior.
- Inaccessible controls.
- Incorrect timer display.
- Incorrect score calculations.
- Unresponsive buttons.
- Layout defects.

Do not claim testing was completed if tests were not actually run.

---

# 19. DEVELOPMENT PHASES

Build Bradyillion systematically.

## Phase 1: Foundation

- Initialize the project.
- Configure TypeScript and styling.
- Build the homepage.
- Establish original branding.
- Set up the database.
- Implement basic navigation.

## Phase 2: NFL data engine

- Import verified NFL data.
- Normalize player identities.
- Build franchise history relationships.
- Implement player and team aliases.
- Create the initial statistical query system.
- Add validation tests.

## Phase 3: Question generator

- Implement question templates.
- Generate verified eligible-answer sets.
- Implement duplicate detection.
- Generate the initial content bank.
- Run content audits.
- Create a curated daily-question selection process.

## Phase 4: Scoring

- Implement the five rarity tiers.
- Build contextual initial rarity estimates.
- Add editorial score overrides.
- Freeze daily scoring.
- Store award explanations.

## Phase 5: Gameplay

- Implement the daily game.
- Implement seven rounds.
- Implement the 25-second timer.
- Implement answer entry.
- Implement three incorrect attempts.
- Implement server validation.
- Implement the results flow.
- Implement persistent ranked sessions.

## Phase 6: Visual design

- Refine the homepage.
- Build the football-field progress animation.
- Implement rarity-tier animations.
- Improve scoreboard styling.
- Optimize mobile layouts.
- Add accessibility features.

## Phase 7: Additional features

- Unlimited Mode.
- Archive.
- Player statistics.
- Shareable results.
- Leaderboard, if ready.
- Admin dashboard.
- Missing-answer reports.

## Phase 8: Launch preparation

- Run all tests.
- Review data completeness.
- Run the question-bank audit.
- Check licensing and attribution requirements.
- Test mobile performance.
- Test security and submission handling.
- Prepare deployment instructions.
- Document unresolved issues.

---

# 20. LEGAL AND BRANDING CONSIDERATIONS

The intended game name is Bradyillion, inspired by Tom Brady.

Use this name for the working prototype.

However, before public commercial launch, flag the need to review potential trademark, endorsement, and name/likeness rights issues.

Do not imply that Tom Brady, the NFL, or any NFL team officially sponsors or endorses this game.

Do not use Tom Brady's photograph, signature, official team logos, NFL shield, or proprietary broadcast material without appropriate rights.

Build an original football-themed identity.

Make the game name configurable if a later branding change becomes necessary.

Add an appropriate independent-game disclaimer.

Review third-party sports data licenses and any required attribution before deployment.

---

# 21. NON-NEGOTIABLE REQUIREMENTS

1. **Every question must be about the NFL.**

2. **The game must reward rare correct answers.**

3. **Each daily game contains exactly seven questions.**

4. **Every question has a 25-second answer window.**

5. **Most questions must have many possible correct answers.**

6. **All answers must be validated against real NFL facts.**

7. **Correct answers earn 10, 20, 40, 75, or 100 points.**

8. **Incorrect answers earn zero.**

9. **The maximum score is 700 points.**

10. **All players receive the same daily question set.**

11. **The game must contain substantial question variety.**

12. **The question generator must support thousands of verified challenges.**

13. **The visual design must feel premium and genuinely football-inspired.**

14. **The website must work on mobile and desktop.**

15. **Players must be able to play without registering.**

16. **Daily scores must be stored and calculated server-side.**

17. **The timer and ranked round attempts must be enforced reliably.**

18. **The game must recognize legitimate alternate player names.**

19. **The game must never knowingly reject verified correct answers merely because the answer wasn't anticipated in a short manual list.**

20. **There must be no fake statistics, fake leaderboards, or nonfunctional interface controls presented as complete.**

---

# 22. SUCCESS CRITERIA

The application is ready for initial playtesting when:

- [ ] The homepage is polished and responsive.
- [ ] Daily challenges work.
- [ ] The game displays seven NFL questions.
- [ ] Every round has a working 25-second timer.
- [ ] Players can submit real NFL names.
- [ ] Answers are validated correctly.
- [ ] Incorrect attempts are counted.
- [ ] Valid answers receive appropriate rarity scores.
- [ ] The game uses all five scoring tiers.
- [ ] The scoreboard updates correctly.
- [ ] The football-themed interface looks professional.
- [ ] The results screen works.
- [ ] Sharing works.
- [ ] Daily progress is saved.
- [ ] Unlimited Mode works.
- [ ] A validated question bank exists.
- [ ] A question-generation audit runs successfully.
- [ ] Historical facts use appropriately complete sources.
- [ ] Basic automated tests pass.
- [ ] The website can run locally using documented commands.
- [ ] The project has reasonable deployment instructions.

The application must be genuinely playable from beginning to end.

---

# 23. FINAL DEVELOPMENT INSTRUCTIONS

First inspect the current working directory.

If an existing application is present, understand its structure before making changes. Do not overwrite unrelated projects or files.

If no project exists, initialize a new Next.js application.

Develop the features in a logical order, prioritizing a playable, accurate daily game.

Do not stop after creating the homepage.

Do not stop after generating a few example questions.

Do not create a visually convincing but nonfunctional demonstration.

Actually implement:

- The NFL database.
- The answer-validation engine.
- The question generator.
- The rarity scoring engine.
- The daily game logic.
- The timer.
- The results page.
- The user interface.
- The necessary persistent storage.
- The tests.

Run the available development and testing commands.

Fix discovered errors.

If a data source is unavailable or a particular historical category cannot be verified, report that limitation clearly and continue building supported functionality.

Do not fabricate missing data to make the project appear more complete.

After implementation, provide:

1. The local website address.
2. Commands to run the application.
3. A summary of completed features.
4. The exact number of validated generated questions.
5. The number and coverage of imported NFL records.
6. The status of automated tests.
7. Any unimplemented features.
8. Remaining work before public launch.

**My goal is to make Bradyillion an exceptionally fun, competitive NFL knowledge game that people actually want to play every day.**

Players should constantly be choosing between an obvious answer they know is correct and a more obscure answer that might earn them GOAT-tier points.

The fun comes from remembering something other people forget.

Make that feeling the central experience of Bradyillion.

**BEGIN BUILDING THE APPLICATION NOW.**
