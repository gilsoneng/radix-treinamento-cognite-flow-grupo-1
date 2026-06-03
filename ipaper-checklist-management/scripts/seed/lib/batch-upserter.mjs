/**
 * BatchUpserter — safe CDF DMS upsert with batchSize + concurrency control + retry.
 * Max 1000 items/request, max 5 concurrent requests (DMS operational limits).
 * Retries 503 (Service Unavailable) and 409 (Lock timeout) with exponential backoff.
 */
import { log } from './logger.mjs';

const RETRYABLE_CODES  = new Set([503, 409, 429]);
const MAX_RETRIES      = 5;
const BASE_DELAY_MS    = 1000;

function isRetryable(err) {
  const msg = err?.message ?? '';
  if (RETRYABLE_CODES.has(err?.status ?? err?.statusCode)) return true;
  if (/status code: 503/i.test(msg)) return true;
  if (/lock timeout/i.test(msg))     return true;
  if (/rate limit/i.test(msg))       return true;
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class BatchUpserter {
  /**
   * @param {import('@cognite/sdk').CogniteClient} client
   * @param {{ batchSize?: number, maxConcurrency?: number, dryRun?: boolean }} opts
   */
  constructor(client, opts = {}) {
    this.client = client;
    this.batchSize = opts.batchSize ?? 1000;
    this.maxConcurrency = opts.maxConcurrency ?? 5;
    this.dryRun = opts.dryRun ?? false;
    this.counts = { nodes: 0, edges: 0, batches: 0, errors: 0, retries: 0 };
  }

  /** Upsert an array of node/edge instances */
  async upsert(instances) {
    const nodes = instances.filter(i => i.instanceType === 'node');
    const edges = instances.filter(i => i.instanceType === 'edge');
    if (nodes.length) await this._upsertBatched(nodes, 'nodes');
    if (edges.length) await this._upsertBatched(edges, 'edges');
  }

  async _upsertBatched(items, type) {
    const chunks = [];
    for (let i = 0; i < items.length; i += this.batchSize) {
      chunks.push(items.slice(i, i + this.batchSize));
    }

    // Process chunks in windows of maxConcurrency
    for (let i = 0; i < chunks.length; i += this.maxConcurrency) {
      const window = chunks.slice(i, i + this.maxConcurrency);
      await Promise.all(window.map(chunk => this._upsertChunk(chunk, type)));
    }
  }

  async _upsertChunk(chunk, type) {
    this.counts.batches++;
    if (this.dryRun) {
      log.debug(`[DRY-RUN] would upsert ${chunk.length} ${type}`);
      this.counts[type] += chunk.length;
      return;
    }

    let attempt = 0;
    while (true) {
      try {
        await this.client.instances.upsert({ items: chunk });
        this.counts[type] += chunk.length;
        log.debug(`Upserted ${chunk.length} ${type} (batch #${this.counts.batches})`);
        return;
      } catch (err) {
        if (isRetryable(err) && attempt < MAX_RETRIES) {
          attempt++;
          this.counts.retries++;
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          log.warn(`Retryable error (attempt ${attempt}/${MAX_RETRIES}) — retrying in ${delay}ms`, { message: err.message });
          await sleep(delay);
        } else {
          this.counts.errors++;
          log.error(`Failed to upsert ${chunk.length} ${type}`, { message: err.message });
          throw err;
        }
      }
    }
  }

  summary() {
    return {
      nodes:   this.counts.nodes,
      edges:   this.counts.edges,
      batches: this.counts.batches,
      retries: this.counts.retries,
      errors:  this.counts.errors,
    };
  }
}
