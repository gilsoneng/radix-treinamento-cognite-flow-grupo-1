#!/usr/bin/env node
/**
 * Spec gate — valida disciplina SDD no repo.
 *
 * Modo warn (padrão): lista violações, exit 0.
 * Modo strict (--strict): lista violações, exit 1 se houver erros.
 *
 * Checks:
 *   C1 — toda specs/NNN-slug/ tem os 5 artefatos obrigatórios
 *   C2 — progress.md tem front-matter (feature, status, owner, updated)
 *   C3 — status ∈ valores permitidos
 *   C4 — diff toca src/*.{ts,tsx} → deve tocar specs/ também
 *   C5 — spec.md sem blocos de comentário <!-- -->
 *   C6 — spec.md contém pelo menos um FR-NNN
 *   C7 — (strict) cada FR-NNN em spec.md aparece em tasks.md
 *   C8 — (strict) se status: done → matriz FR→teste com ≥1 linha por FR
 *   C9 — nomes de pasta em specs/ batem regex NNN-slug
 *
 * Ref: docs/SDD-workflow-definition/avaliacao_sdd.md §32–§33
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const STRICT = process.argv.includes('--strict') || process.env.SPEC_GATE_MODE === 'strict';
const SPECS_DIR = 'specs';
const REQUIRED_ARTIFACTS = ['spec.md', 'plan.md', 'tasks.md', 'research.md', 'progress.md'];
const ALLOWED_STATUS = ['not-started', 'in-progress', 'blocked', 'done'];
const FEATURE_RE = /^\d{3}-[a-z0-9-]+$/;

// Paths isentos do C4 (mudanças nestes caminhos não exigem spec de feature)
const EXEMPT_PATH_PREFIXES = [
  'docs/',
  'specs/',
  'scripts/',
  '.github/',
  'references/',
  'reviews/',
  'certificates/',
];
const EXEMPT_ROOT_FILES = [
  'AGENTS.md',
  'SPEC.md',
  'CLAUDE.md',
  'README.md',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'eslint.config.mjs',
  'vitest.setup.ts',
  'app.json',
  '.gitignore',
  '.mcp.json',
];

const errors = [];
const warnings = [];

function report(level, check, message) {
  const entry = `[${check}] ${message}`;
  if (level === 'error') {
    errors.push(entry);
  } else {
    warnings.push(entry);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function featureDirs() {
  if (!existsSync(SPECS_DIR)) return [];
  return readdirSync(SPECS_DIR)
    .filter((name) => FEATURE_RE.test(name))
    .filter((name) => {
      try {
        return statSync(join(SPECS_DIR, name)).isDirectory();
      } catch {
        return false;
      }
    });
}

function readFile(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

function extractFRs(specContent) {
  const matches = specContent.match(/FR-\d{3}/g);
  return matches ? [...new Set(matches)] : [];
}

// ---------------------------------------------------------------------------
// C9 — nomes de pasta válidos
// ---------------------------------------------------------------------------

function checkFolderNames() {
  if (!existsSync(SPECS_DIR)) return;
  const entries = readdirSync(SPECS_DIR);
  for (const name of entries) {
    const fullPath = join(SPECS_DIR, name);
    if (!statSync(fullPath).isDirectory()) continue;
    if (name === '_templates') continue;
    if (!FEATURE_RE.test(name)) {
      report(STRICT ? 'error' : 'warn', 'C9', `pasta inválida em specs/: "${name}" — esperado NNN-slug (ex.: 001-minha-feature)`);
    }
  }
}

// ---------------------------------------------------------------------------
// C1 — artefatos obrigatórios
// ---------------------------------------------------------------------------

function checkArtifacts(feature) {
  for (const artifact of REQUIRED_ARTIFACTS) {
    if (!existsSync(join(SPECS_DIR, feature, artifact))) {
      report(STRICT ? 'error' : 'warn', 'C1', `[${feature}] artefato ausente: ${artifact}`);
    }
  }
}

// ---------------------------------------------------------------------------
// C2 / C3 — front-matter e status do progress.md
// ---------------------------------------------------------------------------

function checkProgress(feature) {
  const path = join(SPECS_DIR, feature, 'progress.md');
  if (!existsSync(path)) return;

  const content = readFile(path);
  const frontMatter = parseFrontMatter(content);

  if (!frontMatter) {
    report(STRICT ? 'error' : 'warn', 'C2', `[${feature}] progress.md sem front-matter YAML (bloco --- ... ---)`);
    return;
  }

  for (const field of ['feature', 'status', 'owner', 'updated']) {
    if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(frontMatter)) {
      report(STRICT ? 'error' : 'warn', 'C2', `[${feature}] progress.md sem campo obrigatório: "${field}"`);
    }
  }

  const statusMatch = frontMatter.match(/^status:\s*(\S+)/m);
  const status = statusMatch?.[1];
  if (status && !ALLOWED_STATUS.includes(status)) {
    report(STRICT ? 'error' : 'warn', 'C3', `[${feature}] progress.md status inválido: "${status}" — permitidos: ${ALLOWED_STATUS.join(', ')}`);
  }

  return status;
}

// ---------------------------------------------------------------------------
// C5 / C6 — spec.md sem placeholders e com FRs
// ---------------------------------------------------------------------------

function checkSpec(feature) {
  const path = join(SPECS_DIR, feature, 'spec.md');
  if (!existsSync(path)) return [];

  const content = readFile(path);

  if (/<!--/.test(content)) {
    report(STRICT ? 'error' : 'warn', 'C5', `[${feature}] spec.md contém placeholders <!-- --> — remover antes de fechar etapa Specify`);
  }

  const frs = extractFRs(content);
  if (frs.length === 0) {
    report(STRICT ? 'error' : 'warn', 'C6', `[${feature}] spec.md sem nenhum FR-NNN — adicionar requisitos funcionais numerados`);
  }

  return frs;
}

// ---------------------------------------------------------------------------
// C7 — (strict) FRs em spec.md aparecem em tasks.md
// ---------------------------------------------------------------------------

function checkTasksTraceFRs(feature, frs) {
  if (!STRICT || frs.length === 0) return;

  const tasksPath = join(SPECS_DIR, feature, 'tasks.md');
  const specPath = join(SPECS_DIR, feature, 'spec.md');

  // FRs podem estar em tasks.md ou numa seção "Tasks" dentro de spec.md
  const tasksContent = existsSync(tasksPath) ? readFile(tasksPath) : '';
  const specContent = readFile(specPath);
  const combined = tasksContent + specContent;

  for (const fr of frs) {
    if (!combined.includes(fr)) {
      report('error', 'C7', `[${feature}] ${fr} está em spec.md mas não aparece em tasks.md`);
    }
  }
}

// ---------------------------------------------------------------------------
// C8 — (strict) se done, matriz FR→teste preenchida
// ---------------------------------------------------------------------------

function checkDoneMatrix(feature, status, frs) {
  if (!STRICT || status !== 'done' || frs.length === 0) return;

  const progressPath = join(SPECS_DIR, feature, 'progress.md');
  const content = readFile(progressPath);

  const matrixSection = content.match(/## Matriz de rastreabilidade[\s\S]*/i)?.[0] ?? '';

  for (const fr of frs) {
    const hasTeste = new RegExp(`${fr}\\s*->\\s*\\S`).test(matrixSection);
    if (!hasTeste) {
      report('error', 'C8', `[${feature}] ${fr} não tem entrada na matriz FR→teste de progress.md — obrigatório para status: done`);
    }
  }
}

// ---------------------------------------------------------------------------
// C4 — rastreabilidade: diff src/ → deve tocar specs/
// ---------------------------------------------------------------------------

function normalizePath(p) {
  // Remove prefixo do monorepo se CI rodou fora do app
  return p.replace(/^ipaper-checklist-management\//, '');
}

function getDiffFiles() {
  try {
    const base = process.env.GITHUB_BASE_REF
      ? `origin/${process.env.GITHUB_BASE_REF}`
      : 'HEAD~1';
    const raw = execSync(`git diff --name-only ${base}...HEAD`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return raw
      .split('\n')
      .filter(Boolean)
      .map(normalizePath);
  } catch {
    // Sem base de comparação (ex.: primeiro commit, CI de push sem histórico)
    return null;
  }
}

function isExempt(filePath) {
  const base = filePath.split('/').pop() ?? '';
  if (EXEMPT_ROOT_FILES.includes(base) && !filePath.includes('/')) return true;
  if (EXEMPT_ROOT_FILES.includes(filePath)) return true;
  return EXEMPT_PATH_PREFIXES.some((prefix) => filePath.startsWith(prefix));
}

function checkTraceability(diffFiles) {
  if (diffFiles === null) return; // sem base — tolerante

  const srcFiles = diffFiles.filter(
    (f) => f.startsWith('src/') && /\.(ts|tsx)$/.test(f),
  );
  const nonExemptSrc = srcFiles.filter((f) => !isExempt(f));

  if (nonExemptSrc.length === 0) return; // PR não tocou src/

  const touchesSpecs = diffFiles.some((f) => f.startsWith('specs/'));
  if (!touchesSpecs) {
    report(
      STRICT ? 'error' : 'warn',
      'C4',
      `PR altera ${nonExemptSrc.length} arquivo(s) em src/ mas não referencia nenhuma feature em specs/ — criar ou atualizar specs/<NNN>-<slug>/`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

checkFolderNames();

const features = featureDirs();

for (const feature of features) {
  checkArtifacts(feature);
  const status = checkProgress(feature);
  const frs = checkSpec(feature);
  checkTasksTraceFRs(feature, frs);
  checkDoneMatrix(feature, status, frs);
}

const diffFiles = getDiffFiles();
checkTraceability(diffFiles);

// ---------------------------------------------------------------------------
// Relatório
// ---------------------------------------------------------------------------

const totalIssues = errors.length + warnings.length;
const mode = STRICT ? 'STRICT' : 'WARN';

if (totalIssues === 0) {
  console.log(`Spec gate OK [${mode}] — ${features.length} feature(s) validada(s), nenhuma violação.`);
  process.exit(0);
}

if (warnings.length > 0) {
  console.warn(`\nSpec gate — avisos (${warnings.length}):`);
  warnings.forEach((w) => console.warn(`  ⚠  ${w}`));
}

if (errors.length > 0) {
  console.error(`\nSpec gate — erros (${errors.length}):`);
  errors.forEach((e) => console.error(`  ✗  ${e}`));
}

if (STRICT && errors.length > 0) {
  console.error(`\nSpec gate FALHOU [STRICT] — corrigir os erros acima antes de mergear.`);
  process.exit(1);
} else {
  console.warn(`\nSpec gate WARN — ${totalIssues} aviso(s); pipeline não bloqueado.`);
  process.exit(0);
}
