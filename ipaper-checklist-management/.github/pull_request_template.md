## Descrição

<!-- Descreva o que este PR entrega em 1–2 frases. -->

---

## SDD — Checklist de spec

> Preencher sempre que este PR alterar arquivos em `src/`.
> Para PRs só de docs/deps/CI sem tocar `src/`, marcar "Sem mudança de comportamento" e pular.

- [ ] **Sem mudança de comportamento em `src/`** — PR é docs / deps / CI / config (exceto abaixo)

### Identificação da feature

- Feature: `specs/<NNN>-<slug>/`
- Rigor: `completo` / `leve` / `exceção` (motivo: ___)

### Spec

- [ ] `spec.md` sem placeholders `<!-- -->`
- [ ] Todo `FR-###` é testável (imperativo mensurável)
- [ ] Clarificações bloqueantes resolvidas em `research.md`

### Tasks e testes

- [ ] `tasks.md` (ou seção em `spec.md`) cita os FRs deste PR
- [ ] Testes escritos antes ou junto com implementação (AGENTS.md §6)
- [ ] `npm test` + `npm run lint` + `npm run build` verdes localmente

### Rastreabilidade

- [ ] Matriz FR→teste atualizada em `progress.md`
- [ ] `progress.md` front-matter atualizado (`status`, `updated`)

### Sincronização macro

- [ ] `SPEC.md` atualizado se comportamento visível ou modelo CDF mudou (AGENTS.md §0)
- [ ] `specs/README.md` atualizado se esta feature mudou de status

### Gate CI

- [ ] `npm run spec:check` rodou sem surpresas (warn)
- [ ] Adicionar label **`sdd-strict`** se esta feature está em `status: done` ou é PR de release

---

## Tipo de mudança

- [ ] `feat` — nova funcionalidade
- [ ] `fix` — correção de bug
- [ ] `refactor` — refatoração sem mudança de comportamento
- [ ] `test` — adição/correção de testes
- [ ] `docs` — apenas documentação
- [ ] `chore` — deps, CI, config
- [ ] `perf` — melhoria de performance

---

## Contexto adicional

<!-- Links de issues, screenshots, decisões relevantes. -->
