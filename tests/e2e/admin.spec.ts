import { test, expect } from '@playwright/test';
import type { Question } from '../../lib/questions';

test('authenticated admin schedules future content, edits rarity, moderates reports, and cannot change today', async ({ request }) => {
  test.skip(!process.env.E2E_ADMIN_TOKEN, 'Set E2E_ADMIN_TOKEN to the test server ADMIN_TOKEN to validate protected editing.');
  const headers = { Authorization: `Bearer ${process.env.E2E_ADMIN_TOKEN}` };
  const loaded = await request.get('/api/admin', { headers });
  expect(loaded.ok(), await loaded.text()).toBeTruthy();
  const dashboard = await loaded.json() as { questions: Question[]; totalQuestions: number };
  expect(dashboard.totalQuestions).toBeGreaterThanOrEqual(3_000);
  const questions = dashboard.questions.slice(0, 7);
  const futureDate = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
  const scheduled = await request.post('/api/admin', {
    headers, data: { action: 'schedule', date: futureDate, questionIds: questions.map(question => question.id) },
  });
  expect(scheduled.ok(), await scheduled.text()).toBeTruthy();
  const firstAnswer = questions[0].answers[0];
  const changed = await request.post('/api/admin', {
    headers, data: { action: 'rarity', date: futureDate, questionId: questions[0].id, entityId: firstAnswer.entityId, tier: 'Starter' },
  });
  expect(changed.ok(), await changed.text()).toBeTruthy();
  const reloaded = await request.get('/api/admin', { headers });
  const updated = await reloaded.json() as { challenges: { date: string; questions: Question[] }[] };
  const challenge = updated.challenges.find(item => item.date === futureDate);
  expect(challenge?.questions[0].answers.find(answer => answer.entityId === firstAnswer.entityId)).toMatchObject({ points: 40, tier: 'Starter' });
  const blocked = await request.post('/api/admin', {
    headers, data: { action: 'rarity', date: new Date().toISOString().slice(0, 10), questionId: questions[0].id, entityId: firstAnswer.entityId, tier: 'GOAT' },
  });
  expect(blocked.status()).toBe(400);
  const report = await request.post('/api/reports', { data: { questionId: questions[0].id, answer: firstAnswer.name, reason: 'Automated test report for moderation workflow', evidence: firstAnswer.source } });
  expect(report.ok(), await report.text()).toBeTruthy();
  const reportDashboard = await request.get('/api/admin', { headers });
  const reports = (await reportDashboard.json()).reports as { id: string; reason: string; status: string }[];
  const created = reports.find(item => item.reason === 'Automated test report for moderation workflow');
  expect(created).toBeTruthy();
  const reviewed = await request.post('/api/admin', { headers, data: { action: 'report', id: created!.id, status: 'reviewed' } });
  expect(reviewed.ok(), await reviewed.text()).toBeTruthy();
  const final = await request.get('/api/admin', { headers });
  const finalReports = (await final.json()).reports as { id: string; status: string }[];
  expect(finalReports.find(item => item.id === created!.id)?.status).toBe('reviewed');
});
