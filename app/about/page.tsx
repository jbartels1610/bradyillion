import Link from "next/link";

export const metadata = {
  title: "About the data · Bradyillion",
  description: "Where Bradyillion's NFL facts come from, how answers are checked, and what rarity means.",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Bradyillion home"><span className="brand-mark" aria-hidden="true">B</span>BRADYILLION<span style={{ color: "var(--accent, #c6f75d)" }}>.</span></Link>
        <Link href="/" className="nav-link">Back to the game ↗</Link>
      </header>
      <main style={{ maxWidth: 900, margin: "70px auto 90px" }}>
        <p className="eyebrow">THE PLAYBOOK / OUR DATA</p>
        <h1 className="page-title" style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", lineHeight: 1, margin: "18px 0 24px" }}>Real football.<br />Real answers.</h1>
        <p className="muted" style={{ maxWidth: 660, fontSize: "1.15rem", lineHeight: 1.7 }}>Great deep cuts deserve better than a guess. Every playable question is backed by a defined dataset, deterministic rules, and a qualifying fact you can review after your round.</p>

        <section className="panel prose" style={{ padding: "clamp(22px, 4vw, 40px)", marginTop: 36 }} aria-labelledby="coverage-title">
          <p className="eyebrow">01 / THE SOURCE MATERIAL</p>
          <h2 id="coverage-title" style={{ margin: "12px 0 16px" }}>A defined field of play</h2>
          <p>Bradyillion uses structured records from the <a href="https://github.com/nflverse/nflverse-data" target="_blank" rel="noreferrer">nflverse data project</a>. The statistical import contains 134,470 player records across the completed 1999–2024 seasons: 128,878 regular-season records and 5,592 postseason records. Playable statistical questions use the regular-season records. Draft records begin in 1980 and have their own explicit year limits.</p>
          <p>Questions state the seasons and scope covered by their source data. A modern dataset is never treated as a complete record of all NFL history.</p>
          <p>Statistics are separated by regular season and postseason. A season means the NFL season year, which can include playoff games in the following calendar year. A franchise is a continuing team identity; historical team names resolve to that franchise when the question asks for a franchise.</p>
          <p>Questions about coaching, awards, defensive statistics, Hall of Fame membership, or older eras are available only when an imported source supports their exact conditions. Unsupported categories stay out of the playable bank.</p>
          <p className="muted">The nflverse-data project declares CC BY 4.0. Individual NFL source data retain their owners’ terms, so a separate terms review is needed before commercial launch. The repository preserves source references, attribution, dataset coverage, import details, and known limitations.</p>
        </section>

        <section className="panel prose" style={{ padding: "clamp(22px, 4vw, 40px)", marginTop: 20 }} aria-labelledby="answers-title">
          <p className="eyebrow">02 / FAIR CALLS</p>
          <h2 id="answers-title" style={{ margin: "12px 0 16px" }}>Your answer is checked against facts</h2>
          <p>The game normalizes names, punctuation, initials, and approved aliases before checking the complete eligible answer set for a question. An ambiguous name requires clarification; the game does not choose the person who happens to qualify.</p>
          <p>Autocomplete searches the relevant entity database, including names that do not qualify for the current question. It never shows rarity or eligibility while a round is active.</p>
          <p>A recognized answer that does not meet the conditions uses one of your three attempts. Unknown text does not use an attempt, but the clock keeps running. Think something was missed? Use the answer-report control after a round so it can be reviewed with the question and dataset version.</p>
        </section>

        <section className="panel prose" style={{ padding: "clamp(22px, 4vw, 40px)", marginTop: 20 }} aria-labelledby="scoring-title">
          <p className="eyebrow">03 / RARITY, EXPLAINED</p>
          <h2 id="scoring-title" style={{ margin: "12px 0 16px" }}>The deep cut is the whole point</h2>
          <p>Rarity belongs to an answer <em>in the context of a question</em>, rather than to one player forever. Launch scores use deterministic editorial estimates. They are not claims about how often real players have submitted that answer.</p>
          <div style={{ overflowX: "auto", margin: "24px 0" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <caption style={{ textAlign: "left", marginBottom: 12, fontWeight: 700 }}>The five scoring tiers</caption>
              <thead><tr><th style={{ padding: "10px 0", borderBottom: "1px solid #ffffff25" }} scope="col">Tier</th><th style={{ padding: "10px 0", borderBottom: "1px solid #ffffff25", textAlign: "right" }} scope="col">Points</th></tr></thead>
              <tbody>{[["Practice Squad", 10], ["Rookie", 20], ["Starter", 40], ["Pro Bowler", 75], ["GOAT", 100]].map(([tier, points]) => <tr key={tier}><th scope="row" style={{ padding: "12px 0", fontWeight: 500, borderBottom: "1px solid #ffffff12" }}>{tier}</th><td style={{ padding: "12px 0", textAlign: "right", borderBottom: "1px solid #ffffff12", fontVariantNumeric: "tabular-nums" }}>{points}</td></tr>)}</tbody>
            </table>
          </div>
          <p>Seven rounds. A two-second question preview, then exactly 25 seconds to answer. Every correct answer earns at least 10 points; the maximum game score is 700. Daily questions and scoring are shared and frozen for the UTC date, with a fresh challenge at 00:00 UTC.</p>
          <p>The server stores ranked progress and enforces round deadlines. Refreshing or switching tabs does not restart your timer. Unlimited and archive games are unranked practice.</p>
        </section>

        <section className="prose" style={{ padding: "30px 0 0" }} aria-labelledby="independent-title">
          <h2 id="independent-title">An independent game for football fans</h2>
          <p className="muted">Bradyillion is an independent trivia game. It is not affiliated with, sponsored by, or endorsed by the NFL, any NFL franchise, or Tom Brady. Player and team names identify factual records. All visual branding is original.</p>
          <p className="muted">The name is a working game title. Any commercial launch requires a review of naming, trademark, endorsement, and data-licensing rights.</p>
          <Link href="/" className="button" style={{ display: "inline-flex", marginTop: 20 }}>Get back on the field ↗</Link>
        </section>
      </main>
      <footer className="site-footer"><span>BRADYILLION · A GAME OF UNCOMMON KNOWLEDGE</span><Link href="/">Play the daily</Link></footer>
    </div>
  );
}
