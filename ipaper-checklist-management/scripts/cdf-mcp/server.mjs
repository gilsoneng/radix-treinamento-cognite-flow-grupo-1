#!/usr/bin/env node
/**
 * MCP server (stdio) for read-only CDF Data Modeling exploration.
 * Stack: Node + @cognite/sdk + client credentials from .env (same as .env_example).
 * Do not use console.log — stdout is reserved for JSON-RPC.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { getCdfClient } from './create-client.mjs';
import { clampLimit, toolErrorResult, toolJsonResult } from './format.mjs';
import { loadEnv } from './load-env.mjs';

const server = new McpServer({
  name: 'cognite-cdf',
  version: '1.0.0',
});

/**
 * @param {(client: import('@cognite/sdk').CogniteClient) => Promise<unknown>} fn
 */
async function withClient(fn) {
  try {
    return await fn(getCdfClient());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return toolErrorResult(message);
  }
}

server.registerTool(
  'cdf_project_info',
  {
    description:
      'Returns CDF project and cluster URL from .env (no API call). Use before listing data models.',
    inputSchema: {},
  },
  async () => {
    try {
      const env = loadEnv();
      return toolJsonResult({
        project: env.CDF_PROJECT,
        baseUrl: env.CDF_URL,
        cluster: env.CDF_CLUSTER ?? null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return toolErrorResult(message);
    }
  },
);

server.registerTool(
  'cdf_list_data_models',
  {
    description: 'List data models in the CDF project (read-only, paginated).',
    inputSchema: {
      limit: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe('Page size (default 100, max 1000)'),
      space: z.string().optional().describe('Filter by space'),
      cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    },
  },
  async ({ limit, space, cursor }) =>
    withClient(async (client) => {
      const pageSize = clampLimit(limit, 100, 1000);
      const result = await client.dataModels.list({
        limit: pageSize,
        ...(space ? { space } : {}),
        ...(cursor ? { cursor } : {}),
      });
      return toolJsonResult(result.items ?? result, {
        nextCursor: result.nextCursor ?? undefined,
      });
    }),
);

server.registerTool(
  'cdf_get_data_model',
  {
    description: 'Retrieve one data model by space, externalId, and version.',
    inputSchema: {
      space: z.string().describe('Data model space'),
      externalId: z.string().describe('Data model external ID'),
      version: z.string().describe('Data model version'),
    },
  },
  async ({ space, externalId, version }) =>
    withClient(async (client) => {
      const result = await client.dataModels.retrieve([
        { space, externalId, version },
      ]);
      return toolJsonResult(result.items ?? result);
    }),
);

server.registerTool(
  'cdf_list_views',
  {
    description:
      'List views (read-only). Prefer filtering by space. Respects DMS pagination — use cursor for more pages.',
    inputSchema: {
      space: z.string().optional().describe('Space to list views from'),
      limit: z.number().int().min(1).max(1000).optional().describe('Page size (default 100)'),
      cursor: z.string().optional().describe('Pagination cursor'),
      includeGlobal: z
        .boolean()
        .optional()
        .describe('Include global views when supported by the API'),
    },
  },
  async ({ space, limit, cursor, includeGlobal }) =>
    withClient(async (client) => {
      const pageSize = clampLimit(limit, 100, 1000);
      const result = await client.views.list({
        limit: pageSize,
        ...(space ? { space } : {}),
        ...(cursor ? { cursor } : {}),
        ...(includeGlobal !== undefined ? { includeGlobal } : {}),
      });
      return toolJsonResult(result.items ?? result, {
        nextCursor: result.nextCursor ?? undefined,
      });
    }),
);

server.registerTool(
  'cdf_get_view',
  {
    description: 'Retrieve a single view schema by space, externalId, and version.',
    inputSchema: {
      space: z.string(),
      externalId: z.string(),
      version: z.string(),
    },
  },
  async ({ space, externalId, version }) =>
    withClient(async (client) => {
      const result = await client.views.retrieve([
        { space, externalId, version },
      ]);
      return toolJsonResult(result.items ?? result);
    }),
);

server.registerTool(
  'cdf_list_containers',
  {
    description: 'List containers in a space (read-only, paginated).',
    inputSchema: {
      space: z.string().describe('Container space'),
      limit: z.number().int().min(1).max(1000).optional().describe('Page size (default 100)'),
      cursor: z.string().optional(),
    },
  },
  async ({ space, limit, cursor }) =>
    withClient(async (client) => {
      const pageSize = clampLimit(limit, 100, 1000);
      const result = await client.containers.list({
        space,
        limit: pageSize,
        ...(cursor ? { cursor } : {}),
      });
      return toolJsonResult(result.items ?? result, {
        nextCursor: result.nextCursor ?? undefined,
      });
    }),
);

server.registerTool(
  'cdf_list_instances',
  {
    description:
      'List instances for a view (read-only). Keep limit low to avoid 429s; use cursor for full scans.',
    inputSchema: {
      space: z.string().describe('View space'),
      externalId: z.string().describe('View external ID'),
      version: z.string().describe('View version'),
      instanceType: z
        .enum(['node', 'edge'])
        .optional()
        .describe('Instance type (default node)'),
      limit: z.number().int().min(1).max(100).optional().describe('Page size (default 25, max 100)'),
      cursor: z.string().optional(),
    },
  },
  async ({ space, externalId, version, instanceType, limit, cursor }) =>
    withClient(async (client) => {
      const pageSize = clampLimit(limit, 25, 100);
      const result = await client.instances.list({
        instanceType: instanceType ?? 'node',
        limit: pageSize,
        ...(cursor ? { cursor } : {}),
        sources: [
          {
            source: {
              type: 'view',
              space,
              externalId,
              version,
            },
          },
        ],
      });
      return toolJsonResult(result.items ?? result, {
        nextCursor: result.nextCursor ?? undefined,
      });
    }),
);

async function main() {
  try {
    loadEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[cognite-cdf] ${message}`);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[cognite-cdf] MCP server ready (stdio)');
}

main().catch((error) => {
  console.error('[cognite-cdf] fatal:', error instanceof Error ? error.message : error);
  process.exit(1);
});
