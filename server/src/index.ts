import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('PORT must be an integer between 1 and 65535.');
const host = process.env.HOST ?? '127.0.0.1';
const server = createApp({
  staticDir: fileURLToPath(new URL('../../client/', import.meta.url)),
}).listen(port, host, () => console.log(`SESSION listening on http://${host}:${port}`));
for (const signal of ['SIGTERM', 'SIGINT'] as const)
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  });
