# Research — Checklist Management (scaffold Flows)

> **ID:** 001-checklist-management
> Decisões arquiteturais do scaffold e adoção do SDD.

---

## ADR-001 — Adoção do processo SDD no projeto

**Contexto:** O projeto `ipaper-checklist-management` tinha padrões de engenharia definidos em `AGENTS.md` e um `SPEC.md` macro vazio. Não havia rastreabilidade entre requisitos e testes, nem tracking de andamento por feature.

**Decisão:** Adotar Spec Driven Development com pasta `specs/` (plural, compatível com Cognite Flows / Spec Kit), gate CI em modo warn por padrão (strict via label `sdd-strict`), fluxo completo (7 etapas) e leve (3 etapas), e feature `001` como baseline legado.

**Consequência:** Toda mudança de comportamento em `src/` requer spec em `specs/<NNN>/`. Features novas em `002+`. Overhead adicional de documentação compensado por rastreabilidade e facilidade de onboarding.

---

## ADR-002 — `spec/` vs `specs/`

**Contexto:** A proposta original usava `spec/` (singular). O ecossistema Cognite Flows, Spec Kit e a skill `flows-app-brief` esperam `specs/<NNN>-<feature>/spec.md`.

**Decisão:** Adotar `specs/` (plural) para compatibilidade com o tooling Flows. Manter `SPEC.md` macro na raiz com nome distinto.

**Consequência:** Pre-scan do `flows-app-brief` coach funciona automaticamente. Colisão visual `SPEC.md` × `specs/` é aceita — contexto (arquivo vs pasta) diferencia os dois.

---

## ADR-003 — Gate CI warn vs strict

**Contexto:** Gate bloqueante desde o dia 1 cria fricção antes do hábito estar formado.

**Decisão:** Gate padrão em modo warn (exit 0 mesmo com avisos). Strict ativado por label `sdd-strict` no PR — para features `done` e PRs de release.

**Consequência:** Primeiros PRs não são bloqueados; time aprende o processo sem atrito. Convenção de label é manual mas explícita.

---

## ADR-004 — `cross-env` vs flags `.mjs` para modo strict

**Contexto:** Projeto roda em Windows (PowerShell) e CI Linux. `cross-env` resolveria a portabilidade mas adiciona dependência. Alternativa: flags no script Node.

**Decisão:** Usar flags `--strict` no `.mjs` (`process.argv.includes('--strict')`). Zero dependência extra; portável em qualquer shell.

**Consequência:** `npm run spec:check:strict` = `node scripts/spec-check.mjs --strict`. Sem `cross-env` no `package.json`.

---

## Clarificações resolvidas

- [x] Pasta dentro do app ou na raiz do monorepo? — Dentro de `ipaper-checklist-management/` (CI roda na raiz do app). — 2026-06-02
- [x] `fetch-depth` no CI — necessário `fetch-depth: 0` no checkout para `git diff` funcionar em PRs. — 2026-06-02
- [x] Comportamento do gate em `push: main` — C4 usa `HEAD~1` quando `GITHUB_BASE_REF` está vazio; impreciso mas aceito. — 2026-06-02
