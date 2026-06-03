/**
 * JSON file writer — writes seed output files to docs/Seed/generated/<runId>/
 * Streams arrays in chunks to avoid loading everything in memory.
 */
import { createWriteStream, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath }    from 'node:url';

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let _runDir = null;

export function initOutput(runId, date) {
  const label = `${date}-${runId.slice(0, 8)}`;
  _runDir = resolve(APP_ROOT, `docs/Seed/generated/run-${label}`);
  mkdirSync(_runDir, { recursive: true });
  return _runDir;
}

/**
 * Write an array of objects to <name>.json (pretty-printed, chunked).
 * @param {string} name - filename without extension
 * @param {Array} items
 */
export function writeJson(name, items) {
  const path = resolve(_runDir, `${name}.json`);
  const ws = createWriteStream(path);
  ws.write('[\n');
  items.forEach((item, i) => {
    ws.write('  ' + JSON.stringify(item));
    if (i < items.length - 1) ws.write(',\n');
    else ws.write('\n');
  });
  ws.write(']\n');
  ws.end();
  return path;
}

/** Write a single JSON object (e.g., audit, manifest) */
export function writeJsonObject(name, obj) {
  const path = resolve(_runDir, `${name}.json`);
  const ws = createWriteStream(path);
  ws.write(JSON.stringify(obj, null, 2) + '\n');
  ws.end();
  return path;
}
