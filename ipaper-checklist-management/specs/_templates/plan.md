# Plan — {{feature_title}}

> **ID:** {{NNN}}-{{slug}}
> Responde: **COMO** implementar. Subordinado a `spec.md`.
> Referenciar `AGENTS.md` em vez de reescrever padrões.

---

## Visão técnica

<!-- Diagrama ou lista de componentes/hooks/serviços envolvidos. -->

---

## Mapeamento FR → módulo

| FR | Módulo `src/...` | Padrão AGENTS.md |
| --- | --- | --- |
| FR-001 | `src/...` | §N (DI / ViewModel / ...) |

---

## Estado e host-sync

<!-- Listar cada peça de estado e classificar conforme AGENTS.md §2:
- host-synced (sobrevive reload/link compartilhado)
- local-only (transient) -->

| Estado | Tipo | Justificativa |
| --- | --- | --- |
| ... | host-synced / local | ... |

---

## Interfaces (AGENTS.md §4)

<!-- Definir interfaces antes das classes. -->

```typescript
export interface ExampleService {
  // métodos necessários
}
```

---

## Trade-offs e alternativas

<!-- 2–3 bullets. Decisões estruturais vão em research.md como ADR. -->

- Alternativa A: ... — descartada porque ...
- Escolha: ...

---

## Riscos

<!-- - [risco] → [mitigação] -->
