/**
 * beforeSubmitPrompt hook — detects manually edited files via git status.
 *
 * On every user message, runs `git status --porcelain` and checks if any
 * project files (source, YAMLs, scripts, docs, configs) have been modified
 * but not yet committed. If found, injects a context note so the agent
 * knows to ask about doc consistency — even when the user said nothing.
 */

import { execSync } from 'child_process';

const RELEVANT_PATTERNS = [
  /\.yaml$/,
  /\.yml$/,
  /\.ts$/,
  /\.tsx$/,
  /\.mjs$/,
  /\.js$/,
  /\.json$/,
  /\.md$/,
  /\.css$/,
  /\.env/,
];

function isRelevant(filePath) {
  return RELEVANT_PATTERNS.some((re) => re.test(filePath));
}

function getModifiedFiles() {
  try {
    const output = execSync('git status --porcelain', {
      cwd: process.cwd(),
      encoding: 'utf8',
      timeout: 5000,
    });

    return output
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        // git status --porcelain: "XY filename" or "XY old -> new"
        const status = line.slice(0, 2).trim();
        const file = line.slice(3).replace(/ -> .+$/, '').trim();
        return { status, file };
      })
      .filter(({ file }) => isRelevant(file));
  } catch {
    return [];
  }
}

// Read stdin (works on Windows and Unix)
const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const _input = JSON.parse(Buffer.concat(chunks).toString('utf8'));

const modified = getModifiedFiles();

if (modified.length === 0) {
  // Nothing relevant changed — let the prompt through unmodified
  process.stdout.write(JSON.stringify({}));
  process.exit(0);
}

const fileList = modified
  .map(({ status, file }) => `  [${status}] ${file}`)
  .join('\n');

const context = `
⚠️ MUDANÇAS DETECTADAS (git status) — o usuário pode ter feito ajustes manuais:
${fileList}

Antes de responder, verifique se esses arquivos têm impacto na documentação ou
consistência do projeto. Se sim, pergunte ao usuário:
"Você terminou os ajustes nesses arquivos? Posso revisar a consistência e atualizar a documentação?"
Não faça revisões ou atualizações sem essa confirmação.
`.trim();

process.stdout.write(
  JSON.stringify({
    additional_context: context,
  })
);
process.exit(0);
