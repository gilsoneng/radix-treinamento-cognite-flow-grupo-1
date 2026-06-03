# MCP CDF (Node) — consulta ao Data Model

Servidor MCP **local (stdio)** para o agente no Cursor explorar **data models, views, containers e instances** no CDF. Implementação alinhada às skills do projeto:

- **`setup-flows-auth`** — mesmo contrato de credenciais que o CLI/Flows (`.env` / `.env_example`)
- **`security`** — chamadas CDF só via **`@cognite/sdk`**; segredos só no `.env` (gitignored), nunca logados
- **`dm-limits-and-best-practices`** — limites conservadores, paginação com `cursor`, sem writes

**Não usa Python** (`cog-mcp-experimental`, `uvx`, `pipx`).

O data model explorado via este MCP está documentado em
**[`datamodel.md`](datamodel.md)** — contém dois data models:
- **`ApmAppData` v13** (space `cdf_apm`) — Checklists, Templates, Observations, Measurements
- **`CogniteCore` v1** (space `cdf_cdm`) — Assets, Equipment, Activities, Files, TimeSeries, Units

Consulte esse arquivo antes de criar DTOs, mappers ou queries.

---

## Pré-requisitos

1. Copiar [`.env_example`](../.env_example) para **`.env`** na raiz de `ipaper-checklist-management/`.
2. Preencher pelo menos:
   - `IDP_CLIENT_ID`
   - `IDP_CLIENT_SECRET`
   - `CDF_PROJECT` (e `CDF_CLUSTER` ou `CDF_URL`)
3. Service principal com permissão de leitura em Data Modeling no projeto.
4. `npm install` na pasta do app.

---

## Configuração no Cursor

O arquivo [`.mcp.json`](../.mcp.json) na raiz do app já declara o servidor **`cognite-cdf`**:

```json
{
  "mcpServers": {
    "cognite-docs": {
      "type": "http",
      "url": "https://docs.cognite.com/mcp"
    },
    "cognite-cdf": {
      "command": "node",
      "args": ["scripts/cdf-mcp/server.mjs"]
    }
  }
}
```

Depois de alterar `.mcp.json` ou `.env`, **reinicie os MCP servers** no Cursor (Settings → MCP → refresh).

Teste manual:

```bash
npm run mcp:cdf
```

O processo fica à espera em stdio; use o Cursor como cliente, não o terminal interativo.

---

## Autenticação

| Contexto | Auth |
| --- | --- |
| App no Fusion (iframe) | `@cognite/app-sdk` → token do host (`connectToHostApp`) |
| MCP local (Cursor) | **Client credentials** do `.env` → `oidcTokenProvider` no `@cognite/sdk` |

O MCP **não** lê o token do Fusion. Fora do iframe é obrigatório `IDP_CLIENT_ID` + `IDP_CLIENT_SECRET` no `.env`.

Fluxo:

1. `scripts/cdf-mcp/load-env.mjs` carrega variáveis do `.env` (sem imprimir secrets).
2. `scripts/cdf-mcp/token.mjs` obtém `access_token` no `IDP_TOKEN_URL` (Azure AD).
3. `scripts/cdf-mcp/create-client.mjs` instancia `CogniteClient` com `oidcTokenProvider`.

---

## Tools expostas

| Tool | Descrição |
| --- | --- |
| `cdf_project_info` | Projeto e URL do cluster (só `.env`) |
| `cdf_list_data_models` | Lista data models (`limit`, `space`, `cursor`) |
| `cdf_get_data_model` | Um data model por `space` / `externalId` / `version` |
| `cdf_list_views` | Lista views |
| `cdf_get_view` | Schema de uma view |
| `cdf_list_containers` | Lista containers de um space |
| `cdf_list_instances` | Lista instances de uma view (`instanceType` node/edge, limite ≤ 100) |

Todas são **somente leitura**. Para cargas grandes, repita chamadas com `cursor` devolvido na resposta JSON.

---

## Skills relacionadas (`.agents/skills/`)

| Skill | Uso com MCP |
| --- | --- |
| `dm-limits-and-best-practices` | Paginação, evitar 429, quando usar `search` vs `filter` |
| `security` | Não commitar `.env`, não expor tokens em logs |
| `setup-flows-auth` | Auth no app em produção/dev Fusion |
| `flows-code-review` / `flows-design-review` | Certificação do app (independente do MCP) |

Documentação CDF genérica: MCP HTTP **`cognite-docs`**.

---

## Troubleshooting

| Sintoma | Ação |
| --- | --- |
| `Missing .env` | Criar `.env` a partir de `.env_example` |
| `OAuth token request failed` | Conferir `IDP_*`, relógio do sistema, secret não expirado |
| HTTP 401/403 no CDF | Permissões do service principal no projeto `CDF_PROJECT` |
| 429 Too Many Requests | Reduzir `limit`, usar `cursor`, espaçar chamadas (ver skill DM) |
| MCP não aparece no Cursor | Reiniciar MCP; abrir workspace em `ipaper-checklist-management/` |
