export function Icon({
  name,
  size = 18,
}: {
  name: 'search' | 'sun' | 'moon' | 'settings' | 'reset' | 'refresh' | 'arrow' | 'close' | 'volume';
  size?: number;
}) {
  const paths = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z" />,
    settings: (
      <>
        <path d="M4 7h16M4 17h16" />
        <circle cx="9" cy="7" r="3" />
        <circle cx="15" cy="17" r="3" />
      </>
    ),
    reset: (
      <>
        <path d="M4 9a8 8 0 1 1 0 7M4 3v6h6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7a8 8 0 0 0-14-1L3 9m0-6v6h6m-5 8a8 8 0 0 0 14 1l3-3m0 6v-6h-6" />
      </>
    ),
    arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
    volume: <path d="M5 19V11m5 8V5m5 14V8m5 11V3" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
