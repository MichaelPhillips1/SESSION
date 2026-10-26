import { test, expect, type Page } from '@playwright/test';
import { TAPE_SYMBOLS } from '../../shared/tape';
const tapeEntries = TAPE_SYMBOLS.map((symbol, i) => ({
  symbol,
  status: 'available',
  highChange: i === 0 ? 0.0001 : 1.24,
  lowChange: i === 0 ? -0.0001 : i === 1 ? 0 : -1.15,
  previousDay: '2026-10-21',
  latestDay: '2026-10-22',
  fetchedAt: '2026-10-23T12:00:00Z',
}));
test.beforeEach(async ({ page }) => {
  await page.route('**/api/market-tape', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ entries: tapeEntries, generatedAt: '2026-10-23T12:00:00Z' }),
    }),
  );
});
// Deliberately synthetic daily test data. Production always calls Yahoo; no silent fallback.
const days = Array.from({ length: 23 }, (_, i) => {
  const day = new Date(Date.UTC(2026, 8, 23 + i));
  return {
    day: day.toISOString().slice(0, 10),
    highAverage: 225 + Math.sin(i * 0.6) * 2 + i * 0.4,
    lowAverage: 222 + Math.sin(i * 0.6) * 2 + i * 0.4,
    volume: 30_000_000 + Math.round((Math.sin(i * 1.8) + 1) * 12_000_000),
  };
}).filter((d) => ![0, 6].includes(new Date(d.day).getUTCDay()));
async function mock(page: Page) {
  await page.route('**/api/stocks/**', (route) =>
    route.fulfill({
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Currency': 'USD',
        'X-Exchange-Timezone': 'America/New_York',
        'X-Fetched-At': '2026-10-23T15:00:00Z',
        'X-Skipped-Bars': '0',
      },
      body: JSON.stringify(days),
    }),
  );
}
test('search, daily table, common reference, chart navigation and preferences', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Daily breakdown' })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(days.length);
  await page.getByLabel('Stock symbol').fill('TSLA');
  await page.getByRole('button', { name: 'Load symbol' }).click();
  await expect(page.locator('.instrument h2')).toContainText('TSLA');
  await page.getByRole('button', { name: '%', exact: true }).click();
  await expect(page.locator('.reference-note')).toContainText('first visible session midpoint');
  await page.getByRole('button', { name: '1W', exact: true }).click();
  await expect(page.locator('.zoom-buttons')).toContainText('5 sessions');
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await expect(page.locator('.chart-interaction')).toHaveAttribute('data-window-days', '7');
  await page.getByRole('button', { name: 'Auto-fit chart' }).click();
  await expect(page.locator('.zoom-buttons')).toContainText(`${days.length} sessions`);
  await page.getByLabel('Volume representation').selectOption('line');
  await page.getByRole('button', { name: 'Average low', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Average low', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByLabel('Volume representation')).toHaveValue('line');
  await expect(page.getByRole('button', { name: 'Average low', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});
test('appearance dialog supports keyboard close and reset', async ({ page }) => {
  await mock(page);
  await page.goto('/');
  // Icon-only mobile control has the same accessible name.
  await page.locator('.settings-button').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByText('Shade between high and low', { exact: true }).click();
  await page.getByRole('button', { name: 'Reset appearance' }).click();
  await expect(page.getByLabel('Shade between high and low')).toBeChecked();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('keyboard crosshair exposes exact precision and chart does not change the table', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  const chart = page.getByRole('region', {
    name: 'Interactive daily price and volume chart',
    exact: true,
  });
  await chart.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.chart-tooltip')).toContainText('Average high');
  await expect(page.locator('.chart-tooltip')).toContainText(days.at(-2)!.highAverage.toFixed(4));
  await page.keyboard.press('+');
  await expect(page.locator('tbody tr')).toHaveCount(days.length);
  await page.keyboard.press('Home');
  await expect(page.getByLabel('Vertical price scale')).toHaveCount(0);
});
test('invalid symbols, upstream failure, empty and loading states are visible', async ({
  page,
}) => {
  await page.route('**/api/stocks/**', (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        error: { code: 'SYMBOL_NOT_FOUND', message: 'No stock was found for that symbol.' },
      }),
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No stock was found');
  await page.getByLabel('Stock symbol').fill('bad symbol');
  await page.getByRole('button', { name: 'Load symbol' }).click();
  await expect(page.getByRole('alert')).toContainText('Enter a valid ticker');
  await page.unroute('**/api/stocks/**');
  await page.route('**/api/stocks/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });
  await page.getByLabel('Stock symbol').fill('EMPTY');
  await page.getByRole('button', { name: 'Load symbol' }).click();
  await expect(page.getByRole('heading', { name: 'Loading EMPTY…' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No sessions available' })).toBeVisible();
});
test('fits viewport and exposes single-session and zero-reference data', async ({ page }) => {
  await page.route('**/api/stocks/**', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Currency': 'USD' },
      body: JSON.stringify([{ day: '2026-10-23', highAverage: 0, lowAverage: 0, volume: 0 }]),
    }),
  );
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Daily breakdown' })).toBeVisible();
  await expect(page.getByRole('button', { name: '%', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await expect(page.locator('svg path[d*="NaN"]')).toHaveCount(0);
  await page.setViewportSize({ width: 320, height: 800 });
  await page
    .getByRole('region', { name: 'Interactive daily price and volume chart', exact: true })
    .focus();
  await page.keyboard.press('ArrowLeft');
  const tooltip = (await page.locator('.chart-tooltip').boundingBox())!;
  expect(tooltip.x).toBeGreaterThanOrEqual(0);
  expect(tooltip.x + tooltip.width).toBeLessThanOrEqual(320);
});
test('wheel zoom and pointer pan preserve the seven-day minimum and automatic vertical fit', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  await expect(page.locator('tbody tr')).toHaveCount(days.length);
  const canvas = page.locator('.chart-interaction svg');
  await canvas.scrollIntoViewIfNeeded();
  const bounds = (await canvas.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * 0.75, bounds.y + 130);
  await page.mouse.wheel(0, -100);
  await expect(page.locator('.zoom-buttons')).not.toContainText(`${days.length} sessions`);
  await page.mouse.move(bounds.x + bounds.width * 0.5, bounds.y + 130);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * 0.2, bounds.y + 130, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('svg path[d*="NaN"]')).toHaveCount(0);
  await expect(page.getByLabel('Vertical price scale')).toHaveCount(0);
  for (let i = 0; i < 12; i++) await page.mouse.wheel(0, -100);
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toBeDisabled();
  await expect(page.locator('.chart-interaction')).toHaveAttribute('data-window-days', '7');
  await expect(page.locator('tbody tr')).toHaveCount(days.length);
  await page.getByRole('button', { name: 'Auto-fit chart' }).click();
  await expect(page.getByLabel('Vertical price scale')).toHaveCount(0);
});
test('removes obsolete layout and controls while retaining subtle gridlines', async ({ page }) => {
  await mock(page);
  await page.goto('/');
  await expect(page.locator('tbody tr')).toHaveCount(days.length);
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.locator('kbd')).toHaveCount(0);
  await expect(page.getByText('15m source')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Grid', exact: true })).toHaveCount(0);
  await expect(page.locator('.chart-interaction svg')).toBeVisible();
  expect(
    await page
      .locator('.gridline')
      .first()
      .evaluate((node) => (node as SVGLineElement).getTotalLength()),
  ).toBeGreaterThan(0);
  expect(
    await page
      .locator('.gridline')
      .first()
      .evaluate((node) => getComputedStyle(node).stroke),
  ).not.toBe('none');
  const width = await page.locator('main').evaluate((node) => node.getBoundingClientRect().width);
  expect(width).toBeGreaterThan((await page.viewportSize())!.width * 0.9);
  await page.getByLabel('Stock symbol').fill('TSM');
  await page.getByLabel('Stock symbol').press('Enter');
  await expect(page.locator('.instrument h2')).toContainText('TSM');
});
test('percentage axis and series values follow the first visible session without resetting the window', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  await page.getByRole('button', { name: '1W', exact: true }).click();
  const chart = page.locator('.chart-interaction');
  const first = await chart.getAttribute('data-reference-day');
  await page.getByRole('button', { name: '%', exact: true }).click();
  await expect(chart).toHaveAttribute('data-reference-day', first!);
  await expect(chart).toHaveAttribute('data-window-days', '7');
  await page.getByRole('button', { name: 'Pan earlier', exact: true }).click();
  const earlier = await chart.getAttribute('data-reference-day');
  expect(earlier).not.toBe(first);
  await expect(page.locator('.reference-note')).toContainText('first visible session midpoint');
  const visibleFirst = days.find((d) => d.day === earlier)!;
  await chart.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.chart-tooltip')).toContainText('each series');
  await page.getByRole('button', { name: '$', exact: true }).click();
  await expect(chart).toHaveAttribute('data-reference-day', earlier!);
  await expect(chart).toHaveAttribute('data-window-days', '7');
  expect(visibleFirst).toBeDefined();
});
test('ticker tape keeps exact order, independent signs, seamless geometry and pauses accessibly', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  const tape = page.getByRole('region', { name: 'Completed-session market ticker tape' });
  const original = tape.locator('.ticker-group:not([aria-hidden])');
  await expect(original.locator('button')).toHaveCount(28);
  expect(await original.locator('strong').allTextContents()).toEqual([...TAPE_SYMBOLS]);
  await expect(original.locator('button').first()).toContainText('H +<0.01%');
  await expect(original.locator('button').first()).toContainText('L -<0.01%');
  await expect(original.locator('button').nth(1)).toContainText('L 0.00%');
  const widths = await tape
    .locator('.ticker-group')
    .evaluateAll((nodes) => nodes.map((n) => (n as HTMLElement).offsetWidth));
  expect(widths[0]).toBe(widths[1]);
  await tape.hover();
  expect(
    await tape.locator('.ticker-track').evaluate((n) => getComputedStyle(n).animationPlayState),
  ).toBe('paused');
  const nvda = original.locator('button').nth(1);
  await nvda.focus();
  expect(
    await tape.locator('.ticker-track').evaluate((n) => getComputedStyle(n).animationName),
  ).toBe('none');
  await nvda.click();
  await expect(page.getByLabel('Stock symbol')).toHaveValue('NVDA');
  await expect(page.locator('.instrument h2')).toContainText('NVDA');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await tape.locator('.ticker-track').evaluate((n) => getComputedStyle(n).animationName),
  ).toBe('none');
  await expect(tape.getByRole('button')).toHaveCount(28);
  const last = original.locator('button').last();
  await last.focus();
  await expect(last).toBeInViewport();
});
test('ticker requests do not repeat on symbol changes and ticker failure does not disrupt the dashboard', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/market-tape', (route) => {
    calls++;
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
  });
  await mock(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Daily breakdown' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry market tape' })).toBeVisible();
  await page.getByLabel('Stock symbol').fill('GE');
  await page.getByLabel('Stock symbol').press('Enter');
  await expect(page.locator('.instrument h2')).toContainText('GE');
  expect(calls).toBe(1);
  await expect(page.locator('.ticker-group:not([aria-hidden]) button')).toHaveCount(28);
});
test('pointer clicks work on the original and looping ticker copies without moving focus', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  const tape = page.getByRole('region', { name: 'Completed-session market ticker tape' });
  const first = tape.locator('.ticker-group:not([aria-hidden]) button').first();
  await tape.hover();
  await first.click();
  await expect(page.getByLabel('Stock symbol')).toHaveValue('MSFT');
  expect(await tape.evaluate((n) => n.contains(document.activeElement))).toBe(false);
  await page.getByLabel('Stock symbol').fill('AAPL');
  await page.getByLabel('Stock symbol').press('Enter');
  // Inspect the loop boundary directly rather than waiting three minutes for a full cycle.
  await tape.locator('.ticker-track').evaluate((n) => {
    const animation = n.getAnimations()[0]!;
    animation.pause();
    animation.currentTime = 191_000;
  });
  await tape.locator('.ticker-group[aria-hidden=true] button').first().click();
  await expect(page.getByLabel('Stock symbol')).toHaveValue('MSFT');
  await expect(page.locator('.instrument h2')).toContainText('MSFT');
});
test('summary miniatures show actual daily values and prior-session changes independently of chart zoom', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  const summary = page.getByRole('region', { name: 'Latest daily summary' });
  // A named section is exposed as a region; its SVG miniatures are decorative.
  const high = summary.getByRole('article', { name: 'Latest average high' });
  const low = summary.getByRole('article', { name: 'Latest average low' });
  const latest = days.at(-1)!,
    previous = days.at(-2)!;
  const signed = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  await expect(high.locator('.metric-value strong')).toContainText(latest.highAverage.toFixed(4));
  await expect(low.locator('.metric-value strong')).toContainText(latest.lowAverage.toFixed(4));
  await expect(high.locator('.metric-change')).toContainText(
    signed(((latest.highAverage - previous.highAverage) / previous.highAverage) * 100),
  );
  await expect(low.locator('.metric-change')).toContainText(
    signed(((latest.lowAverage - previous.lowAverage) / previous.lowAverage) * 100),
  );
  await expect(high.locator('.metric-change')).toContainText('vs prior session');
  await expect(summary.locator('.mini-chart')).toHaveCount(3);
  await expect(summary.locator('.volume-metric .mini-chart rect')).toHaveCount(days.length);
  const before = await summary.innerText();
  await page.getByRole('button', { name: '1W', exact: true }).click();
  await page.getByRole('button', { name: '%', exact: true }).click();
  expect(await summary.innerText()).toBe(before);
  if ((await page.viewportSize())!.width > 1000) {
    const title = (await page.locator('.page-heading').boundingBox())!,
      search = (await page.locator('.search-form').boundingBox())!;
    expect(search.x).toBeGreaterThan(title.x + title.width);
    expect(Math.abs(search.y - title.y)).toBeLessThan(30);
  }
});
test('volume remains visible with migrated preferences and through appearance changes', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'session.preferences.v1',
      JSON.stringify({ volume: false, volumeOpacity: 0, theme: 'dark' }),
    ),
  );
  await mock(page);
  await page.goto('/');
  await expect(page.locator('.volume-series rect')).toHaveCount(days.length);
  await expect(page.getByRole('button', { name: 'Volume', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Average high', exact: true }).click();
  await page.getByRole('button', { name: 'Average low', exact: true }).click();
  await expect(page.locator('.volume-series rect')).toHaveCount(days.length);
  await page.getByLabel('Volume representation').selectOption('line');
  await expect(page.locator('.volume-series path.price-series')).toHaveCount(1);
  await page.getByRole('button', { name: 'Chart appearance' }).click();
  await expect(page.getByLabel('Show volume', { exact: true })).toHaveCount(0);
  const volumeOpacity = page.getByRole('group', { name: 'Trading volume' }).getByRole('slider');
  await expect(volumeOpacity).toHaveAttribute('min', '0.2');
  await page.keyboard.press('Escape');
  await expect(page.locator('.volume-series path.price-series')).toHaveCount(1);
});
test('tooltips fit inside the chart at both date boundaries with exact currency and full volume', async ({
  page,
}) => {
  await mock(page);
  await page.goto('/');
  const chart = page.locator('.chart-interaction');
  await chart.scrollIntoViewIfNeeded();
  const bounds = (await chart.boundingBox())!;
  for (const end of ['first', 'last'] as const) {
    const day = end === 'first' ? days[0]! : days.at(-1)!;
    await page.mouse.move(
      bounds.x + (end === 'first' ? 3 : bounds.width - 3),
      bounds.y + (end === 'first' ? 24 : bounds.height - 35),
    );
    const tooltip = page.locator('.chart-tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText(day.highAverage.toFixed(4));
    await expect(tooltip).toContainText(new Intl.NumberFormat('en-US').format(day.volume));
    const box = (await tooltip.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(bounds.x);
    expect(box.y).toBeGreaterThanOrEqual(bounds.y);
    expect(box.x + box.width).toBeLessThanOrEqual(bounds.x + bounds.width);
    expect(box.y + box.height).toBeLessThanOrEqual(bounds.y + bounds.height);
  }
});
test('tap or click inspects a session and Escape dismisses the tooltip', async ({
  page,
  isMobile,
}) => {
  await mock(page);
  await page.goto('/');
  const chart = page.locator('.chart-interaction');
  await chart.scrollIntoViewIfNeeded();
  const bounds = (await chart.boundingBox())!;
  const x = bounds.x + bounds.width / 2 - 32,
    y = bounds.y + 90;
  if (isMobile) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
  await expect(page.locator('.chart-tooltip')).toContainText('Average high');
  await expect(page.locator('.chart-tooltip')).toContainText('Trading volume');
  await page.keyboard.press('Escape');
  await expect(page.locator('.chart-tooltip')).toHaveCount(0);
});
