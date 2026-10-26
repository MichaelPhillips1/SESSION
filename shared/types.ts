/** Public response shape required by the assessment. No chart-derived data belongs here. */
export interface DailyStock {
  day: string;
  lowAverage: number;
  highAverage: number;
  volume: number;
}
export interface StockResult {
  days: DailyStock[];
  currency: string;
  timezone: string;
  fetchedAt: string;
  skippedBars: number;
  sessions?: SessionCoverage[];
}
export interface ApiErrorBody {
  error: { code: string; message: string };
}

/** Internal Yahoo schedule/coverage metadata; never added to the assessment array. */
export interface SessionCoverage {
  day: string;
  start: number;
  end: number;
  covered: boolean;
}
