import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();

const requiredFiles = [
  'README.md',
  'AGENTS.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CITATION.cff',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/documentation.md',
  '.github/ISSUE_TEMPLATE/prompt_improvement.md',
  '.github/ISSUE_TEMPLATE/safety_concern.md',
  '.github/workflows/validate.yml',
  'prompts/master-orchestrator.md',
  'prompts/specialist-agent.md',
  'prompts/cross-review-agent.md',
  'prompts/stage-gate-reviewer.md',
  'prompts/final-synthesizer.md',
  'guides/00-overview.md',
  'guides/01-project-brief-guide.md',
  'guides/02-agent-selection.md',
  'guides/03-parallel-research.md',
  'guides/04-cross-review.md',
  'guides/05-stage-gate-review.md',
  'guides/06-final-synthesis.md',
  'guides/07-quality-standards.md',
  'templates/project-brief.md',
  'templates/orchestration-plan.md',
  'templates/specialist-output.md',
  'templates/cross-review-notes.md',
  'templates/stage-gate-review.md',
  'templates/final-output.md',
  'examples/legal-ai-saas.md',
  'docs/workflow.md',
  'docs/customization.md',
  'docs/safety-and-limitations.md',
  'docs/inspiration.md'
];

const requiredDirectories = [
  'prompts',
  'guides',
  'templates',
  'examples',
  'docs',
  '.github',
  '.github/ISSUE_TEMPLATE',
  '.github/workflows',
  'scripts'
];

const forbiddenPatterns = [
  { pattern: /\bTODO\b/i, reason: 'unresolved TODO marker' },
  { pattern: /\bTBD\b/i, reason: 'unresolved TBD marker' },
  { pattern: /lorem ipsum/i, reason: 'placeholder filler text' },
  { pattern: /OPENAI-API-KEY|api-key-here/i, reason: 'example API key placeholder' },
  { pattern: /password\s*[:=]/i, reason: 'password-like field' },
  { pattern: /secret\s*[:=]/i, reason: 'secret-like field' }
];

const expectedReferences = [
  'AGENTS.md',
  'prompts/master-orchestrator.md',
  'prompts/specialist-agent.md',
  'prompts/cross-review-agent.md',
  'prompts/stage-gate-reviewer.md',
  'prompts/final-synthesizer.md',
  'templates/project-brief.md',
  'templates/orchestration-plan.md',
  'templates/specialist-output.md',
  'templates/cross-review-notes.md',
  'templates/stage-gate-review.md',
  'templates/final-output.md',
  'docs/safety-and-limitations.md',
  'docs/inspiration.md'
];

const failures = [];

function normalizePath(filePath) {
  return filePath.replaceAll('\\', '/');
}

function fail(message) {
  failures.push(message);
}

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function walk(directory) {
  const entries = readdirSync(directory);
  const files = [];

  for (const entry of entries) {
    if (entry === '.git' || entry === 'node_modules') continue;

    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    files.push(normalizePath(path.relative(root, fullPath)));
  }

  return files;
}

function checkRequiredStructure() {
  for (const directory of requiredDirectories) {
    const fullPath = path.join(root, directory);
    if (!existsSync(fullPath) || !statSync(fullPath).isDirectory()) {
      fail(`Missing required directory: ${directory}`);
    }
  }

  for (const file of requiredFiles) {
    const fullPath = path.join(root, file);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) {
      fail(`Missing required file: ${file}`);
    }
  }
}

function checkMarkdownHeadings(files) {
  const markdownFiles = files.filter((file) => file.endsWith('.md'));

  for (const file of markdownFiles) {
    const text = readText(file);
    const normalizedText = text.replaceAll('\r\n', '\n');
    const content = normalizedText.startsWith('---\n') ? normalizedText.replace(/^---\n[\s\S]*?\n---\n/, '').trimStart() : normalizedText;
    if (!content.startsWith('# ')) {
      fail(`${file} must start with a level-1 Markdown heading`);
    }
  }
}

function checkForbiddenPatterns(files) {
  const checkedFiles = files.filter((file) => /\.(md|cff|yml|yaml|json)$/.test(file) || ['LICENSE', '.gitignore', '.editorconfig', '.gitattributes'].includes(file));

  for (const file of checkedFiles) {
    const text = readText(file);
    for (const { pattern, reason } of forbiddenPatterns) {
      if (pattern.test(text)) {
        fail(`${file} contains ${reason}`);
      }
    }
  }
}

function checkRelativeLinks(files) {
  const markdownFiles = files.filter((file) => file.endsWith('.md'));
  const linkPattern = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const file of markdownFiles) {
    const text = readText(file);
    const baseDirectory = path.dirname(file);
    const matches = text.matchAll(linkPattern);

    for (const match of matches) {
      const rawTarget = match[1].trim();
      if (!rawTarget || rawTarget.startsWith('#')) continue;
      if (/^(https?:|mailto:)/.test(rawTarget)) continue;

      const targetWithoutAnchor = rawTarget.split('#')[0];
      if (!targetWithoutAnchor) continue;

      const resolved = path.normalize(path.join(root, baseDirectory, targetWithoutAnchor));
      if (!resolved.startsWith(root) || !existsSync(resolved)) {
        fail(`${file} links to missing relative target: ${rawTarget}`);
      }
    }
  }
}

function checkPromptReferences() {
  const allText = requiredFiles
    .filter((file) => existsSync(path.join(root, file)))
    .map((file) => readText(file))
    .join('\n');

  for (const reference of expectedReferences) {
    if (!existsSync(path.join(root, reference))) {
      fail(`Expected referenced file does not exist: ${reference}`);
    }
  }

  const criticalReferences = [
    'AGENTS.md',
    'prompts/master-orchestrator.md',
    'prompts/stage-gate-reviewer.md',
    'prompts/final-synthesizer.md',
    'templates/project-brief.md',
    'templates/specialist-output.md',
    'templates/final-output.md'
  ];

  for (const reference of criticalReferences) {
    if (!allText.includes(reference)) {
      fail(`Critical file is not referenced in library documentation: ${reference}`);
    }
  }
}

function checkMetadata() {
  const readme = readText('README.md');
  const license = readText('LICENSE');
  const citation = readText('CITATION.cff');
  const packageJson = JSON.parse(readText('package.json'));

  if (!readme.includes('Michael Gasperini')) fail('README.md must name Michael Gasperini as author');
  if (!readme.includes('https://mikesoft.it')) fail('README.md must include https://mikesoft.it');
  if (!license.includes('Copyright (c) 2026 Michael Gasperini')) fail('LICENSE must include Michael Gasperini copyright');
  if (!citation.includes('family-names: Gasperini')) fail('CITATION.cff must include Gasperini family name');
  if (!citation.includes('given-names: Michael')) fail('CITATION.cff must include Michael given name');
  if (packageJson.author !== 'Michael Gasperini (https://mikesoft.it)') fail('package.json author metadata is incorrect');
  if (packageJson.license !== 'MIT') fail('package.json license must be MIT');
}

function checkWorkflow() {
  const workflow = readText('.github/workflows/validate.yml');
  if (!workflow.includes('npm test')) fail('validate workflow must run npm test');
  if (!workflow.includes('actions/setup-node')) fail('validate workflow must set up Node.js');
}

function checkAgentsWorkflow() {
  const agents = readText('AGENTS.md');
  const requiredSnippets = [
    'If real subagents are available',
    'simulate subagents',
    'Do not create or write `work/05-final-output.md` until the stage gate decision is `Approved`',
    '`Blocked`: stop and ask the user for clarification or missing external input',
    'I -->|Blocked|'
  ];

  for (const snippet of requiredSnippets) {
    if (!agents.includes(snippet)) {
      fail(`AGENTS.md is missing required workflow instruction: ${snippet}`);
    }
  }
}

checkRequiredStructure();
const files = walk(root);
checkMarkdownHeadings(files);
checkForbiddenPatterns(files);
checkRelativeLinks(files);
checkPromptReferences();
checkMetadata();
checkWorkflow();
checkAgentsWorkflow();

if (failures.length > 0) {
  console.error('Validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Validation passed: ${files.length} files checked.`);
