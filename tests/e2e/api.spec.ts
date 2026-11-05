import { test, expect, type APIRequestContext } from '@playwright/test';
import type { publicGame } from '../../lib/game/engine';
type PublicGame = ReturnType<typeof publicGame>;

async function create(request: APIRequestContext, mode = 'daily') {
  const response = await request.post('/api/game', { data: { mode } });
  expect(response.ok(), await response.text()).toBeTruthy();
  return (await response.json()).game as PublicGame;
}
async function action(request: APIRequestContext, id: string, action: string, extra = {}) {
  const snapshot = await request.get(`/api/game/${id}`);
  const current = (await snapshot.json()).game as PublicGame;
  const response = await request.post(`/api/game/${id}`, { data: { action, roundIndex: current.roundIndex, ...extra } });
  expect(response.ok(), await response.text()).toBeTruthy();
  return response.json();
}
async function active(request: APIRequestContext) {
  let game: PublicGame | undefined;
  await expect.poll(async () => {
    const response = await request.get('/api/game');
    game = (await response.json()).game;
    return game?.status;
  }, { timeout: 8_000, intervals: [250, 500] }).toBe('active');
  return game!;
}

test('daily snapshots, clock, unknown answers, and skipped seven-round result persist on the server', async ({ request }) => {
  let game = await create(request);
  expect(game.status).toBe('intro');
  expect(game.rounds).toHaveLength(7);
  expect(game.rounds.slice(1).every((round: PublicGame['rounds'][number]) => round.question === null)).toBe(true);
  expect(JSON.stringify(game)).not.toContain('entityId');
  game = (await action(request, game.id, 'start')).game;
  expect(game.status).toBe('preview');
  const deadline = game.current!.deadline;
  expect(game.current!.deadline! - game.current!.previewEndsAt!).toBe(25_000);
  const resumed = await create(request);
  expect(resumed.id).toBe(game.id);
  expect(resumed.current!.deadline).toBe(deadline);
  game = await active(request);
  const unknown = await action(request, game.id, 'submit', { answer: 'zzzz-not-an-nfl-entity' });
  expect(unknown.game.current!.incorrectAttempts).toBe(0);
  expect(unknown.feedback.kind).toBe('unknown');
  for (let round = 0; round < 7; round++) {
    game = await active(request);
    expect(game.roundIndex).toBe(round);
    game = (await action(request, game.id, 'skip')).game;
    expect(game.status).toBe('result');
    expect(game.current!.result!.points).toBe(0);
    const retry = await action(request, game.id, 'skip');
    expect(retry.game).toMatchObject({ total: 0, roundIndex: round });
    game = (await action(request, game.id, 'next')).game;
  }
  expect(game.status).toBe('complete'); expect(game.total).toBe(0); expect(game.correct).toBe(0);
  expect(game.rounds.every((round: PublicGame['rounds'][number]) => round.result!.reason === 'Round skipped.')).toBe(true);
  const loaded = await request.get('/api/game');
  expect((await loaded.json()).game.status).toBe('complete');
  const replay = await create(request);
  expect(replay.id).toBe(game.id); expect(replay.status).toBe('complete');
});

test('CSRF cross-origin mutations and unauthenticated administration are rejected', async ({ request }) => {
  const response = await request.post('/api/game', { headers: { Origin: 'https://unrelated.example' }, data: { mode: 'daily' } });
  expect([400, 403]).toContain(response.status());
  const admin = await request.get('/api/admin');
  expect([401, 403, 503]).toContain(admin.status());
});

test('seven sourced correct answers are scored once; practice progress and ownership are enforced', async ({ request, playwright, baseURL }) => {
  const { getQuestion } = await import('../../lib/questions');
  let game = await create(request, 'practice');
  game = (await action(request, game.id, 'start')).game;
  let expectedTotal = 0;
  for (let round = 0; round < 7; round++) {
    await expect.poll(async () => {
      const response = await request.get(`/api/game/${game.id}`);
      game = (await response.json()).game;
      return game.status;
    }, { timeout: 8_000, intervals: [250, 500] }).toBe('active');
    const question = getQuestion(game.current!.question!.id);
    expect(question).toBeTruthy();
    const answer = question!.answers[0];
    expect(answer.evidence.length).toBeGreaterThan(5);
    const accepted = await action(request, game.id, 'submit', { answer: answer.name, entityId: answer.entityId });
    game = accepted.game;
    expect(game.status).toBe('result');
    expect(game.current!.result).toMatchObject({ points: answer.points, answer: answer.name });
    expectedTotal += answer.points;
    const duplicate = await action(request, game.id, 'submit', { answer: answer.name, entityId: answer.entityId });
    expect(duplicate.game.total).toBe(expectedTotal);
    game = (await action(request, game.id, 'next')).game;
  }
  expect(game).toMatchObject({ status: 'complete', correct: 7, total: expectedTotal });
  expect(game.total).toBeLessThanOrEqual(700);
  const outsider = await playwright.request.newContext({ baseURL });
  const response = await outsider.get(`/api/game/${game.id}`);
  expect(response.status()).toBe(404);
  await outsider.dispose();
});
