import { test, expect, type Page } from '@playwright/test';

async function startDaily(page: Page) {
  await page.goto('/');
  const play = page.getByRole('button', { name: /PLAY TODAY’S BRADYILLION|RESUME TODAY’S GAME/i });
  await expect(play).toBeEnabled();
  await play.click();
  await page.getByRole('button', { name: 'KICK OFF' }).click();
  await expect(page.getByRole('combobox')).toBeEnabled({ timeout: 8_000 });
}
async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test('browser daily game survives refresh, accepts unknown correction, completes seven rounds, and shares real totals', async ({ page, context, baseURL }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await startDaily(page);
  const initial = await page.request.get('/api/game');
  const initialGame = (await initial.json()).game;
  await page.reload();
  await page.getByRole('button', { name: /RESUME TODAY’S GAME/i }).click();
  await expect(page.getByRole('combobox')).toBeEnabled();
  const resumed = await page.request.get('/api/game');
  expect((await resumed.json()).game.current.deadline).toBe(initialGame.current.deadline);
  await page.getByRole('combobox').fill('zzzz-not-an-nfl-entity');
  await page.getByRole('button', { name: 'LOCK IT IN' }).click();
  await expect(page.getByRole('status')).toContainText(/No attempt used|could not identify/i);
  await expect(page.getByText('3 attempts left')).toBeVisible();
  for (let round = 1; round <= 7; round++) {
    const skip = page.getByRole('button', { name: 'Skip round' });
    await expect(skip).toBeEnabled({ timeout: 8_000 });
    await skip.click();
    await expect(page.getByText('NO POINTS THIS ROUND', { exact: true })).toBeVisible();
    await noHorizontalOverflow(page);
    await page.getByRole('button', { name: round === 7 ? 'VIEW POSTGAME REPORT' : 'NEXT ROUND' }).click();
  }
  await expect(page.getByRole('heading', { name: /KIND OF FOOTBALL/ })).toBeVisible();
  await expect(page.locator('.final-score')).toHaveText('0/700');
  await expect(page.locator('.round-review')).toHaveCount(7);
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
  await page.getByRole('button', { name: 'COPY RESULTS' }).click();
  await expect(page.getByRole('button', { name: 'COPIED', exact: true })).toBeVisible();
  const shared = await page.evaluate(() => navigator.clipboard.readText());
  expect(shared).toContain('Score: 0/700'); expect(shared).toContain('0/7 Correct');
  expect(shared).not.toContain(initialGame.current.question.text);
  expect(pageErrors).toEqual([]);
});

test('360px mobile homepage, playbook, stats, practice game, and data page remain usable', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.setViewportSize({ width: 360, height: 780 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /PLAY TODAY’S BRADYILLION/i })).toBeEnabled();
  await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'How to play', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('25 seconds');
  await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.getByRole('button', { name: 'Your statistics' }).click();
  await expect(page.getByRole('dialog')).toContainText('DAILY GAMES');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Enable sounds' }).click();
  await expect(page.getByRole('button', { name: 'Mute sounds' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /ONE GAME IS NEVER ENOUGH/ }).click();
  await page.getByRole('button', { name: 'START A PRACTICE GAME' }).click();
  await expect(page.getByText('UNLIMITED · UNRANKED')).toBeVisible();
  await page.getByRole('button', { name: 'KICK OFF' }).click();
  await expect(page.getByRole('combobox')).toBeEnabled({ timeout: 8_000 });
  await noHorizontalOverflow(page);
  await page.getByRole('button', { name: 'Skip round' }).click();
  await expect(page.getByRole('button', { name: 'NEXT ROUND' })).toBeVisible();
  await page.goto('/about');
  await expect(page.getByRole('heading', { name: /Real football/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'An independent game for football fans' })).toBeVisible();
  await noHorizontalOverflow(page); expect(pageErrors).toEqual([]);
});

test('keyboard autocomplete selects a sourced correct answer and the awarded result survives refresh', async ({ page }) => {
  const { getQuestion } = await import('../../lib/questions');
  const { resolveEntity } = await import('../../lib/nfl');
  await startDaily(page);
  const state = await page.request.get('/api/game');
  const game = (await state.json()).game;
  const question = getQuestion(game.current.question.id)!;
  const answer = question.answers.find(item => resolveEntity(item.name, question.entityType).length === 1)!;
  expect(answer).toBeTruthy();
  const input = page.getByRole('combobox');
  await input.fill(answer.name);
  await expect(page.getByRole('listbox', { name: 'NFL names' })).toBeVisible();
  await expect(page.getByRole('listbox', { name: 'NFL names' })).not.toContainText(/GOAT|Pro Bowler|PTS/);
  await input.press('ArrowDown');
  await input.press('Enter');
  await expect(input).toHaveValue(answer.name);
  await page.getByRole('button', { name: 'LOCK IT IN' }).click();
  await expect(page.getByRole('heading', { name: answer.name, exact: true })).toBeVisible();
  await expect(page.locator('.result-points')).toHaveText(`+${answer.points}POINTS`);
  await expect(page.locator('.result-evidence')).toHaveText(answer.evidence);
  await page.reload();
  await page.getByRole('button', { name: /RESUME TODAY’S GAME/ }).click();
  await expect(page.locator('.result-points')).toHaveText(`+${answer.points}POINTS`);
  await expect(page.getByRole('button', { name: 'NEXT ROUND' })).toBeEnabled();
});
