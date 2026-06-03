# CONSTITUTION — Princípios invioláveis SDD

> Este arquivo define Definition of Ready, Definition of Done e os princípios que toda feature deve respeitar.
> **Não** reescreve `AGENTS.md` — referencia suas seções.
> **Em conflito com `AGENTS.md`, prevalece `AGENTS.md`.**

---

## Princípios

1. **Nenhum código de feature sem spec.** Toda mudança de comportamento em `src/` começa por `specs/<NNN>/spec.md` com FRs numerados. (AGENTS.md §10)
2. **Test-First.** Testes antes da implementação: integração → unidade → fonte. (AGENTS.md §6)
3. **Injeção de dependência.** Nunca importar serviço/SDK diretamente em componente ou hook. (AGENTS.md §3)
4. **Interface-Based Services.** Definir interface; implementar com classe; nunca referenciar concreto fora do próprio arquivo. (AGENTS.md §4)
5. **ViewModel separa lógica de renderização.** Estado em storage compartilhado, não em `useState` dentro do ViewModel. (AGENTS.md §5)
6. **Sem `any`/`as`.** TypeScript estrito; usar type guards. (AGENTS.md §7)
7. **Estado host-synced via `syncInternalState`.** Nunca `window.location` ou estado URL manual. (AGENTS.md §2)
8. **Rastreabilidade bidirecional.** `FR-###` aparece em `spec.md`, em `tasks.md`, no nome/descrição do teste e na matriz de `progress.md`.
9. **Conventional Commits.** Commits pequenos e buildáveis; subject em imperativo. (AGENTS.md §9)
10. **CDF-first para features com dados.** Qualquer feature que leia ou escreva dados
    do CDF DEVE ter a seção "Data Models & CDF Integration" em `spec.md` preenchida com
    as views reais de [`docs/datamodel.md`](../docs/datamodel.md) antes de avançar para
    o DoR. Nunca assumir nomes de propriedades ou versões de view sem consultar esse
    arquivo. O arquivo documenta **dois data models**: `ApmAppData v13` (space `cdf_apm`)
    e `CogniteCore v1` (space `cdf_cdm`).

---

## Definition of Ready (DoR)

> Gate antes de iniciar a etapa 5 — Implement.

**Fluxo completo:**
- [ ] `spec.md` sem placeholders `<!-- -->`; FRs numerados; cada FR é testável (imperativo mensurável)
- [ ] `research.md` sem clarificações bloqueantes abertas
- [ ] `plan.md` com cada FR mapeado a componente/serviço (AGENTS.md §3–§5)
- [ ] `tasks.md` com ordem Test-First; cada tarefa cita FR
- [ ] Se feature envolve CDF: seção Data Models preenchida em `spec.md`

**Fluxo leve (L1–L3):**
- [ ] `spec.md` com delta de FR ou nota de escopo
- [ ] `tasks.md` (ou seção em `spec.md`) com tarefas e FRs referenciados

---

## Definition of Done (DoD)

> Gate antes de marcar feature `status: done` em `progress.md`.

- [ ] `lint` + `test` + `build` verdes (CI green)
- [ ] Matriz FR→teste completa em `progress.md` (toda linha com `passing`)
- [ ] Sem `any`/`as` introduzidos (AGENTS.md §7)
- [ ] `SPEC.md` macro atualizado se comportamento visível ou modelo CDF mudou
- [ ] `specs/README.md` com status correto
- [ ] Para release/certificação: `Must Fix open: 0` (flows-code-review) e `Average score ≥ 3.8` (flows-design-review)

---

## Rigor completo vs leve

| Critério | Fluxo completo | Fluxo leve |
| --- | --- | --- |
| Nova tela / fluxo / integração CDF | Sim | — |
| Novo FR de negócio visível ao usuário | Sim | — |
| Bugfix / copy / CSS / refactor interno | — | Sim |
| Spike / exploração | Exceção documentada em `specs/README.md` | — |

---

## Hierarquia de documentos

`AGENTS.md` (1) > `CONSTITUTION.md` (2) > `SPEC.md` (3) > `specs/NNN/spec.md` (4) > `plan.md` (5)

Em conflito, o documento de maior precedência prevalece. Registrar divergência em `research.md`.
