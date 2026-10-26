AI Collaboration Log
Project: SESSION Market Dashboard

Development Period: October 23–25, 2026

AI Assistant: Codex in ChatGPT Work Mode

This log documents the prompts I submitted during development, my reasoning behind each request, and the resulting work. It also records the implementation decisions and revisions made through AI assistance.
Entry 1: Initial Project Implementation
Date: October 23, 2026
Original Prompt
The task is to develop a full-stack stock market dashboard that retrieves, processes, and visualizes intraday stock trading data. You may notice this is not too dissimilar from the previous personal projects I have created on my own and shared. This is NOT to be completed to that analytical of a scale. Unlike my statistical models, this software will NOT be used for trading real funds and therefore should not focus on indicators, quantitative or statistical analysis, or assessment of market volatility.

HOWEVER, this project and deliverable should be treated as an MVP. You will be provided with the PDF of the project requirements. You are to use the tech stack that I have predetermined as a good choice for this.
Technology Stack Manifest
Frontend -> React + TypeScript

Backend -> Node.js + TypeScript + Express.js

Build Tool -> Vite

Styling -> Tailwind CSS + Vanilla CSS (depending on styling needs of components and need for complexity)

Charts -> I have looked into Recharts, but given my history with this type of deliverable, I am confident in suggesting a custom chart built with React, TypeScript, and creative implementations of CSS. Specifically, I am geared toward a high-average (green) and low-average (red) line chart, followed by a histogram of trading volume beneath the price chart. Volume visualization should be toggleable between histogram and line representations, with an optional gradient area fill. The region between the high-average and low-average lines should feature a transparent green-to-red shaded gradient. This should be implemented without unnecessary charting dependencies, it has been accomplished before so it should not be too hard to replicate.

Stock Market API -> Yahoo Finance Chart API. We have worked with this for years now, so aggregation should be no problem, but if you need an example of some Python code to do this, I can provide it.

Testing -> Vitest + Supertest. Vitest will be used for unit testing, particularly daily aggregation calculations, data validation, and business logic. Supertest will be used for integration testing of Express API endpoints, HTTP responses, and error handling. External API calls should be mocked where appropriate to ensure deterministic testing.

Version Control -> Git + GitHub for submission and tracking.

Documentation -> README.md + PROMPT_LOG.md. The README should include project architecture, installation instructions, prerequisites, environment configuration, and instructions for running and testing both the frontend and backend locally. PROMPT_LOG.md must document the AI prompts used throughout development, though this is auditing I am capable of doing myself. I am providing this portion for situational awareness. Any manual changes made outside AI assistance must also be documented and explained.

The solution must STRICTLY adhere to the requirements generated here, as well as STRICTLY adhere to the requirements in the PDF. Your return format should be in a zip file.

Before beginning, you should strongly consider all of the following:
1. Scalability and clean code is a key component of this deliverable. Non-scalable and non-legible code is useless when a project needs to scale and change, so this is a strong requirement on quality.
2. UI / UX is a key component of this as well. I want this application to draw inspiration from the modern, professional charting interfaces seen in platforms such as TradingView. This does NOT mean replicating their analytical functionality or introducing unnecessary features. Rather, I want to capture the visual sophistication, intuitive controls, and customization capabilities that make these platforms enjoyable to use. Common UI/UX suggestions include:
   - Dark and Light Themes: A sophisticated dark-mode-first interface featuring charcoal backgrounds, subtle borders, restrained accent colors, and clear typography. Users should be able to switch seamlessly between dark and light modes. Theme selection should persist between sessions.
   - Chart Appearance Customization: Allow users to customize line colors, thickness, opacity, and styles. Users should also be able to configure gradient fills, background colors, gridline visibility, and the transparency of the shaded region between high-average and low-average prices. Default colors should remain green for highs and red for lows.
   - Interactive Chart Scaling: Similar to TradingView, users should be able to expand, compress, zoom, and navigate the chart interactively. Support horizontal zooming and panning to adjust the visible date range. Vertical price-axis scaling should also be adjustable, allowing users to stretch or compress the displayed price range. Include an intuitive reset or auto-fit mechanism to restore the default chart view. These interactions should alter the visualization without modifying the underlying data.
   - Price Axis Display Modes: Allow users to toggle the vertical price axis between absolute dollar values ($) and percentage (%) values. Percentage mode should calculate changes relative to a clearly defined common reference price, ensuring that high-average and low-average series remain directly comparable. Axis labels and tooltips must update accordingly.
   - Interactive Crosshair and Tooltips: Implement a responsive crosshair that follows mouse movement across the chart, displaying the corresponding date, average high, average low, and trading volume. Tooltips should be visually refined, unobtrusive, and display values with the precision required by the assessment.
   - Volume Chart Customization: The volume visualization beneath the primary chart should support switching between histogram and line chart representations. Include optional gradient area fills, customizable colors, and opacity controls. The volume chart should remain synchronized with the primary chart's horizontal date axis.
   - Chart Navigation and Time Ranges: Provide intuitive controls for navigating the available historical data, including predefined viewing ranges such as one week, two weeks, and one month. Users should be able to reset the view or automatically fit all available data. These controls must respect the actual historical range retrieved from the API.
   - Chart Visibility Controls: Allow users to independently toggle the visibility of the high-average line, low-average line, gradient shading, volume display, and background gridlines. An interactive chart legend and compact settings panel would be appropriate mechanisms for controlling these elements.
   - Professional Dashboard Layout: The application should resemble a modern financial data platform rather than a generic demonstration website. Prioritize clean typography, intentional spacing, subtle visual hierarchy, polished controls, restrained accent colors, and thoughtful organization of information. The stock symbol search, chart, chart controls, and required daily data table should feel like cohesive parts of a single application.
   - Responsive Design: The interface must scale appropriately across desktop, tablet, and mobile screen sizes. Charts should resize dynamically without distorting data or creating illegible labels. Controls and navigation should remain usable on smaller screens.
   - Microinteractions and Visual Feedback: Incorporate subtle hover effects, smooth transitions, responsive buttons, and tasteful animations where appropriate. These should enhance usability rather than distract from the data. Loading states, empty states, invalid ticker messages, and API failure messages must be clearly communicated through the interface.
   - User Preferences and Persistence: Where practical, preserve user-selected visual preferences such as theme, chart appearance, and display modes using browser storage. Chart settings should be straightforward to modify and reset to defaults.
   - Accessibility and Usability: Maintain sufficient contrast in both themes, readable axis labels, accessible controls, keyboard-friendly navigation, and distinguishable chart series. Important information should not depend exclusively on color.
   - Performance and Responsiveness: Chart interactions should remain smooth, with minimal unnecessary React re-renders. Avoid excessive animations, unnecessary dependencies, and inefficient rendering approaches. Custom visualization components should be maintainable and extensible as the project grows.
These are design objectives rather than an invitation to introduce unnecessary complexity. The priority is to produce an elegant, responsive, highly interactive MVP that satisfies the assessment requirements while demonstrating exceptional frontend engineering and attention to detail. All chart functionality must operate on the daily aggregated data required by the PDF. No technical indicators, trading signals, volatility assessments, or additional financial modeling are necessary.

Return a first round deliverable in the form of a zipped project.
Logic Behind the Prompt
I supplied this prompt to establish the scope of the assessment, define the technology stack, communicate my visual and functional requirements, and specify the expected deliverable.

I also provided Take-Home Assessment(2).pdf as the authoritative source for the project's mandatory requirements.

The PDF established the backend endpoint, daily aggregation calculations, JSON response format, required precision, frontend functionality, error handling, and submission requirements.

I specifically requested a custom chart using React and TypeScript rather than introducing a charting dependency. I also wanted the project to remain focused on displaying the required financial data instead of expanding into trading indicators, forecasting, or statistical analysis.
Return
The AI produced the first-round project using the selected technology stack.

The implementation retained the green average-high line, red average-low line, gradient shading, volume visualization, chart customization, navigation controls, theme persistence, and error handling.

The required backend response remained a JSON array containing the daily aggregated values.
Implementation Decisions
Several additional implementation decisions were made during development:
- Incomplete 15-minute candles were omitted consistently when calculating daily aggregates.
- Trading dates were grouped using the exchange's local timezone.
- The original percentage scale used the midpoint of the first available trading day as its reference.
- The one-week and two-week chart ranges were implemented as calendar-day filters.
- Additional response metadata was placed in HTTP headers rather than changing the required JSON array.
- Backend price averages were rounded to four decimal places, with the frontend responsible for displaying trailing zeros.
- The daily breakdown table continued displaying absolute values when the chart was in percentage mode.
These decisions were documented in README.md and REQUIREMENTS.md.

The implementation excluded external chart libraries, trading indicators, a database, streaming updates, forecasting, and unrelated financial analytics.

Because I had not supplied a GitHub repository destination, the assistant returned a ZIP containing the project and local Git history instead of creating a remote repository.
AI-Assisted Review
During its implementation review, the AI also made the following corrections:
- Added strict runtime validation for Yahoo Finance response data before aggregation.
- Preserved the exchange's IANA timezone instead of silently falling back to UTC.
- Maintained the numeric API response while formatting four-decimal values in the frontend.
- Kept percentage and viewport transformations separate from the required daily data.
- Changed the low-average line to a dashed style and retained additional markers so the chart did not rely on color alone.
- Added request cancellation and active-request checks to prevent stale stock searches from replacing newer results.
- Corrected TypeScript array narrowing in aggregation callbacks.
- Replaced a tsx watch command that encountered IPC issues with Node.js native watch functionality using the tsx import mechanism.
- Added an accessible label to an appearance control that became icon-only on mobile.
- Extracted the daily table and summary into separate components to improve source organization.
- Used a compatible Chromium executable during verification when the standard browser download failed in the AI environment.
- Performed a separate live AAPL request through the Express API to verify upstream connectivity while keeping automated tests deterministic.
These were assistant-led implementation and review changes. They were not independent manual edits I performed.

No additional implementation prompts were issued during this initial build, and no other AI prompting services or subagents were used.
Entry 2: Functionality and UI Refinement
Date: October 24, 2026
Original Prompt
This is the continuing phase. Firmly maintain the tech stack, do not introduce new factors to it.
Attached Implementation Brief
I also supplied Pasted markdown(2).md, which was preserved in the project as:

docs/CONTINUATION_BRIEF.md

This document contains the implementation requirements for the continuation phase.

It covers UI changes, chart corrections, the scrolling ticker, and regression testing.
Logic Behind the Prompt
I wanted to refine the initial working dashboard while retaining the existing technology stack and assessment requirements.

The main objectives were to simplify the interface, correct the percentage calculations, improve chart navigation, and introduce a scrolling market ticker containing 28 specified symbols.

The continuation request also emphasized retaining the custom chart, Yahoo Finance integration, daily aggregation endpoint, appearance controls, volume visualization, and complete daily breakdown table.

I did not want these improvements to require additional frameworks or unnecessary dependency changes.
Return
The AI retained the existing React and TypeScript frontend, Node.js and Express backend, Vite, Tailwind CSS, custom SVG chart, Yahoo Finance integration, and testing infrastructure.

No package manifest or lockfile dependency changes were required.
UI Changes
The following UI changes were implemented:
- Removed the sidebar, predefined ticker list, decorative card, and associated obsolete styles.
- Removed the redundant SYMBOL label and source-to-daily label.
- Changed the percentage scale to use the first visible trading session as its reference.
- Separated chart-axis percentage calculations from individual series percentage readouts.
- Introduced a seven-calendar-day minimum viewing window.
- Replaced manual vertical scaling with automatically calculated price-axis limits and appropriate padding.
- Removed the grid visibility toggle and its obsolete saved preference while retaining the gridlines.
- Preserved equal trading-session spacing to prevent weekends from occupying unnecessary chart space.
Scrolling Ticker
The scrolling ticker was implemented using the exact symbol order supplied in the continuation brief.

A separate backend endpoint was added using the existing Yahoo Finance requests and aggregation logic.

The ticker implementation included:
- Validated regular trading-session windows.
- Checks for complete session data.
- Four concurrent request workers.
- Request deduplication.
- One-hour caching for successful requests.
- One-minute caching for failed requests.
- Conditional fallback to monthly data.
- No unnecessary polling.
- Independent loading so ticker failures would not interrupt the main dashboard.
The ticker animation was implemented using CSS and did not initiate additional data requests while scrolling.

Small nonzero movements retained their positive or negative direction, and percentage calculations with a zero denominator were treated as unavailable.

For reduced-motion and keyboard users, the ticker provided a static scrollable sequence. Repeated visual elements used for animation were excluded from unnecessary accessibility stops.
Additional Review Corrections
Additional corrections were made during the AI review process.

The original calendar-coordinate approach created excessive spacing for weekends, so the assistant retained equal-session rendering while enforcing the seven-day minimum through calendar-window calculations.

Tooltip positioning was revised to account for the available screen width.

Pointer interactions were corrected to prevent keyboard focus changes from interfering with ticker selection.

Browser tests were updated to cover the original and repeated ticker entries.

Gridline tests were revised to inspect SVG geometry and stroke properties rather than relying on zero-height DOM bounding boxes.

Ticker animation widths were calculated using layout measurements rather than transformed floating-point bounds.

Tests involving the moving ticker were also adjusted to use its hover-to-pause behavior.
Verification
The AI reported successful live Yahoo Finance checks for all 28 ticker entries.

The observed maximum was four concurrent upstream requests.

A repeated ticker batch did not produce additional upstream requests during the caching period.

The assessment-required API endpoint continued returning only the four required fields: day, lowAverage, highAverage, and volume.

The results were recorded in VALIDATION.md.

These changes and verification steps were performed through AI assistance. No independent manual source-code edits were reported during this phase.
Entry 3: Visual Refinement
Date: October 24, 2026
Original Prompt and Attached Materials
The complete original prompt for this phase is preserved in:

docs/VISUAL_REFINEMENT_BRIEF.md

I also supplied the conceptual dashboard image preserved as:

docs/design-reference.jpeg

The original Work log records these files as the inputs for the visual refinement phase.

The image was used as a design reference. Its sample stock prices, dates, company names, and percentages were illustrative rather than actual financial data.
Logic Behind the Prompt
I wanted to improve the dashboard's visual presentation and engineering quality without changing its underlying architecture or expanding the scope of the MVP.

The reference image established the intended layout, visual hierarchy, and general presentation.

The existing functionality was to remain intact, including the required daily aggregation, custom SVG chart, ticker tape, historical navigation, appearance settings, and full data table.

I also wanted the interface to remain efficient and maintainable rather than introducing additional libraries or replacing working components.
Return
The AI retained the existing dependencies, lockfile, frontend and backend technologies, Vite, Tailwind CSS, custom SVG chart, Vitest, Supertest, and existing browser testing tools.

The backend aggregation logic, financial data source, API contract, ticker caching and ordering, theme persistence, chart navigation, and daily data table were also preserved.
Visual Changes
The visual changes included:
- A more compact dashboard composition based on the conceptual reference.
- Summary cards containing data-derived price sparklines and a miniature volume chart.
- Explicit labels for changes between adjacent available trading sessions.
- Chart controls organized within the chart header.
- Refined colors, typography, borders, and spacing.
- A denser daily breakdown table.
- Improved layout behavior across smaller screens.
The volume chart was also made permanently visible.

The previous settings that allowed volume to be hidden or rendered with zero opacity were removed or adjusted to prevent the required metric from disappearing.

This was an intentional change to the earlier volume visibility behavior.
Engineering Decisions
The AI also made several changes to improve the organization and performance of the frontend.

Pure plot, summary, and miniature-chart geometry calculations were extracted from rendering components.

Static chart drawing was memoized separately from cursor interactions.

Pointer updates were coordinated through animation frames.

The final drag position was applied when the pointer was released.

Intl formatters were reused, and summary calculations and sorted table data were memoized where appropriate.

Tooltip dimensions were measured before clamping their positions within the available chart space.

The chart continued using straightforward SVG line segments rather than synthetic smoothing or another rendering engine.

The miniature summary charts reused existing aggregated financial data and did not require additional API requests.

The ticker animation remained independent of chart movement and did not trigger additional refreshes.
Percentage Reference Periods
The implementation retained separate percentage reference periods for different parts of the interface.

The summary high and low changes compare each series with its previous available session. A partially completed current session can be included in these summary values.

The main chart's percentage axis uses the midpoint of the first visible session.

Tooltip percentage changes use the corresponding series value from the first visible session.

The ticker tape compares the latest verified completed session against the previous verified completed session.

These differences are documented in DESIGN_NOTES.md.
Additional Corrections
After visual inspection, date-label density was adjusted to improve readability.

On smaller screens, the two price cards remained grouped while the volume card was allowed to occupy the full available width.

Separate color values were retained for the light theme.

A restrained steel-blue color was selected as the default volume visualization color.

Recovery of previously saved appearance settings was also checked.

The example companies, dates, stock prices, and ticker substitutions shown in the conceptual reference were not copied into production.

The application continued displaying values derived from the actual API response.
Verification
The results for this phase were recorded in VALIDATION.md.

Financial calculations and Yahoo Finance response handling remained covered by deterministic automated tests.

Live API checks were performed separately from those tests.

The implementation and verification were AI-assisted. No independent manual source-code edits were reported during this phase.
Entry 4: Final Installation and Documentation Update
Date: October 25, 2026
Original Prompt
I have now completed the final round of local validation for the SESSION Market Dashboard. All 93 automated unit and integration tests passed, TypeScript validation completed successfully, the production build succeeded, and all 30 Playwright end-to-end tests passed across desktop Chromium and mobile configurations.

At this point, I do not want any changes to the actual application. The objective of this final iteration is strictly to improve the project documentation so that a user can download the repository or ZIP, install the necessary dependencies, launch the application, and execute the test suites without encountering the environment configuration issues I experienced.

Please review and update the existing README.md accordingly.

There are several specific issues I encountered during my own setup that should be explicitly addressed.
1. Node.js Version Requirements
Initially, I attempted to run the application using Node.js v18, which caused the backend to fail because the --env-file-if-exists argument was not recognized.

I resolved this by upgrading to Node.js v24.22.1.

The README should clearly specify the minimum supported Node.js version based on the actual project configuration, with Node.js 24 LTS recommended if appropriate. Include instructions to verify the installed version using node -v.

Do not modify the application to support older Node.js versions. We simply need accurate documentation explaining the existing runtime requirements.
2. Windows PowerShell Execution Policy
After upgrading Node.js, I encountered another issue when executing npm commands in Windows PowerShell.

PowerShell prevented npm.ps1 from executing because script execution was disabled on my system.

The error was:

"npm.ps1 cannot be loaded because running scripts is disabled on this system."

This is a Windows PowerShell execution-policy restriction, not an application defect.

The README should explain this issue and provide a straightforward workaround using npm.cmd instead of npm.

For example:

npm.cmd ci

npm.cmd run dev

npm.cmd run check

npm.cmd run test:e2e

This should be presented as the recommended workaround for users experiencing this particular PowerShell restriction, because it does not require modifying Windows security settings.

Optionally explain that Git Bash and Command Prompt can run ordinary npm commands without this specific PowerShell issue.

Do not instruct reviewers to disable PowerShell security protections globally or unnecessarily modify their system configuration.
3. Dependency Installation and Application Startup
Ensure the README includes accurate, chronological instructions for starting the application from a clean installation.

These should cover:
- Installing a compatible Node.js version.
- Opening a terminal in the actual project root containing package.json.
- Verifying the Node.js and npm installations.
- Installing project dependencies using npm ci.
- Starting the frontend and backend using npm run dev.
- Opening the application at the correct localhost address.
- Stopping the development processes when finished.
Confirm all commands and localhost addresses against the actual package scripts and Vite/Express configuration rather than assuming their values.

Include the PowerShell npm.cmd alternatives where relevant.

Clearly distinguish between the commands used to install dependencies, launch the development environment, run automated tests, and build the application for production.
4. Automated Testing and Production Build
Clearly explain how reviewers can execute the existing automated tests and validate the production build.

The project currently supports npm run check, which executes TypeScript validation, the Vitest test suite, and the production build.

My latest execution produced the following successful results:
- TypeScript validation passed.
- 7 Vitest test files passed.
- 93 automated tests passed.
- Frontend production build succeeded.
- Backend TypeScript compilation succeeded.
Document the appropriate commands for running these checks, and briefly explain what each command verifies.

Make sure the documentation distinguishes between npm test, which executes the Vitest test suite, and npm run test:e2e, which executes the Playwright end-to-end browser tests.

Explain what a successful execution should look like so that reviewers can confidently determine whether their environment is working correctly.
5. Playwright End-to-End Browser Setup
This is particularly important.

When I initially ran npm run test:e2e, all 30 tests failed before execution because Playwright's Chromium browser executable had not been installed locally.

The error stated:

"browserType.launch: Executable doesn't exist"

Playwright instructed me to install the necessary browser binaries.

I resolved this using:

npx playwright install chromium

After installing Chromium, I reran:

npm run test:e2e

All 30 end-to-end tests subsequently passed across the desktop Chromium and mobile test configurations.

The README MUST explain that installing npm dependencies does not necessarily install the browser executable required by Playwright.

Include the browser installation command before the end-to-end testing command in the documented setup workflow.

Also explain that a missing Playwright browser executable is an environment setup issue rather than evidence of an application failure.

For Windows PowerShell users experiencing the npm.ps1 restriction, document the appropriate npm.cmd and npx.cmd command equivalents.

In particular, ensure that the installation and test execution steps are presented in the correct order.

A reviewer should not discover that an additional browser installation is required only after attempting to execute the end-to-end tests.
6. Documentation Quality and Reviewer Experience
The README should be written for an engineer who has never seen this project before.

Instructions must be accurate, easy to follow, logically ordered, and sufficient to reproduce a working local environment.

Keep the document professional, concise where appropriate, and technically precise. Avoid excessive explanations of basic development concepts, but do not assume that the reviewer already has the correct Node.js version, browser binaries, or terminal configuration.

Preserve existing useful documentation covering architecture, API functionality, environment variables, project structure, testing, and the Prometheus assessment requirements.

Do not replace the existing README with a generic template or unnecessarily expand it with redundant information.

The most important objective is that a reviewer can follow the setup instructions from beginning to end without needing to troubleshoot the same issues I encountered.
7. Scope Restrictions
DO NOT CHANGE THE TECHNOLOGY STACK.

DO NOT CHANGE APPLICATION FUNCTIONALITY.

DO NOT REFACTOR WORKING CODE.

DO NOT INTRODUCE NEW DEPENDENCIES.

DO NOT MODIFY TEST EXPECTATIONS OR DISABLE TESTS.

This is a documentation-focused change. Only modify other files if there is a genuine documentation-related necessity, and clearly explain why.

Preserve the existing architecture, source code, styling, charts, backend aggregation, and all functional behavior.

After updating the documentation, ensure that every documented command matches the current package.json scripts and project configuration.

If the existing PROMPT_LOG.md needs an additional entry documenting this final documentation improvement, update it accurately using the actual AI interaction and changes made. Do not fabricate manual review decisions or claim validation was performed unless it actually occurred.
8. Complete Installation and Troubleshooting Documentation
One final point I want to emphasize is that the documentation should provide a complete, cradle-to-grave walkthrough of the application's installation, configuration, execution, testing, and troubleshooting processes.

The instructions should account for someone approaching this repository with no prior familiarity with the project, including the environmental issues I encountered during my own installation.

I want the README to be comprehensive enough that a reasonably technically capable individual can follow it from start to finish without having to research missing steps, interpret ambiguous instructions, or independently diagnose foreseeable configuration problems.

Common errors should be accompanied by their likely causes, exact resolution steps, and methods for verifying that the issue has been resolved.

In particular, the documentation should anticipate and clearly explain:
- Installing an unsupported Node.js version and encountering unrecognized runtime arguments.
- Installing Node.js successfully but continuing to use an outdated version in an existing terminal session.
- Attempting to execute npm commands in PowerShell when script execution is restricted.
- Running commands from an incorrect working directory.
- Attempting to launch the application before dependencies have been installed.
- Encountering missing Playwright browser executables during end-to-end testing.
- Confusing Vitest unit/integration testing with Playwright browser testing.
- Encountering localhost port conflicts or an application that does not start as expected.
- Distinguishing between installation errors, application errors, and external Yahoo Finance API failures.
For each troubleshooting scenario, provide a concise description of the issue, its likely cause, the appropriate corrective action, and a way to verify that the problem has been resolved.

Only document troubleshooting instructions that are technically accurate and relevant to the existing application. Do not invent possible application failures or speculative solutions simply to make the documentation longer.

Where operating-system-specific differences are relevant, distinguish the appropriate commands for Windows PowerShell, Command Prompt, Git Bash, and other supported environments.

Avoid creating unnecessarily complicated setup procedures. Prefer the simplest reliable solution that works without requiring elevated privileges or unnecessary changes to system security settings.

The documentation should also communicate what successful execution looks like at each major stage. Someone following the guide should know when dependencies have installed successfully, when the development servers are running, where to access the application, and how to determine whether the automated tests and production build have passed.

This does not mean simplifying the technical content or writing the documentation for someone unfamiliar with software development. It means eliminating unnecessary assumptions and ensuring that every instruction is deliberate, accurate, and reproducible.

The README should function as both an installation guide and a reliable reference for diagnosing common environment-related issues.

I want a reviewer to be able to download this repository onto a compatible computer, follow the documented procedure in sequence, and successfully run and validate the application without needing to contact me for clarification.

The final README should reflect the same level of engineering quality, attention to detail, maintainability, and professionalism as the application itself.
Final Deliverable
The final deliverable should be the complete project as a ZIP archive, including the updated README.md, existing source code, tests, and required documentation.

I consider the application itself complete. The objective here is simply to make the submission reliable, reproducible, and straightforward for the Prometheus engineering team to evaluate.

Do not introduce unnecessary changes or additional functionality. Preserve the existing implementation and focus entirely on improving the accuracy, completeness, organization, and usability of the documentation.

The ultimate goal is to eliminate preventable setup friction and ensure that the engineering team can spend its time evaluating the actual software rather than troubleshooting environmental issues.

Treat the documentation as an integral part of the deliverable, not an afterthought. I want the complete project to demonstrate professionalism and engineering quality from the moment a reviewer opens the repository to the moment they successfully launch the application and execute its tests.
Logic Behind the Prompt
I provided this prompt after completing local validation and encountering several setup issues.

The purpose was to improve the installation and troubleshooting documentation without making further changes to the application.

I wanted the README to clearly explain the Node.js version requirement, PowerShell command restrictions, Playwright browser installation, application startup, automated tests, and production build.

The objective was to provide a complete installation process for someone unfamiliar with the project and reduce the likelihood of encountering the same environment problems I experienced.
Return
The AI updated README.md to provide a more complete installation, execution, testing, and troubleshooting guide.

The changes covered:
- Node.js installation and version verification.
- Refreshing the terminal and PATH after installation.
- Extracting the project and locating the correct project root.
- Installing dependencies.
- Starting and stopping the development environment.
- Accessing the application and health endpoints.
- Configuring optional environment settings.
- Running Vitest unit and integration tests.
- Installing Chromium before executing Playwright browser tests.
- Running the production build.
- Recognizing successful execution.
- Troubleshooting common installation and environment errors.
The README recommended npm.cmd and npx.cmd as workarounds for restricted Windows PowerShell environments without modifying system execution policies.

The documentation was checked against the existing package scripts, Node.js requirements, ports, proxy configuration, build paths, and health behavior.

Official Node.js and Playwright setup references were also included.

The AI additionally updated VALIDATION.md to distinguish my reported local results from validation performed in the AI execution environment.

No application source code, dependencies, configuration, styling, or test files were modified during this documentation pass.
Verification
The AI reported completing the following checks in a fresh project extraction:
- npm ci completed successfully.
- npm run check passed.
- Seven Vitest test files passed.
- All 93 automated unit and integration tests passed.
- TypeScript validation passed.
- Frontend and backend production builds succeeded.
- All 30 existing browser tests passed.
- Development application startup was checked.
- Direct and proxied health endpoints were checked.
- Production application startup and health behavior were checked.
- Process shutdown was checked.
The standard Chromium download returned a truncated archive in the AI execution environment, so verification used the existing supported browser executable override.

No additional dependency was introduced.

Windows-specific commands were reviewed but not executed on Windows during that AI verification session.

The validation document distinguishes these results from my separately reported local testing.