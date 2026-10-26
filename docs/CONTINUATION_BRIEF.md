SESSION Market Dashboard — UI/UX Refinement, Functional Corrections, and Feature Expansion
We have successfully developed and launched the initial version of the SESSION Market Dashboard. The current application is functional, and its general visual identity, dark color palette, typography, and chart styling are satisfactory.

However, after reviewing the application in operation, I have identified several areas where the interface can be simplified, the available screen space can be better utilized, and chart functionality can be improved. I would also like to introduce one new feature: a continuously scrolling market ticker tape displaying session-over-session changes in average high and low prices.

The objective of this iteration is NOT to redesign the application from scratch. Rather, we should refine the existing implementation while preserving its strengths, improving usability, correcting existing functional issues, and introducing the requested feature.

Please implement the following changes.
1. Remove the Left Sidebar Entirely
The existing left sidebar consumes a substantial portion of the horizontal screen space without providing meaningful functionality.

It currently contains navigation elements, a list of predefined ticker symbols (AAPL, MSFT, NVDA, TSLA), and the decorative "A Clearer View" information card.

I would like this entire sidebar removed.
- Remove the left navigation panel and all of its contents.
- Remove the predefined ticker selection list rather than relocating the entire sidebar elsewhere.
- Remove the decorative information card and other sidebar-specific elements.
- Eliminate the unused horizontal space previously occupied by the sidebar.
- Expand the primary dashboard content area to utilize the newly available width.
- Maintain appropriate responsive margins, padding, and visual hierarchy.
- Preserve the existing application header and primary symbol search functionality.
The dashboard should have a cleaner, wider, single-workspace layout, allowing the chart and data table to occupy substantially more of the available screen.

The goal is to maximize the space dedicated to meaningful financial data visualization.
2. Simplify the Stock Symbol Search
The current ticker search includes a small label reading "SYMBOL" immediately beside the "Load symbol" button.

This label is unnecessary and adds visual clutter.
- Remove the visible "SYMBOL" label.
- Retain the ticker input field and "Load symbol" button.
- Preserve the search icon and existing visual styling where appropriate.
- Maintain the ability to submit symbols using the Enter key.
- Preserve appropriate validation, error messages, and accessibility labels.
- Ensure that symbol searches continue to update the dashboard correctly.
The search interface should remain prominent but visually simple.
3. Remove the Redundant "15m source → Daily view" Label
In the upper-right portion of the Market Overview section, immediately above the stock symbol search, there is a small informational label reading "15m source → Daily view."

I would like this element removed entirely.
- Remove the complete "15m source → Daily view" text and its accompanying arrow.
- Do not replace it with another label, badge, or decorative indicator.
- Preserve the Market Overview heading, subtitle, and their existing visual hierarchy.
- Ensure removing the element does not leave an awkward empty container or unnecessary spacing.
- Do not change the underlying 15-minute data retrieval or daily aggregation functionality.
This label does not provide meaningful information that warrants dedicated screen space. The application should communicate its functionality through the actual chart, daily data table, and relevant contextual information rather than redundant decorative labels.
4. Correct the Percentage-Based Price Scale
There is a functional issue with the current percentage-based price visualization.

At present, the percentage scale appears to calculate changes relative to a fixed historical reference, even when the user is viewing a shorter or different portion of the available trading history.

This can produce confusing results. For example, a selected window can show a downward price movement while the displayed percentage values remain positive because they reference an earlier date outside the visible window.

This behavior needs to change.

The percentage calculations must dynamically reference the leftmost visible trading session in the currently selected chart window.

Requirements:
- Keep the existing dollar ($) and percentage (%) scale toggle.
- In percentage mode, the reference must come from the first visible trading session, NOT the earliest record in the entire historical dataset.
- When the user zooms, pans, or selects a different date range, recalculate the percentage scale relative to the newly visible starting session.
- Use a consistent common reference for the two price series so the high-average and low-average lines remain directly comparable on the same axis. A reasonable approach is the midpoint between the first visible day's high-average and low-average values.
- In that approach, 0% represents the common reference price of the leftmost visible session, while the individual high and low lines may sit slightly above and below zero.
- If displaying each series' percentage change in the legend or tooltip, calculate that change relative to that series' own value on the leftmost visible session, so increases and decreases are correctly identified.
- Negative changes must display negative percentages rather than misleading positive values.
- Update the vertical axis labels, tooltip values, and any applicable chart annotations consistently.
- Switching between dollar and percentage mode must not reset the selected chart window.
- Preserve the underlying daily aggregated stock data without modification.
The percentage scale should reflect the price behavior within the period the user is currently inspecting, not an arbitrary historical baseline that may no longer be visible.

Importantly, this chart-relative percentage calculation is separate from the session-over-session percentage calculation required for the new ticker tape described later.
5. Establish a Minimum Seven-Day Viewing Window
The chart currently supports interactive zooming and historical navigation. I want to preserve this functionality, but introduce a minimum viewing range.

The smallest permitted horizontal viewing window should be seven calendar days.
- Maintain the existing mouse-wheel zoom functionality.
- Maintain horizontal chart panning and historical scrolling.
- Maintain the existing time-range presets, including 1W, 2W, and 1M.
- Prevent zooming into any window smaller than seven calendar days.
- Respect the fact that markets are closed on weekends and holidays; seven calendar days will not necessarily contain seven trading sessions.
- Disable further zoom-in once the minimum viewing range has been reached.
- Continue allowing users to zoom outward and inspect the entire available historical period.
- Keep the auto-fit/reset functionality for restoring the full available chart view.
- Ensure panning and zooming cannot navigate beyond the available historical data.
- Handle cases where the available dataset is shorter than the configured minimum.
The interaction should be smooth and intuitive, similar to the historical chart navigation found on TradingView, without introducing unnecessary charting dependencies.
6. Remove the Manual Price Scale Slider
The slider labeled "Price scale" beneath the chart does not provide sufficient value to justify occupying interface space.

Remove it entirely.

Instead, implement automatic vertical price scaling.
- Remove the slider, its label, and the displayed scale multiplier.
- Automatically determine the appropriate vertical price range using the data currently visible in the chart window.
- Include reasonable visual padding above the highest visible value and below the lowest visible value.
- Recalculate the price-axis range whenever the user zooms, pans, or changes the viewing period.
- Ensure that both average-high and average-low series remain visible.
- Apply appropriate automatic scaling in both dollar and percentage display modes.
- Preserve the ability to navigate the historical data horizontally.
The user should not need to manually adjust a vertical scale slider to keep the chart legible.
7. Remove the Grid Control From the Chart Legend
The chart legend currently contains an interactive item labeled "Grid."

This is unnecessary and should be removed.
- Remove the "Grid" legend item and its associated visibility toggle.
- Retain subtle chart gridlines as part of the default visualization.
- Keep the gridlines appropriately styled for dark and light themes.
- Preserve the remaining relevant chart controls, including average high, average low, range fill, and volume where applicable.
- Rebalance legend spacing after removing the unnecessary control.
I want to simplify the available controls without sacrificing the visual readability of the chart.
8. New Feature — Continuously Scrolling Market Ticker Tape
I would also like to introduce a continuously scrolling market ticker tape at the top of the application, inspired by the market information banners commonly found on professional financial platforms.

This component should be positioned immediately beneath the main SESSION navigation header and extend horizontally across the full available screen width.

It should be relatively compact, visually polished, and seamlessly integrated with the existing dashboard aesthetic.
8.1 Exact Stock Symbols and Display Order
The scrolling banner MUST contain the following 28 ticker symbols in EXACTLY this order:
1. MSFT
2. NVDA
3. AAPL
4. GOOGL
5. XOM
6. CVX
7. SMCI
8. WMT
9. BABA
10. MU
11. NKE
12. LOW
13. HD
14. T
15. TM
16. TSM
17. ADBE
18. META
19. PLTR
20. OSCR
21. UNH
22. AMZN
23. WDAY
24. WFC
25. BAC
26. BA
27. GE
28. GD
This sequence must be preserved throughout the scrolling animation. Once the final ticker, GD, has passed, the sequence should seamlessly repeat from MSFT without a noticeable gap or abrupt animation reset.

Do not alphabetize, rearrange, substitute, or omit symbols. The order above is intentional.

The ticker tape should not dynamically insert unrelated symbols or reorder itself based on price performance.
8.2 Information Displayed for Each Ticker
Each ticker entry must contain three pieces of information:

Ticker Symbol | Average High % Change | Average Low % Change

For example, using illustrative values:

MSFT | H +1.24% | L +0.87%

NVDA | H -0.62% | L -1.15%

AAPL | H +0.43% | L -0.21%

Each percentage must represent the change between the two most recent completed trading sessions for that particular stock.

Specifically:

Average High % Change = ((Latest Completed Session High Average - Previous Completed Session High Average) / Previous Completed Session High Average) × 100

Average Low % Change = ((Latest Completed Session Low Average - Previous Completed Session Low Average) / Previous Completed Session Low Average) × 100

These percentages must be calculated from the same daily aggregated high-average and low-average data required by the Prometheus assessment.

Do NOT substitute closing-price percentage changes, raw daily high/low extremes, or unrelated market performance metrics.

The ticker tape is intended to show how each stock's aggregated average highs and average lows have changed relative to the previous completed trading session.
8.3 Positive and Negative Price Changes
The visual representation should communicate directional changes clearly.
- Positive values should display a leading + sign and use an appropriate green color.
- Negative values should display a leading - sign and use an appropriate red color.
- Unchanged values should display 0.00% using neutral styling.
- High-average and low-average changes should remain independently calculated.
- It must be possible for one value to be positive and the other negative.
- Avoid rounding small negative or positive movements into misleading directional displays.
The colors should remain consistent with the existing green/high and red/low visual language while clearly indicating whether each individual value increased or decreased.
8.4 Animation and User Interaction
The ticker tape should move horizontally in a continuous, smooth animation, similar to a professional financial market information display.

Requirements:
- Scroll continuously at a comfortable, readable speed.
- Use seamless looping with no visible snapping, restarting, or blank gaps.
- Maintain the exact ticker order provided above.
- Pause the animation when the user hovers over the ticker tape.
- Pause when a ticker receives keyboard focus.
- Allow users to click a ticker entry to load that symbol into the main dashboard.
- Preserve accessible keyboard interactions.
- Respect reduced-motion accessibility settings by disabling continuous motion where appropriate while keeping all ticker entries accessible.
- Adapt appropriately to mobile and smaller displays.
- Avoid unnecessary animation libraries or computationally expensive React state updates.
The scrolling animation should be visually smooth without affecting chart responsiveness or other application interactions.
8.5 Data Retrieval, Aggregation, and Performance
The ticker tape must use the existing Yahoo Finance Chart API and our existing backend aggregation logic.

Do not introduce another financial data provider.

Since the banner contains 28 symbols, careful consideration must be given to API efficiency, caching, and request management.

Specifically:
- Retrieve only the market data necessary to calculate the two most recent completed trading-session aggregates for each symbol, where supported by the existing provider.
- Reuse the existing validated daily aggregation functionality rather than duplicating financial calculation logic.
- Introduce appropriate server-side caching to avoid repeatedly requesting unchanged historical data.
- Consider request deduplication and bounded concurrency to reduce unnecessary load on Yahoo Finance.
- Avoid requesting all 28 symbols again whenever the ticker tape animation loops.
- Avoid unnecessary polling or continuous refresh behavior.
- Refresh cached data at a sensible interval appropriate for completed daily trading sessions.
- Account for market holidays, weekends, early market closures, and incomplete current sessions when identifying the two latest completed trading sessions.
- Return a clear unavailable state for symbols with insufficient data or failed upstream requests.
- Individual ticker retrieval failures must not prevent the remaining tickers from rendering.
- Ticker tape failures must not disrupt the main stock dashboard.
- Keep the existing assessment-required stock aggregation API response format unchanged. If a separate backend endpoint is needed for efficient ticker tape data delivery, implement it cleanly without altering the required endpoint's response contract.
The ticker tape should be an efficient informational feature, not an additional source of unnecessary complexity or unreliable API traffic.
8.6 Visual Design and Integration
The scrolling banner should feel like a native SESSION component rather than an embedded third-party widget.

Visual considerations:
- Use the existing dark/light theme system.
- Maintain consistent typography and restrained colors.
- Use subtle vertical or horizontal separators between ticker entries.
- Give each symbol sufficient spacing for readability.
- Display percentage values clearly without oversized typography.
- Keep the ticker tape compact so it does not unnecessarily reduce the chart's available screen space.
- Avoid exaggerated gradients, animations, or decorative effects.
- Ensure that visual transitions and hover states feel consistent with the rest of the application.
- Preserve the existing application header above the ticker tape.
The ticker tape should add useful information to the interface without creating visual clutter.
9. Preserve Existing Chart Functionality and Visual Styling
Unless explicitly modified above, existing chart functionality should remain intact.

In particular, preserve:
- The custom React/TypeScript chart implementation.
- The green average-high line.
- The red average-low line.
- The transparent gradient shading between the two price series.
- The volume visualization beneath the primary price chart.
- The volume histogram/line display toggle.
- Interactive tooltips and crosshair behavior.
- Dollar and percentage price-axis modes.
- Mouse-wheel zooming and historical panning, subject to the new seven-day minimum.
- Dark/light theme support.
- The existing appearance customization controls.
- Responsive chart rendering.
- The daily breakdown data table.
- All required backend aggregation functionality.
Do not introduce financial indicators, additional analytical models, or trading-related features as part of this iteration.
10. Layout, Responsiveness, and Polish
After removing the sidebar and unnecessary controls, and introducing the ticker tape, review the overall layout to ensure that the application still feels intentionally designed.

The expanded content area should take advantage of the additional horizontal space without appearing stretched or disproportionate.

Pay particular attention to:
- Chart width and aspect ratio.
- Placement of the new ticker tape immediately beneath the main application header.
- Alignment between the ticker search, summary cards, chart, and daily breakdown table.
- Consistent horizontal spacing and margins.
- Responsive behavior at smaller screen sizes.
- Tooltip positioning near the edges of the chart.
- Legibility of axis labels and date markers.
- Preservation of the existing dark/light theme styling.
- Avoidance of unnecessary blank space or redundant controls.
- Smooth performance when the ticker tape and main chart are both active.
Retain the existing professional visual identity. The objective is refinement, not stylistic reinvention.
11. Functional Verification and Regression Testing
Following these modifications, verify that the original application remains fully functional.

Specifically:
- Confirm ticker searches still work correctly.
- Confirm Yahoo Finance data continues to be retrieved and aggregated correctly.
- Confirm the API response still satisfies the Prometheus assessment requirements.
- Test the percentage-scale calculations using rising, falling, and relatively flat price windows.
- Test that the percentage baseline updates correctly during zooming, panning, and date-range changes.
- Verify that the minimum seven-day viewing range is enforced.
- Verify that automatic vertical scaling works in both dollar and percentage modes.
- Confirm that removing the sidebar and controls does not break component layout or event handling.
- Confirm that the daily breakdown table remains accurate and accessible.
- Verify that all 28 ticker symbols appear in the exact specified order.
- Verify that high-average and low-average percentage changes are calculated independently using the previous completed session as the reference.
- Verify correct handling of positive, negative, and unchanged values.
- Verify that weekends, holidays, incomplete sessions, and insufficient history are handled appropriately.
- Verify that clicking ticker tape entries loads the corresponding stock.
- Verify that ticker tape scrolling loops seamlessly and pauses on hover or keyboard focus.
- Verify that caching and request management avoid redundant upstream API calls.
- Verify that failure to retrieve one or more ticker symbols does not break the primary dashboard.
- Run the existing automated test suite and add focused tests for the modified chart behavior and new ticker tape calculations where appropriate.
Final Expectations
All changes should be implemented directly into the existing project architecture rather than through unnecessary rewrites.

Maintain clean, scalable, strongly typed, modular, and maintainable code. Remove obsolete components, styling, state, and event handlers associated with the deleted controls rather than merely hiding them visually.

Do not compromise any mandatory requirements in the original Prometheus Take-Home Assessment PDF.

The primary objective is to create a cleaner and more intuitive financial data dashboard featuring a larger charting workspace, fewer redundant controls, correct window-relative percentage calculations, smooth historical chart navigation, and a professionally implemented scrolling market ticker tape.

Remember that the chart's percentage mode and the ticker tape's percentage changes use different reference periods. The chart references the leftmost visible session, while the ticker tape references the previous completed trading session for each stock. These calculations must remain independent.

Use the provided screenshots as visual references when identifying elements to remove or modify. Preserve the functionality and appearance of components that are not explicitly targeted for modification.

Return the updated, fully functional project as a ZIP archive, preserving the existing technology stack and necessary documentation.