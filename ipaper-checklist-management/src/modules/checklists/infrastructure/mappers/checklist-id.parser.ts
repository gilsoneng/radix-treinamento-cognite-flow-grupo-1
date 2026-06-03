export function checklistIdFromCitemExternalId(citemExternalId: string): string | undefined {
  const match = /^CKM_CITEM_GR1_(.+)-(\d{4}-\d{2}-\d{2})-([A-Z])-/.exec(citemExternalId);
  if (!match) {
    return undefined;
  }
  const route = match[1];
  const date = match[2];
  const shift = match[3];
  if (!route || !date || !shift) {
    return undefined;
  }
  return `CKM_CHK_GR1_${route}-${date}-${shift}`;
}
