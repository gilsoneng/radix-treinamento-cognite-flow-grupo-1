# Plan — Checklist Management (scaffold Flows)

> **ID:** 001-checklist-management
> Arquitetura atual do scaffold — base para features futuras.

---

## Visão técnica

```
App (root)
  └── CogniteSdkProvider (auth, loading/error fallback)
        └── AppContent
              ├── Card (Aura)
              │     ├── CardHeader — título + descrição
              │     └── CardContent
              │           ├── CHECKLIST_STEPS.map → Collapsible (Plan/Explore/Deploy)
              │           ├── Alert — deployment targets (org + project)
              │           └── Collapsible — Support
              └── (estado host-synced: nenhum no scaffold)
```

---

## Mapeamento FR → módulo

| FR | Módulo `src/` | Padrão AGENTS.md |
| --- | --- | --- |
| FR-001 | `src/App.tsx → AppContent` | §1 (Aura components) |
| FR-002 | `src/App.tsx → CHECKLIST_STEPS` | §1 (Collapsible, Badge) |
| FR-003 | `src/App.tsx → AppContent` | §2 (app.json + useCogniteSdk) |
| FR-004 | `src/App.tsx → loadingFallback` | §2 (CogniteSdkProvider loading) |
| FR-005 | `src/App.tsx → errorFallback` | §2 (CogniteSdkProvider error) |
| FR-006 | `src/App.tsx → CogniteSdkProvider` | §8 (auth via SDK) |

---

## Estado e host-sync

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| `client.project` | local | lido do CogniteClient; não precisa de URL sync no scaffold |
| `CHECKLIST_STEPS` | constante | conteúdo fixo, sem estado |

Não há estado host-synced no scaffold. Quando features reais adicionarem estado navegável (filtros, tab ativa, recurso selecionado), deve seguir AGENTS.md §2.

---

## Interfaces

Scaffold não define serviços customizados. Dependências injetáveis via `deps` prop (padrão `CogniteSdkProvider`):

```typescript
type AppDeps = {
  connectToHostApp: typeof connectToHostApp;
  createClient: (config: CogniteClientOptions) => CogniteClient;
};
```

---

## Trade-offs e alternativas

- Conteúdo do checklist como array de constantes (`CHECKLIST_STEPS`) em vez de CDF: adequado para scaffold estático; migrar para CDF quando o conteúdo for dinâmico.
- `CogniteSdkProvider` gerencia toda a lógica de auth/error: evita boilerplate por feature; limitação se precisar de auth customizado.

---

## Riscos

- Sem ViewModel separado no scaffold: aceitável enquanto `AppContent` só renderiza; criar `useAppViewModel` quando estado ou lógica crescerem.
- `app.json` importado diretamente em `App.tsx`: cria acoplamento de build; aceitável para config estática.
