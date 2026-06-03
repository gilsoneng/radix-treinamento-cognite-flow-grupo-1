#!/usr/bin/env node
/** Counts how many 250-item pages exist for grupo-1 ChecklistItems. */
import { getCdfClient } from './cdf-mcp/create-client.mjs';

const PAGE = 250;
const SPACE = 'flows_radix_checklist_group1';
const VIEW = { space: 'cdf_apm', externalId: 'ChecklistItem', version: 'v7' };

async function main() {
  const client = getCdfClient();
  let cursor;
  let pages = 0;
  let total = 0;

  do {
    const res = await client.instances.list({
      instanceType: 'node',
      sources: [{ source: { type: 'view', ...VIEW } }],
      filter: { equals: { property: ['node', 'space'], value: SPACE } },
      limit: PAGE,
      ...(cursor ? { cursor } : {}),
    });
    const batch = res.items?.length ?? 0;
    pages += 1;
    total += batch;
    cursor = res.nextCursor;
    if (pages <= 3 || !cursor) {
      console.log(`page ${pages}: ${batch} items, nextCursor=${cursor ? 'yes' : 'no'}`);
    }
    if (pages === 4 && cursor) {
      console.log('... (continuing)');
    }
  } while (cursor);

  console.log(`\nTotal: ${total} items in ${pages} batches of up to ${PAGE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
