#!/usr/bin/env node
/**
 * Scaffold de nova feature SDD.
 *
 * Uso:
 *   npm run spec:new -- <NNN>-<slug>          ex.: npm run spec:new -- 002-filter-panel
 *   npm run spec:new -- --slug filter-panel    (NNN calculado automaticamente)
 *   npm run spec:new -- filter-panel           (NNN calculado automaticamente)
 *
 * O que faz:
 *   1. Calcula próximo NNN disponível se omitido
 *   2. Cria specs/<NNN>-<slug>/ copiando specs/_templates/
 *   3. Substitui {{NNN}}, {{slug}}, {{feature_title}}, {{owner}}, {{date}}
 *   4. Adiciona linha no specs/README.md (índice)
 *   5. Aborta se a pasta já existir
 *
 * Ref: docs/SDD-workflow-definition/avaliacao_sdd.md §34
 */

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SPECS_DIR = 'specs';
const TEMPLATES_DIR = join(SPECS_DIR, '_templates');
const FEATURE_RE = /^\d{3}-[a-z0-9-]+$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const TEMPLATE_FILES = ['spec.md', 'plan.md', 'tasks.md', 'research.md', 'progress.md'];

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------

function parseArgs(args) {
  let slug = null;
  let nnn = null;

  const slugFlag = args.find((a) => a.startsWith('--slug='));
  if (slugFlag) {
    slug = slugFlag.split('=')[1];
  }

  const slugArg = args.find((a) => a === '--slug');
  if (slugArg) {
    slug = args[args.indexOf(slugArg) + 1];
  }

  const positional = args.find((a) => !a.startsWith('--'));
  if (positional) {
    if (FEATURE_RE.test(positional)) {
      nnn = positional.slice(0, 3);
      slug = positional.slice(4);
    } else if (SLUG_RE.test(positional)) {
      slug = positional;
    }
  }

  return { slug, nnn };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function featureDirs() {
  if (!existsSync(SPECS_DIR)) return [];
  return readdirSync(SPECS_DIR)
    .filter((name) => FEATURE_RE.test(name))
    .filter((name) => statSync(join(SPECS_DIR, name)).isDirectory());
}

function nextNNN() {
  const existing = featureDirs()
    .map((d) => parseInt(d.slice(0, 3), 10))
    .filter((n) => !isNaN(n));
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return String(max + 1).padStart(3, '0');
}

function toTitle(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function gitUser() {
  try {
    return execSync('git config user.name', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return 'time';
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function applyTemplate(content, vars) {
  return content
    .replace(/\{\{NNN\}\}/g, vars.nnn)
    .replace(/\{\{slug\}\}/g, vars.slug)
    .replace(/\{\{feature_title\}\}/g, vars.title)
    .replace(/\{\{owner\}\}/g, vars.owner)
    .replace(/\{\{date\}\}/g, vars.date);
}

function insertReadmeLine(featureId, slug, owner) {
  const readmePath = join(SPECS_DIR, 'README.md');
  if (!existsSync(readmePath)) return;

  const content = readFileSync(readmePath, 'utf8');
  const tableMarker = '| --- | --- | --- | --- | --- | --- |';
  const newLine = `| ${featureId.slice(0, 3)} | ${slug} | not-started | ${owner} | completo | — |`;

  if (content.includes(newLine)) return;

  const updated = content.replace(tableMarker, `${tableMarker}\n${newLine}`);
  writeFileSync(readmePath, updated, 'utf8');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const rawArgs = process.argv.slice(2);
const { slug, nnn: explicitNNN } = parseArgs(rawArgs);

if (!slug) {
  console.error('Uso: npm run spec:new -- <slug>  ou  npm run spec:new -- <NNN>-<slug>');
  console.error('Exemplos:');
  console.error('  npm run spec:new -- 002-filter-panel');
  console.error('  npm run spec:new -- filter-panel');
  process.exit(1);
}

if (!SLUG_RE.test(slug)) {
  console.error(`Slug inválido: "${slug}" — usar apenas letras minúsculas, números e hífens (ex.: filter-panel)`);
  process.exit(1);
}

if (!existsSync(TEMPLATES_DIR)) {
  console.error(`Templates não encontrados em "${TEMPLATES_DIR}" — executar na raiz do app.`);
  process.exit(1);
}

const nnn = explicitNNN ?? nextNNN();
const featureId = `${nnn}-${slug}`;
const featureDir = join(SPECS_DIR, featureId);

if (existsSync(featureDir)) {
  console.error(`Feature já existe: "${featureDir}" — usar pasta existente ou escolher outro slug.`);
  process.exit(1);
}

const vars = {
  nnn,
  slug,
  title: toTitle(slug),
  owner: gitUser(),
  date: today(),
};

mkdirSync(featureDir, { recursive: true });

for (const file of TEMPLATE_FILES) {
  const srcPath = join(TEMPLATES_DIR, file);
  if (!existsSync(srcPath)) {
    console.warn(`Template ausente: ${srcPath} — pulando.`);
    continue;
  }
  const content = readFileSync(srcPath, 'utf8');
  const rendered = applyTemplate(content, vars);
  writeFileSync(join(featureDir, file), rendered, 'utf8');
}

insertReadmeLine(featureId, slug, vars.owner);

console.log(`\nFeature criada: specs/${featureId}/`);
console.log('Arquivos gerados:');
TEMPLATE_FILES.forEach((f) => console.log(`  specs/${featureId}/${f}`));
console.log('\nPróximos passos:');
console.log(`  1. Preencher specs/${featureId}/spec.md com FRs reais (sem placeholders {{}})`);
console.log('  2. Resolver clarificações em research.md');
console.log('  3. Criar tasks.md com ordem Test-First');
console.log('  4. npm run spec:check — verificar disciplina SDD');
