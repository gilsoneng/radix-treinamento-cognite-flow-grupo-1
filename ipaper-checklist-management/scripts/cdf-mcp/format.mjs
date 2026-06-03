/**
 * @param {unknown} data
 * @param {{ nextCursor?: string }} [meta]
 */
export function toolJsonResult(data, meta = {}) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ ...meta, data }, null, 2),
      },
    ],
  };
}

/**
 * @param {string} message
 */
export function toolErrorResult(message) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/**
 * @param {number | undefined} limit
 * @param {number} defaultLimit
 * @param {number} maxLimit
 */
export function clampLimit(limit, defaultLimit, maxLimit) {
  const value = limit ?? defaultLimit;
  return Math.min(Math.max(Math.trunc(value), 1), maxLimit);
}
