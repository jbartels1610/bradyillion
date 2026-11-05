"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";

type Answer = { entityId: string; name: string; points: number; tier: string; evidence: string; source: string };
type Question = { id: string; text: string; category: string; answers: Answer[] };
type Report = { id: string; question_id: string; answer: string; reason: string; evidence: string; status: string; created_at: string };
type Dashboard = {
  datasetVersion: string;
  totalQuestions: number;
  categories: string[];
  questions: Question[];
  challenges: { date: string; questions: Question[]; dataset_version: string }[];
  reports: Report[];
  frequencies: { question_id: string; entity_id: string; valid: boolean; submissions: number }[];
  scoring: { version: string; calibrated: boolean; note: string };
};

const tiers = ["Practice Squad", "Rookie", "Starter", "Pro Bowler", "GOAT"];
const card: CSSProperties = { background: "#121a1b", border: "1px solid #2b3636", borderRadius: 16, padding: 24, marginBottom: 24 };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,230px),1fr))", gap: 16 };
const field: CSSProperties = { background: "#0a1112", color: "#eef5ef", border: "1px solid #485451", borderRadius: 8, padding: "12px 14px", width: "100%", font: "inherit", minHeight: 44 };
const small: CSSProperties = { color: "#a4b3ac", fontSize: 13, overflowWrap: "anywhere" };
const row: CSSProperties = { padding: "14px 0", borderBottom: "1px solid #2b3636" };
const button: CSSProperties = { background: "#c8f858", border: 0, color: "#111a0a", borderRadius: 8, minHeight: 44, padding: "10px 16px", font: "inherit", fontWeight: 750, cursor: "pointer" };
const secondary: CSSProperties = { ...button, background: "#26352d", color: "#eef5ef" };

function Source({ url }: { url: string }) {
  if (!/^https:\/\//.test(url)) return null;
  return <a href={url} target="_blank" rel="noreferrer" style={{ color: "#c8f858", fontSize: 13 }}>Source ↗</a>;
}

function RarityEditor({ date, question, answer, busy, save }: { date: string; question: Question; answer: Answer; busy: boolean; save: (data: unknown) => Promise<boolean> }) {
  const [tier, setTier] = useState(answer.tier);
  return <div style={{ ...row, ...grid, alignItems: "center" }}>
    <div><strong>{answer.name}</strong><p style={small}>{answer.evidence}</p></div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}><label style={{ flex: 1 }}><span style={small}>Rarity tier</span><select style={field} value={tier} onChange={event => setTier(event.target.value)} disabled={busy}>{tiers.map(value => <option key={value}>{value}</option>)}</select></label><button type="button" style={secondary} disabled={busy || tier === answer.tier} onClick={() => save({ action: "rarity", date, questionId: question.id, entityId: answer.entityId, tier })}>Save</button></div>
  </div>;
}

export default function Admin() {
  const token = useRef("");
  const [candidate, setCandidate] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [date, setDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.parse(today) + 86_400_000).toISOString().slice(0, 10);

  async function request<T>(path: string, data?: unknown): Promise<T> {
    const response = await fetch(path, { cache: "no-store", credentials: "same-origin", headers: { Authorization: `Bearer ${token.current}`, ...(data ? { "Content-Type": "application/json" } : {}) }, ...(data ? { method: "POST", body: JSON.stringify(data) } : {}) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "The admin request failed.");
    return payload as T;
  }
  async function refresh() { setDashboard(await request<Dashboard>(`/api/admin?q=${encodeURIComponent(query)}`)); }
  async function unlock(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice(""); token.current = candidate;
    try { await refresh(); setCandidate(""); }
    catch (failure) { token.current = ""; setError((failure as Error).message); }
    finally { setBusy(false); }
  }
  async function save(data: unknown): Promise<boolean> {
    setBusy(true); setError(""); setNotice("");
    try { await request("/api/admin", data); await refresh(); setNotice("Saved. Active and completed challenges were preserved."); return true; }
    catch (failure) { setError((failure as Error).message); return false; }
    finally { setBusy(false); }
  }
  async function search(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await refresh(); } catch (failure) { setError((failure as Error).message); } finally { setBusy(false); }
  }
  function toggle(question: Question) {
    setSelected(previous => {
      const updated = { ...previous };
      if (updated[question.id]) delete updated[question.id];
      else if (Object.keys(updated).length < 7) updated[question.id] = question.text;
      return updated;
    });
  }

  return <main style={{ background: "#080f10", color: "#eef5ef", minHeight: "100vh", padding: "32px max(18px,calc((100vw - 1120px)/2))", fontFamily: "Arial,sans-serif", lineHeight: 1.5 }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, marginBottom: 32, flexWrap: "wrap" }}><div><a href="/" style={{ color: "#c8f858", fontWeight: 900, textDecoration: "none", letterSpacing: 2 }}>BRADYILLION</a><h1 style={{ margin: "10px 0 0", fontSize: 32 }}>The commissioner’s desk</h1><p style={small}>Question review, future challenges, and answer corrections.</p></div>{dashboard && <button type="button" style={secondary} onClick={() => { token.current = ""; setDashboard(null); setSelected({}); setNotice(""); setError(""); }}>Lock dashboard</button>}</header>
    {error && <p role="alert" style={{ ...card, borderColor: "#d88f80", color: "#ffbbac" }}>{error}</p>}
    {notice && <p role="status" style={{ ...card, borderColor: "#b4d755", color: "#d5f896" }}>{notice}</p>}
    {!dashboard ? <section style={{ ...card, maxWidth: 600 }}><h2>Administrator access</h2><p style={small}>Configure an ADMIN_TOKEN of at least 24 characters in your hosting environment. Access is disabled until that secret is set. Your token stays in this page’s memory and is cleared on reload or lock.</p><form onSubmit={unlock}><label htmlFor="admin-token">Admin token</label><input id="admin-token" style={{ ...field, margin: "8px 0 16px" }} type="password" autoComplete="off" value={candidate} onChange={event => setCandidate(event.target.value)} required minLength={24}/><button style={button} disabled={busy}>{busy ? "Checking access…" : "Unlock dashboard"}</button></form></section> : <>
      <section style={card}><h2 style={{ marginTop: 0 }}>Data &amp; scoring</h2><div style={grid}><div><strong style={{ fontSize: 28 }}>{dashboard.totalQuestions.toLocaleString()}</strong><p style={small}>Validated generated questions</p></div><div><strong>{dashboard.datasetVersion}</strong><p style={small}>{dashboard.categories.join(" · ")}</p></div><div><strong>{dashboard.scoring.version}</strong><p style={small}>{dashboard.scoring.note}</p></div></div><p style={small}>Data imports run through the documented import and audit commands. This dashboard does not accept uploaded or unverified NFL data.</p></section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Review the question bank</h2><form onSubmit={search} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}><label style={{ flex: 1, minWidth: "min(220px,100%)" }} htmlFor="question-query">Search question text or exact ID<input id="question-query" style={field} value={query} onChange={event => setQuery(event.target.value)} placeholder="Passing yards, draft, franchise…" maxLength={150}/></label><button type="submit" style={button} disabled={busy}>Search</button></form><p style={small}>Showing up to 50 matching questions. Open a question to inspect every eligible answer and its qualifying fact. Select exactly seven distinct questions to schedule a future daily.</p><div style={{ maxHeight: 680, overflowY: "auto" }}>{dashboard.questions.map(question => <article key={question.id} style={row}><div style={{ display: "flex", gap: 12, alignItems: "start" }}><input type="checkbox" aria-label={`Select question: ${question.text}`} checked={Boolean(selected[question.id])} onChange={() => toggle(question)} disabled={busy || (!selected[question.id] && Object.keys(selected).length >= 7)} style={{ width: 20, height: 20, marginTop: 4 }}/><details style={{ flex: 1, minWidth: 0 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{question.text}<p style={small}>{question.category} · {question.answers.length} eligible answers · {question.id}</p></summary>{question.answers.map(answer => <div key={answer.entityId} style={{ ...row, paddingLeft: 8 }}><strong>{answer.name}</strong> <span style={{ color: "#c8f858" }}>{answer.tier} · {answer.points} points</span><p style={small}>{answer.evidence}</p><Source url={answer.source}/></div>)}</details></div></article>)}</div>{dashboard.questions.length === 0 && <p>No questions match this search.</p>}</section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Schedule a future daily</h2><p>{Object.keys(selected).length}/7 questions selected</p>{Object.keys(selected).length > 0 && <ol>{Object.entries(selected).map(([id, text]) => <li key={id} style={{ paddingBottom: 8 }}>{text} <button style={{ ...secondary, minHeight: 32, padding: "4px 10px" }} onClick={() => setSelected(previous => { const next = { ...previous }; delete next[id]; return next; })}>Remove</button></li>)}</ol>}<form onSubmit={async event => { event.preventDefault(); if (await save({ action: "schedule", date, questionIds: Object.keys(selected) })) setSelected({}); }}><label htmlFor="schedule-date">Future date (UTC)</label><input id="schedule-date" style={{ ...field, margin: "8px 0 16px", maxWidth: 260, display: "block" }} type="date" min={tomorrow} value={date} onChange={event => setDate(event.target.value)} required/><button style={button} disabled={busy || Object.keys(selected).length !== 7 || !date || date <= today}>Publish these seven questions</button></form><p style={small}>Only future dates can change. Scheduling replaces that date’s complete seven-question snapshot; active ranked games remain immutable.</p></section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Published &amp; upcoming challenges</h2><p style={small}>The server prepares today and the next seven UTC dates at startup. Inspect all answers here; rarity edits apply only to future challenges.</p>{dashboard.challenges.map(challenge => <details key={challenge.date} style={row}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{challenge.date} {challenge.date <= today ? "· Locked" : "· Future"} <span style={small}>· {challenge.dataset_version}</span></summary>{challenge.questions.map((question, index) => <details key={`${challenge.date}-${question.id}`} style={{ ...row, marginLeft: 8 }}><summary style={{ cursor: "pointer" }}>Round {index + 1}: {question.text}</summary>{challenge.date > today ? question.answers.map(answer => <RarityEditor key={`${challenge.date}-${question.id}-${answer.entityId}-${answer.tier}`} date={challenge.date} question={question} answer={answer} busy={busy} save={save}/>) : question.answers.map(answer => <p key={answer.entityId} style={small}>{answer.name} · {answer.tier} · {answer.points} points</p>)}</details>)}</details>)}{dashboard.challenges.length === 0 && <p>No challenges have been stored yet.</p>}</section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Answer correction reports</h2><p style={small}>Review evidence before resolving a report. Moderation does not automatically award points or change active scores.</p>{dashboard.reports.length ? dashboard.reports.map(report => <article style={row} key={report.id}><h3>{report.answer}</h3><p>{report.reason}</p>{report.evidence && <p style={{ ...small, whiteSpace: "pre-wrap" }}>Submitted evidence: {report.evidence}</p>}<p style={small}>Question {report.question_id} · {new Date(report.created_at).toLocaleString()} · {report.status}</p><label>Status <select style={{ ...field, maxWidth: 240, marginLeft: 8 }} value={report.status} disabled={busy} onChange={event => save({ action: "report", id: report.id, status: event.target.value })}>{["open", "reviewed", "resolved", "dismissed"].map(value => <option key={value}>{value}</option>)}</select></label></article>) : <p>No correction reports have been submitted.</p>}</section>
      <section style={card}><h2 style={{ marginTop: 0 }}>Observed answer frequencies</h2><p style={small}>Aggregate recognized submissions only. These are real observed counts, including valid and invalid answers. They do not recalibrate frozen editorial scores.</p>{dashboard.frequencies.length ? <div style={{ overflowX: "auto" }}><table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: 13 }}><thead><tr><th style={row}>Question</th><th style={row}>Entity</th><th style={row}>Valid</th><th style={row}>Submissions</th></tr></thead><tbody>{dashboard.frequencies.map(item => <tr key={`${item.question_id}-${item.entity_id}-${item.valid}`}><td style={row}>{item.question_id}</td><td style={row}>{item.entity_id}</td><td style={row}>{item.valid ? "Yes" : "No"}</td><td style={row}>{item.submissions}</td></tr>)}</tbody></table></div> : <p>No recognized answers have been submitted yet.</p>}</section>
    </>}
    <footer style={{ ...small, margin: "32px 0" }}><a href="/" style={{ color: "#c8f858" }}>← Return to the game</a><p>Independent NFL knowledge game. Not affiliated with the NFL, its teams, or Tom Brady.</p></footer>
  </main>;
}
