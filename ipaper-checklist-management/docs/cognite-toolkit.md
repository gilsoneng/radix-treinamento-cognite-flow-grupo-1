# Cognite Toolkit — Guia do Projeto

> Documento de referência para uso do `cdf-tk` no projeto **ipaper-checklist-management**.
> Fonte oficial: [docs.cognite.com/cdf/deploy/cdf_toolkit](https://docs.cognite.com/cdf/deploy/cdf_toolkit/)

---

## 1. O que é o Cognite Toolkit

O **Cognite Toolkit** (`cdf-tk`) é a ferramenta de **Infrastructure as Code (IaC)** oficial
da Cognite para gerenciar recursos do CDF via arquivos YAML versionados em Git.

### O que o Toolkit gerencia

| Recurso | Pasta de tipo | Uso no projeto |
|---|---|---|
| Spaces (DMS) | `data_modeling/` | Criar `flows_radix_space_group1`, `ip_checklist_dm`, `flows_radix_checklist_group1` |
| Data Models (DMS) | `data_modeling/` | Declarar `ip_gp1_checklist_dm` v1 (space `ip_checklist_dm`) |
| Views + Containers (DMS) | `data_modeling/` | Definir schema das views custom (Atividade 5) |
| Transformations | `transformations/` | Não usado neste projeto ainda |
| Auth groups / capabilities | `auth/` | Não usado neste projeto |

### O que o Toolkit **não** gerencia

- **Instâncias** (nodes, edges) — essas são inseridas via SDK (`@cognite/sdk`) nos scripts de seed.
- Dados de time series, events, arquivos CDF — esses usam a Classic API diretamente.

---

## 2. Instalação

```bash
# Instalação global (Python pip — requer Python ≥ 3.10)
pip install cognite-toolkit

# Verificar versão
cdf-tk --version
# CDF-Toolkit version: 0.7.39.
```

> **Versão em uso:** `0.7.39` (instalada globalmente em Jun 2026).

---

## 3. Autenticação

O Toolkit lê as credenciais de um arquivo `.env` na pasta atual ou pai.
Copie `.env_example` → `.env` e preencha `IDP_CLIENT_ID` e `IDP_CLIENT_SECRET`.

```bash
cp .env_example .env
# Edite .env com as credenciais do service principal
```

### Variáveis necessárias (`.env`)

| Variável | Valor para este projeto |
|---|---|
| `CDF_CLUSTER` | `az-eastus-1` |
| `CDF_PROJECT` | `radix-dev` |
| `LOGIN_FLOW` | `client_credentials` |
| `IDP_CLIENT_ID` | `<seu client id>` |
| `IDP_CLIENT_SECRET` | `<seu client secret>` |
| `IDP_TENANT_ID` | `9339fb1c-0944-4fb9-808d-a278e53590e5` |
| `IDP_TOKEN_URL` | gerado automaticamente a partir do tenant id |

### Validar conexão

```bash
# Rodar a partir de ipaper-checklist-management/
echo "" | cdf-tk auth verify
```

**Resultado esperado (Jun 2026):**
```
Checking basic project configuration... OK
radix-dev — found
Microsoft Entra ID (tenant 9339fb1c-...) — OK
cognite_toolkit_service_principal capabilities — OK
WARNING [MEDIUM]: current client not in cognite_toolkit_service_principal group
  → Não bloqueia o uso; apenas indica que o SP não está no grupo padrão.
```

---

## 4. Estrutura do projeto Toolkit

```
ipaper-checklist-management/
├── config.yaml                         ← config principal (ambiente + módulos)
├── modules/                            ← módulos IaC do projeto
│   ├── infra/                          ← infra base (space de assets/TS)
│   │   └── data_modeling/
│   │       └── infra.Space.yaml        ← space flows_radix_space_group1
│   └── ip_checklist_dm/                ← data model custom do checklist
│       └── data_modeling/
│           ├── ip_checklist_dm.Space.yaml         ← spaces ip_checklist_dm + flows_radix_checklist_group1
│           ├── ip_checklist_dm.Container.yaml      ← 11 containers (storage layer das views nativas)
│           ├── ip_checklist_dm.View.yaml           ← 11 views nativas (KPI, SST, Analytics) — version "v1"
│           ├── external.View.yaml                  ← 8 views projetadas de ApmAppData + CogniteCore — version "v1"
│           └── ip_checklist_dm.DataModel.yaml      ← data model ip_gp1_checklist_dm (referencia 19 views com type: view)
└── build/                              ← gerado pelo cdf-tk build (gitignore)
    └── data_modeling/
        ├── 1.infra.Space.yaml
        ├── 2.external.View.yaml
        ├── 3.ip_checklist_dm.Container.yaml
        ├── 4.ip_checklist_dm.DataModel.yaml
        ├── 5.ip_checklist_dm.Space.yaml
        └── 6.ip_checklist_dm.View.yaml
```

### Regra de nomenclatura dos arquivos

O Toolkit exige que o **sufixo** do arquivo (`.<TipoRecurso>.yaml`) corresponda ao tipo:

| Tipo CDF | Sufixo de arquivo | Exemplo |
|---|---|---|
| Space | `.Space.yaml` | `infra.Space.yaml` |
| Data Model | `.DataModel.yaml` | `ip_checklist_dm.DataModel.yaml` |
| Container | `.Container.yaml` | `EquipmentCategory.Container.yaml` |
| View | `.View.yaml` | `EquipmentCategory.View.yaml` |
| Node (instância) | `.Node.yaml` / `.csv` | — |
| Edge (instância) | `.Edge.yaml` / `.csv` | — |

---

## 5. Spaces do projeto

| Space | Módulo | Finalidade |
|---|---|---|
| `ip_checklist_dm` | `ip_checklist_dm` | Schema: containers, views e data model do `ip_checklist_dm` |
| `flows_radix_checklist_group1` | `ip_checklist_dm` | **Instâncias** de checklists, templates, observações, KPIs |
| `flows_radix_space_group1` | `infra` | **Instâncias** de CogniteAsset e CogniteTimeSeries (A-Line IP) |

---

## 6. Fluxo de trabalho (build → deploy)

```bash
# 1. Validar auth
echo "" | cdf-tk auth verify

# 2. Build (valida YAML localmente, gera build/)
cdf-tk build

# 3. Deploy dry-run (sem escrever no CDF)
cdf-tk deploy --dry-run

# 4. Deploy real
cdf-tk deploy

# 5. Limpar recursos do CDF (reverter deploy)
cdf-tk clean
```

### O que cada comando faz

| Comando | O que faz |
|---|---|
| `cdf-tk build` | Valida YAMLs, resolve variáveis de env, ordena deploys, gera `build/` |
| `cdf-tk deploy` | Faz upsert de todos os recursos em `build/` para o CDF (idempotente) |
| `cdf-tk deploy --dry-run` | Simula o deploy sem alterar o CDF; exibe o que seria criado/atualizado |
| `cdf-tk clean` | Remove os recursos definidos no `build/` do CDF |
| `cdf-tk auth verify` | Testa as credenciais e lista capabilities disponíveis |
| `cdf-tk modules list` | Lista módulos disponíveis (Cognite-provided e custom) |
| `cdf-tk modules add` | Adiciona um módulo Cognite pré-existente ao projeto |

---

## 7. Definindo o data model `ip_gp1_checklist_dm` (Atividade 5)

O data model deployado tem as seguintes coordenadas no CDF:

| Campo | Valor |
|---|---|
| `space` | `ip_checklist_dm` |
| `externalId` | `ip_gp1_checklist_dm` |
| `version` | `v1` |

Contém 19 views: 11 nativas (`ip_checklist_dm.View.yaml`) + 8 externas (`external.View.yaml`).

### 7.1 Criar containers

Cada view nativa precisa de um container. Exemplo:

```yaml
# modules/ip_checklist_dm/data_modeling/ip_checklist_dm.Container.yaml
# (arquivo único com todos os 11 containers)
- space: ip_checklist_dm
  externalId: EquipmentCategory
  name: EquipmentCategory
  usedFor: node
  properties:
    code:
      type:
        type: text
        list: false
        collation: ucs_basic
      nullable: false
    name:
      type:
        type: text
        list: false
        collation: ucs_basic
      nullable: false
    # ATENÇÃO: direct relations exigem list: false explícito
    categoryRef:
      type:
        type: direct
        list: false
      nullable: true
```

> **Regra**: toda propriedade (scalar ou `direct`) deve ter `list: false` explícito — a ausência
> causa `KeyError: 'list'` no cdf-tk 0.7.39.

### 7.2 Views nativas (ip_checklist_dm.View.yaml)

Views nativas mapeiam diretamente sobre containers próprios. Versão obrigatória: `"v1"`.

```yaml
- space: ip_checklist_dm
  externalId: EquipmentCategory
  version: "v1"
  name: Equipment Category
  description: SST de categorias de equipamentos (PUMP, MOTOR, FAN...).
  properties:
    code:
      container:
        space: ip_checklist_dm
        externalId: EquipmentCategory
      containerPropertyIdentifier: code
      description: Código curto em maiúsculas (ex. PUMP, MOTOR, FAN).
    name:
      container:
        space: ip_checklist_dm
        externalId: EquipmentCategory
      containerPropertyIdentifier: name
      description: Nome completo da categoria.
```

### 7.3 Views externas (external.View.yaml)

Views externas projetam campos de containers de outros spaces (`cdf_apm`, `cdf_cdm`,
`cdf_core`, `cdf_apps_shared`) para dentro do space `ip_checklist_dm`.

**Estratégia adotada: sem `implements`** — cada propriedade declara seu container de origem
diretamente. Isso evita herdar o schema completo do tipo base, expondo somente os campos
efetivamente usados no seed e no Atlas AI.

```yaml
- space: ip_checklist_dm
  externalId: ApmTemplate
  version: "v1"
  name: Template (IP subset)
  description: >
    APM route template projetado para ip_checklist_dm.
    Sem implements — apenas os campos usados no seed estão expostos.
  properties:
    title:
      container:
        space: cdf_core
        externalId: Describable
      containerPropertyIdentifier: title
      description: Nome da rota de inspeção.
    status:
      container:
        space: cdf_apm
        externalId: Template
      containerPropertyIdentifier: status
      description: Status do template ("ready", "draft").
    rootLocation:
      container:
        space: cdf_apm
        externalId: Template
      containerPropertyIdentifier: rootLocation
      description: Relação direta com o CogniteAsset âncora da rota.
      type:
        type: direct_relation
        list: false
      source:
        space: ip_checklist_dm
        externalId: IpCogniteAsset
        version: v1
```

> **Por que sem `implements`?**
> Com `implements`, o CDF herda *todas* as propriedades do tipo base — incluindo relações diretas
> com constraint de `source` que causam conflito ao tentar redeclará-las. Sem `implements`,
> cada campo é mapeado individualmente sem herança de schema, dando controle total sobre
> o que é exposto e evitando o erro _"would change source from X to null"_.

### 7.3.1 Relações tipadas em views (`direct_relation` + `source`)

Para que o **CDF Data Explorer mostre as setas de relacionamento** entre views no grafo do data
model, é necessário declarar o `type` e o `source` (view de destino) em cada propriedade de
relação direta. O Toolkit v0.7.39 aceita os dois como **campos irmãos** — não aninhados:

```yaml
# ✅ Formato correto no Toolkit v0.7.39:
rootLocation:
  container:
    space: cdf_apm
    externalId: Template
  containerPropertyIdentifier: rootLocation
  description: Relação direta com o CogniteAsset âncora da rota.
  type:
    type: direct_relation   # ← campo irmão, não aninhado dentro de outro bloco
    list: false
  source:                   # ← também campo irmão (não dentro de type)
    space: ip_checklist_dm
    externalId: IpCogniteAsset
    version: v1
```

> **⚠️ Atenção:** O Toolkit gera `ResourceFormatWarning: unused field: 'type'` mas o build
> conclui e o `source` é passado à API corretamente. O warning refere-se ao campo `type`
> (que a validação interna do Toolkit ignora), mas o `source` é processado e tipifica
> a relação na API do CDF, habilitando o grafo de relacionamentos no Data Explorer.

**Padrão para lista de relações (`list: true`):**
```yaml
assets:
  container:
    space: cdf_cdm
    externalId: CogniteTimeSeries
  containerPropertyIdentifier: assets
  description: Lista de CogniteAssets associados a esta time series.
  type:
    type: direct_relation
    list: true
  source:
    space: ip_checklist_dm
    externalId: IpCogniteAsset
    version: v1
```

### 7.4 DataModel — referências com `type: view`

O `ip_checklist_dm.DataModel.yaml` lista as 19 views como referências **ViewId** (não definições
inline). Para que o SDK Python do cdf-tk interprete cada entrada como referência — e não como
`ViewApply` inline com `properties` vazio — é obrigatório incluir `type: view` em cada item:

```yaml
- externalId: ip_gp1_checklist_dm
  space: ip_checklist_dm
  version: "v1"
  views:
    - space: ip_checklist_dm
      externalId: EquipmentCategory
      version: "v1"
      type: view        # ← OBRIGATÓRIO — sem isso o SDK gera ViewApply vazio → erro 400
    - space: ip_checklist_dm
      externalId: ApmTemplate
      version: "v1"
      type: view
    # ... demais 17 views
```

> **Diagnóstico**: sem `type: view`, o `DataModelApply._load_view()` do Python SDK cai no branch
> `else` e cria um `ViewApply` com `properties=None`, que a API rejeita com
> _"Invalid view definition: missing required fields"_ (HTTP 400).

### 7.5 Ordem de deploy

O Toolkit resolve automaticamente, mas a ordem lógica é:

```
Spaces → Containers → Views (nativas + externas) → DataModel
```

### 7.6 Deploy completo

```bash
cdf-tk build --modules ip_checklist_dm   # validar YAMLs (build do módulo)
cdf-tk deploy                            # selecionar ip_checklist_dm no menu interativo
```

> **Importante:** `cdf-tk deploy` abre um **menu interativo** (checkbox) para selecionar os
> módulos. Deve ser executado em um terminal real (PowerShell/CMD), **não** em terminal
> não-interativo como o sandbox do Cursor — causa `NoConsoleScreenBufferError`.

### 7.7 Limpeza (clean)

Para remover o schema (views, containers, data model) do CDF:

```bash
cdf-tk build --modules ip_checklist_dm   # garantir build atualizado
cdf-tk clean                             # selecionar ip_checklist_dm no menu interativo
```

> **Ordem obrigatória:** deletar instâncias **antes** de fazer clean do schema.
> Use `npm run seed:clean:ip` para deletar apenas as instâncias do `ip_checklist_dm`
> (mantém APM e CDM intactos). Veja seção 8 para comandos de instâncias.

---

## 8. Inserção de instâncias (Atividade 5 — via SDK)

O Toolkit **não** faz upload de instâncias (nodes/edges). Para o seed de dados usamos
o script `scripts/seed/index.mjs` com `@cognite/sdk` direto:

```javascript
// Exemplo: upload de nodes (CogniteAsset)
await client.instances.upsert({
  items: [
    {
      space: 'flows_radix_space_group1',
      externalId: 'IP.ASSET.KAMYR001',
      instanceType: 'node',
      sources: [
        {
          source: { type: 'view', space: 'cdf_cdm', externalId: 'CogniteAsset', version: 'v1' },
          properties: { name: 'Kamyr Digester 001', ... }
        }
      ]
    }
  ]
});
```

---

## 9. Status atual (Jun 2026)

| Entrega | Status |
|---|---|
| `cdf-tk` instalado (v0.7.39) | ✅ |
| Auth validado contra `radix-dev` | ✅ |
| Estrutura do projeto (`config.yaml` + `modules/`) | ✅ |
| Space `flows_radix_space_group1` | ✅ deployado |
| Space `ip_checklist_dm` | ✅ deployado |
| Space `flows_radix_checklist_group1` | ✅ deployado |
| 11 Containers `ip_checklist_dm` | ✅ deployado 2026-06-03 |
| 11 Views nativas (`ip_checklist_dm.View.yaml`) | ✅ deployado 2026-06-03 |
| 8 Views externas sem `implements` (`external.View.yaml`) | ✅ deployado 2026-06-03 |
| Typed direct relations (`type: direct_relation` + `source`) em views | ✅ deployado 2026-06-03 |
| DataModel `ip_gp1_checklist_dm` v1 (19 views) | ✅ deployado 2026-06-03 |
| Script `seed:clean:ip` — limpa instâncias ip_checklist_dm | ✅ 2026-06-03 |

---

## 10. Referências

- [Toolkit Docs](https://docs.cognite.com/cdf/deploy/cdf_toolkit/)
- [Resource Reference](https://developer.cognite.com/sdks/toolkit/references/configs)
- [Data Modeling YAML reference](https://developer.cognite.com/sdks/toolkit/references/configs#data_modeling)
- Design do `ip_checklist_dm`: `docs/Seed/seed-design.md`
- Schema de todas as views: seção "3.5 Catálogo Completo" em `docs/Seed/seed-design.md`
