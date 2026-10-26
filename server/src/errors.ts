export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export const invalidData = () =>
  new AppError(
    502,
    'INVALID_UPSTREAM_DATA',
    'Yahoo Finance returned an unexpected data format. Please try again.',
  );
