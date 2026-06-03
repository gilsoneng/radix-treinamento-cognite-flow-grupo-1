import type { CdfReadClient, InstanceNodeDto } from '../../../core/sdk/cdf-client';
import {
  DEFAULT_CHECKLIST_LIST_LIMIT,
  MAX_CHECKLIST_LIST_PAGES,
  NOT_OK_ITEM_SCAN_MAX_PAGES,
} from '../domain/checklist-kpi.model';

export type ViewRef = { space: string; externalId: string; version: string };

export type ListViewNodesPageResult = {
  items: InstanceNodeDto[];
  nextCursor?: string;
};

export async function listViewNodesPage(
  client: CdfReadClient,
  view: ViewRef,
  limit = DEFAULT_CHECKLIST_LIST_LIMIT,
  cursor?: string,
): Promise<ListViewNodesPageResult> {
  const response = await client.instances.list({
    instanceType: 'node',
    sources: [{ source: { type: 'view', ...view } }],
    limit,
    ...(cursor ? { cursor } : {}),
  });

  return {
    items: response.items,
    nextCursor: response.nextCursor,
  };
}

export async function listAllViewNodes(
  client: CdfReadClient,
  view: ViewRef,
  pageLimit = DEFAULT_CHECKLIST_LIST_LIMIT,
  maxPages: number | undefined = MAX_CHECKLIST_LIST_PAGES,
): Promise<InstanceNodeDto[]> {
  const items: InstanceNodeDto[] = [];
  let cursor: string | undefined;

  for (let page = 0; maxPages === undefined || page < maxPages; page += 1) {
    const response = await listViewNodesPage(client, view, pageLimit, cursor);
    items.push(...response.items);

    if (!response.nextCursor) {
      break;
    }
    cursor = response.nextCursor;
  }

  return items;
}

/** Scan ChecklistItem pages for non-empty notes (Not OK). Pass maxPages=undefined to scan all. */
export async function listChecklistItemsWithNotes(
  client: CdfReadClient,
  view: ViewRef,
  readNote: (item: InstanceNodeDto) => string,
  pageLimit = DEFAULT_CHECKLIST_LIST_LIMIT,
  maxPages: number | undefined = NOT_OK_ITEM_SCAN_MAX_PAGES,
): Promise<InstanceNodeDto[]> {
  const notedItems: InstanceNodeDto[] = [];
  let cursor: string | undefined;

  for (let page = 0; maxPages === undefined || page < maxPages; page += 1) {
    const response = await listViewNodesPage(client, view, pageLimit, cursor);

    for (const item of response.items) {
      if (readNote(item).trim().length > 0) {
        notedItems.push(item);
      }
    }

    if (!response.nextCursor) {
      break;
    }
    cursor = response.nextCursor;
  }

  return notedItems;
}
