# Requirement traceability

Current scope incorporates the continuation brief in `docs/CONTINUATION_BRIEF.md`. Its explicit changes supersede the initial slider/grid/fixed-baseline objectives. The current visual-refinement prompt in `docs/VISUAL_REFINEMENT_BRIEF.md` additionally makes volume permanent and directs the compact reference layout and summary miniatures.

Source: the attached **Take-Home Assessment(2).pdf** (two pages) and the user's supplied stack/design brief. The PDF allows either GitHub or a ZIP; this round uses the explicitly requested ZIP.

| Requirement                                    | Implementation                                                                                      | Evidence                                                                     |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Self-hosted Node.js / TypeScript API           | Express app, compiled Node entry point                                                              | `server/src/app.ts`, `index.ts`; production smoke check                      |
| Symbol parameter and Yahoo intraday source     | `GET /api/stocks/:symbol`; fixed Yahoo Chart URL                                                    | Supertest symbol/contract tests; upstream adapter tests; live AAPL request   |
| Last month at 15-minute resolution             | `range=1mo`, `interval=15m`, regular session                                                        | Yahoo request-parameter test                                                 |
| Daily grouping, high/low averages, volume      | Exchange-local dates; arithmetic means; integer volume sum                                          | Aggregation tests including timezone/DST, precision, incomplete values       |
| Exact JSON body and precision                  | Ascending array with `day`, `lowAverage`, `highAverage`, `volume`; round to four places             | API shape test, aggregation test; four-place table/tooltips                  |
| React + TypeScript frontend                    | React 19 and strict TypeScript                                                                      | Type checking and Vite build                                                 |
| Symbol input; meaningful visualization         | Search, daily chart, full daily table                                                               | Desktop/mobile browser tests                                                 |
| Invalid symbol and request error feedback      | Loading, empty, validation, not-found, timeout/failure/retry states                                 | API/upstream and browser tests                                               |
| Vite and Tailwind CSS + CSS                    | Vite React/Tailwind plugins, theme tokens and component CSS                                         | Production build                                                             |
| Custom chart without chart libraries           | React SVG paths, CSS grid/theme/controls                                                            | Dependency manifest and component source                                     |
| Green high / red low and transparent gradient  | Solid high, dashed low, gradient between them                                                       | Visual review of both themes                                                 |
| Volume histogram / line with optional gradient | Synchronized panel; representation control, settings                                                | Browser representation/persistence test; visual review                       |
| Theme switching and persistence                | Versioned, validated browser storage                                                                | Reload/persistence browser test                                              |
| Line colors, widths, opacity, styles           | Separate high/low appearance controls                                                               | Appearance component, dialog browser check                                   |
| Canvas, grid and fill customization            | Theme/custom canvas, permanent subtle grid, band opacity                                            | Appearance component, visual review                                          |
| Horizontal zoom, pan, vertical scale, reset    | Wheel/pointer/button/keyboard controls; automatic padded price domain and auto-fit                  | Viewport unit tests; browser wheel/pan/scale tests                           |
| Absolute / percentage display                  | Common first-visible midpoint; own-series changes in H/L readouts/tooltips                          | Percentage unit test, browser reference check                                |
| Crosshair and refined tooltips                 | Pointer/keyboard session inspection; 4-decimal prices, full integer volume                          | Keyboard precision browser test                                              |
| One week / two weeks / one month               | 7/14 calendar-day filters; all monthly records                                                      | Range unit test, browser range test                                          |
| Independently toggle chart elements            | High, low and fill legend buttons; permanent grid and volume                                        | Legend state/persistence browser test                                        |
| Professional, responsive layout                | Cohesive dashboard, compact controls, mobile table scrolling                                        | Desktop/light/mobile/modal visual checks; overflow browser assertion         |
| Accessibility and feedback                     | Labels, keyboard controls, modal semantics, series style/marker differences, reduced-motion support | Keyboard/modal tests; visual review (no claim of a full accessibility audit) |
| Clean, extensible MVP                          | Provider/service/aggregation/app separation; reusable UI components and pure viewport functions     | Source review, strict type checking                                          |
| Vitest + Supertest, mocked upstream            | Deterministic tests inject upstream responses/providers                                             | `npm test`                                                                   |
| README and prompt log                          | Setup/config/run/test/architecture, original prompt and revision notes                              | `README.md`, `PROMPT_LOG.md`                                                 |
| Manual changes explained                       | No human edits claimed; explicit place for later edits                                              | Manual-changes section of prompt log                                         |
| No indicators or financial modeling            | Only required daily aggregation and visualization transformations                                   | API and chart source                                                         |

## Scope interpretations

- A month means Yahoo's `1mo` window. Missing sessions are not synthesized; 1W and 2W are calendar windows anchored to the latest actual session.
- The PDF does not define handling for incomplete intraday candles. This implementation omits an incomplete candle as a unit and discloses how many were omitted, preserving a consistent sample across both price series and volume. It does not treat missing data as zero.
- The assessment JSON contains numbers; trailing zeroes belong to display formatting. The API rounds to four places; the table and price tooltips show all four.
- A live, still-open latest session is included and identified as potentially incomplete. The UI calls the dataset historical rather than promising streaming quotes.
- The table always shows all fetched daily records in absolute currency. Interactive chart viewport/mode changes cannot mutate them.
- The downloadable ZIP is the requested submission path. Publishing a GitHub repository remains optional and requires the user's chosen destination.

## Continuation requirements

| Request                            | Implementation and verification                                                                                                                                                                      |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Remove sidebar and quick picks  | Removed JSX, obsolete styles, decorative card, list and list-only state. Main now uses the full workspace; desktop/mobile width checks.                                                              |
| 2. Simplify search                 | Removed visible SYMBOL tag; icon, accessible label, Enter submission, validation and primary button retained. Browser search regression.                                                             |
| 3. Remove source-to-daily label    | Removed complete element and associated CSS. Retrieval remains 15m/1mo; API adapter regression.                                                                                                      |
| 4. Visible-window percentages      | Moving common midpoint axis baseline; H/L changes relative to their respective first-visible values. Falling/rising/flat unit checks, pan/mode browser checks.                                       |
| 5. Minimum seven calendar days     | Calendar-coordinate viewport with seven-day minimum, bounded pan and disabled zoom-in at limit; short-data exception. Original equal session spacing retained in rendering.                          |
| 6. Automatic vertical scaling      | Removed scale state, slider/multiplier, keyboard vertical controls and CSS. Padded domain recalculates from both visible price series.                                                               |
| 7. Simplified legend               | Removed grid item/preference/settings toggle; gridlines remain subtle and theme-aware. Saved old grid=false cannot hide them.                                                                        |
| 8. Exact 28-symbol ticker tape     | Single shared ordered constant; 28 statuses; two identical CSS loop groups, accessible original, click-through, hover/focus/reduced-motion handling. Browser order/loop/click tests.                 |
| 8. Completed-session percentages   | Existing daily aggregates plus Yahoo session metadata; independently compare high/high and low/low; reject missing coverage, zero denominators, and stale pre-close snapshots. Unit/API/live checks. |
| 8. Efficiency and isolated failure | Five-day first request, conditional month fallback, four workers, coalescing, hourly successes/one-minute failures, no animation requests/polling. Cache/concurrency tests and live repeat check.    |
| 9–10. Preserve stack and polish    | No dependency additions or version changes; existing SVG chart, themes, appearance, volume controls, table and API retained. Desktop/light/mobile/percentage visual review.                          |
| 11. Regression verification        | Existing unit/API coverage retained; focused calendar, domain, schedule, cache, formatting and tape tests; Chromium desktop/mobile browser checks. See VALIDATION.md.                                |

Chart percentages use the first visible session; tape percentages use the previous completed session. These reference periods remain independent. The main assessment JSON is unchanged, and session metadata is internal only.

## Current visual-refinement requirements

| Request                                           | Implementation / evidence                                                                                                                                                                                                   |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retain the stack and stable backend               | Package manifest, lockfile, server source and shared contract/calculation modules unchanged from the continuation commit. Original aggregation, API, session and cache tests retained.                                      |
| Follow the concept's layout                       | Header/tape retained; introduction/search share a desktop row; three concise summary cards; unified chart surface; table below. Responsive dark/light visual inspection.                                                    |
| Add genuine summary visuals                       | SVG sparklines and daily-volume bars derive from fetched aggregates. Adjacent available-session deltas are visibly labeled, separately tested and unaffected by chart navigation.                                           |
| Keep volume visible                               | No visibility preference or hide control; old saved hiding/zero-opacity values recover. Histogram/line, color, opacity and optional line fill remain configurable. Unit and browser migration checks.                       |
| Refine chart controls and tooltip                 | Grouped header controls; measured two-axis tooltip positioning; four-place prices, full integer volume and clear reference context. Both-edge desktop/mobile browser checks.                                                |
| Preserve historical navigation                    | Existing seven-calendar-day minimum, bounded pan, range presets, common axis baseline and own-series tooltip changes remain. All navigation regressions pass.                                                               |
| Maintain exact tape sequence and completion rules | CSS-only loop and existing request/cache logic retained; original 28-symbol order, interaction, completion, failure and cache checks retained.                                                                              |
| Improve organization and rendering efficiency     | Pure geometry/summary modules; reusable miniatures; memoized static drawing, summaries and sorted table; separate cursor; frame-limited pointer updates; reused formatters.                                                 |
| Refine table                                      | Same four required fields, all records, date ordering, four-place averages and integer volume; quieter row styling and sticky internal header.                                                                              |
| Accessibility and mobile                          | Named controls/regions, keyboard shortcuts and Escape, native modal, reduced motion, meaningful text beside decorative miniatures, touch pan-y and responsive grouping. Chromium checks at desktop/mobile including 320 px. |
| Keep collaboration auditable                      | Full new prompt, original concept, design-decision notes, current validation and existing history included. No independent human acceptance is claimed.                                                                     |

The illustrative image's financial values and example ticker order are not requirements or data inputs. The PDF's four-field daily response and the previously specified 28-symbol sequence remain authoritative.
