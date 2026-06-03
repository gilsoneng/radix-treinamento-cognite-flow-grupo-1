/**
 * Structured logger — writes to console + docs/Seed/logs/<runId>.log
 */
import { createWriteStream, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath }    from 'node:url';

// resolve relative to scripts/seed/lib → go up 3 levels to app root
const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let _stream = null;
let _runId = 'init';

export function initLogger(runId) {
  _runId = runId;
  const dir = resolve(APP_ROOT, 'docs/Seed/logs');
  mkdirSync(dir, { recursive: true });
  const file = resolve(dir, `${new Date().toISOString().slice(0, 10)}-${runId}.log`);
  _stream = createWriteStream(file, { flags: 'a' });
}

function write(level, msg, data) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}${data ? ' ' + JSON.stringify(data) : ''}`;
  if (level !== 'DEBUG') console.log(line);
  _stream?.write(line + '\n');
}

export const log = {
  info:  (msg, data) => write('INFO', msg, data),
  warn:  (msg, data) => write('WARN', msg, data),
  error: (msg, data) => write('ERROR', msg, data),
  debug: (msg, data) => write('DEBUG', msg, data),
};
