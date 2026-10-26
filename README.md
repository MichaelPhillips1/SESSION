SESSION Market Dashboard
A full-stack stock dashboard built for the Prometheus take-home assessment. Enter a stock symbol to view the past month's 15-minute Yahoo Finance data aggregated by trading day into average highs, average lows, and total volume. The React interface includes an interactive chart, a complete daily data table, and a scrolling market ticker.

Stack: React + TypeScript, Node.js + TypeScript + Express, Vite, Tailwind CSS and CSS, custom SVG charts, Vitest, Supertest, and Playwright.
1. Requirements
- Node.js 22.12.0 or newer; Node.js 24 LTS recommended. Node.js 18 is not supported.
- npm (included with Node.js).
- Internet access to install packages and retrieve live market data from Yahoo Finance.
Check your installation in a terminal:
node -v
npm -v
Windows PowerShell: If the terminal blocks npm.ps1 or npx.ps1, use npm.cmd and npx.cmd instead. For example, npm.cmd ci and npm.cmd run dev. You do not need to change PowerShell's execution policy.
2. Install and run
1. Extract the submitted ZIP file.
2. Open a terminal in the extracted session-dashboard folder, which contains package.json.
3. Install dependencies and start both the frontend and backend:
npm ci
npm run dev
In restricted Windows PowerShell, use:
npm.cmd ci
npm.cmd run dev
Open http://127.0.0.1:5173 to use the dashboard. The frontend runs on port 5173; the Express API runs on port 3001. The application initially loads AAPL, and you can enter another stock symbol or choose an entry in the ticker.

Keep the development terminal open while using the app. Press Ctrl+C to stop both servers.

No API key, database, or .env file is required. The public Yahoo Finance service can occasionally rate-limit requests or be temporarily unavailable.
3. Run the tests
Run TypeScript validation, all Vitest unit/integration tests (including Supertest API tests), and the production build:
npm run check
The submitted test suite contains 93 tests across 7 files. The command completes successfully when tests pass and both frontend and backend compile without errors. To run only the unit/integration tests, use npm test.
End-to-end browser tests
Before your first Playwright run, install its Chromium executable. Installing npm dependencies alone does not necessarily install the browser. Stop any running development server, then run:
npx playwright install chromium
npm run test:e2e
Restricted Windows PowerShell:
npx.cmd playwright install chromium
npm.cmd run test:e2e
The submitted Playwright suite contains 30 tests across desktop Chromium and mobile emulation. Playwright starts the development servers for its tests. The tests use mocked stock data, so they do not depend on Yahoo Finance being available.
4. Production build and local run
To run the compiled application locally instead of the development servers, stop npm run dev and use:
npm run build
npm start
Open http://127.0.0.1:3001. Express serves the compiled frontend and API on the same port. Press Ctrl+C to stop the server. Use npm.cmd run build and npm.cmd start in restricted PowerShell.
5. API and project structure
The assessment endpoint is GET /api/stocks/:symbol. It returns an array of daily records with exactly these four fields:
[
  {
    "day": "2009-01-30",
    "lowAverage": 40.2958,
    "highAverage": 49.7534,
    "volume": 49073348
  }
]
The example illustrates the required response format, not current market data. The backend requests the last month of 15-minute candles, groups them by exchange-local trading day, averages the valid intraday high and low values, and sums volume. Prices are rounded to four decimal places; the frontend displays all four places. Invalid symbols and upstream failures produce error responses.

Other endpoints:
- GET /api/market-tape — session-over-session high/low changes for the 28 ticker symbols.
- GET /api/health — returns {"status":"ok"} when the API server is running.
The main code is under client/ (React UI), server/ (Express API and aggregation), and shared/ (TypeScript types). Automated browser tests are in tests/e2e/. See REQUIREMENTS.md for assessment traceability, PROMPT_LOG.md for the AI collaboration record, and VALIDATION.md for test evidence. Additional implementation briefs and design notes are under docs/.
6. Common setup issues
- Unsupported Node.js version: If Node reports bad option: --env-file-if-exists, install Node.js 24 LTS, reopen the terminal, check node -v, and rerun the command.
- PowerShell blocks npm/npx: Use npm.cmd or npx.cmd as shown above; do not disable system security settings.
- Wrong working directory or missing dependencies: Run commands inside the folder containing package.json. If needed, rerun npm ci before starting the application.
- Missing Playwright browser: If browserType.launch: Executable doesn't exist, run npx playwright install chromium (or npx.cmd playwright install chromium in restricted PowerShell) before rerunning browser tests.
- Port 5173 or 3001 in use: Stop the other running instance and retry. The development server will not silently switch ports.
- Chart data fails but the server starts: Check http://127.0.0.1:3001/api/health. If it returns {"status":"ok"}, the local backend is responding; Yahoo Finance access, rate limits, or an invalid symbol may be the cause.
For additional testing details and known verification limits, see VALIDATION.md.