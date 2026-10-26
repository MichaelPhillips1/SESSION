Visual Refinement: Design and Engineering Decisions
Visual Target
The conceptual reference image (design-reference.jpeg) guided the layout, density, spacing, and restrained lime-green branding. Its example prices, percentages, ticker order, and dates are illustrative. The application displays actual Yahoo Finance data through the existing backend and retains the established 28-symbol ticker order even where the image differs.

The desktop layout follows the general composition of the reference: the existing header and compact ticker tape, an introduction with the symbol search on the right, three concise statistics cards, a unified chart, and the daily breakdown table. On mobile, the search moves into a stacked layout, the two price cards retain readable widths, and the volume card moves beneath them. Chart toolbar groups wrap rather than forcing controls into narrow targets. Dark and light themes use their own palette values; light mode is not simply an inversion of dark mode.
Percentage Calculations
The interface uses four distinct percentage references. These calculations are intentionally independent.
Summary Price Cards
Each card compares the latest available average-high or average-low value with the previous available daily record for that same series. The change is labeled "vs prior session." The latest available record may represent an incomplete current session. A missing or zero previous value produces an unavailable indicator rather than a calculated percentage.
Main Chart Axis
The percentage axis uses the midpoint between the high-average and low-average values of the first visible trading session. This gives both series a common reference for comparison. The baseline updates when the chart is panned, zoomed, or switched to another date range.
Main Chart Tooltips
Tooltip percentage changes compare each series with its own value in the first visible session: high to high, and low to low. Exact absolute prices remain visible alongside those percentages.
Market Ticker Tape
The ticker compares each series with its previous completed and verified trading session. The existing trading-session schedule and data-coverage checks determine which sessions qualify. Chart navigation and summary-card state do not affect these calculations.

All average-price displays retain four decimal places. Small nonzero percentage movements retain their sign. The volume summary sums the retrieved daily volumes, and its miniature chart uses those actual daily values. Price sparklines visualize the fetched averages without smoothing, estimation, or additional indicators. No additional API requests are required for these miniatures.
Separation of Responsibilities
- MarketSummary uses the pure dailySummary calculation and the shared lightweight MiniChart. It is memoized so chart pointer movement and ordinary search typing do not unnecessarily recalculate the cards.
- chartGeometry derives SVG paths, points, labels, and bounds from visible records and measured chart width. It does not retrieve or modify market data.
- MarketChart coordinates the existing calendar viewport, keyboard navigation, and pointer gestures. Pointer updates use the latest position once per animation frame, and drag release applies the final position. Touch interactions allow vertical page scrolling alongside horizontal chart panning.
- ChartDrawing is memoized separately from the moving ChartCursor. Crosshair updates do not require static chart paths or axes to redraw. Tooltip values are memoized for the selected record and reference, and measured tooltip dimensions constrain placement within the chart.
- ChartToolbar groups date range, axis mode, volume representation, fit, and appearance controls. ChartLegend preserves the price and fill controls while indicating that volume remains visible.
- DailyTable retains all records and the four required fields, independently of the chart's visible range. Sorting is memoized, and the table header remains visible within its scrollable region.
- Number and date formatting are centralized. Common Intl formatters are reused; currency formatting uses a bounded cache rather than unbounded process-level storage.
These changes reorganize presentation responsibilities only. Backend routes, daily aggregation, Yahoo Finance adapters, ticker-session validation, caching, dependencies, and the build and test stack remain unchanged.
Volume Visibility
Volume is no longer an optional visibility preference. Previously saved volume: false settings are discarded when loaded, the volume legend item is not a toggle, and appearance settings retain representation, color, opacity, and fill controls without offering a hide option.

Opacity has a 20% minimum. Previously saved zero-opacity settings recover to a visible default. The default steel-blue color and 85% opacity work in both themes, while valid previously selected colors and opacity values remain available. Sessions with genuinely zero volume still display zero; no artificial bar height is introduced.
Performance and Scope
The available month contains only a few dozen daily records, so the main chart and miniatures use straightforward SVG rendering. No new chart engine, UI framework, animation library, font provider, data API, canvas layer, or calendar dependency was introduced.

The ticker continues using CSS animation and a single shared data snapshot request. The interface uses restrained borders and gradients, without expensive blur or filter effects during chart movement.

Testing covers behavior and calculation boundaries rather than brittle pixel snapshots. See VALIDATION.md for the recorded results and limitations. No measured 60 FPS performance result, complete accessibility audit, or physical-device test coverage is claimed.