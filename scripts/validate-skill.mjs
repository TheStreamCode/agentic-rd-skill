import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];

const requiredFiles = [
  'SKILL.md',
  'README.md',
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
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/skill_improvement.yml',
  '.github/ISSUE_TEMPLATE/documentation.yml',
  '.github/workflows/validate.yml',
  'references/workflow.md',
  'references/generalized-lab-model.md',
  'references/agent-roles.md',
  'references/quality-rules.md',
  'references/implementation-notes.md',
  'assets/agentic-rd-skill-hero.png',
  'assets/templates/project-brief.md',
  'assets/templates/lab-notes.md',
  'assets/templates/orchestration-plan.md',
  'assets/templates/specialist-output.md',
  'assets/templates/team-collaboration.md',
  'assets/templates/cross-review-notes.md',
  'assets/templates/stage-gate-review.md',
  'assets/templates/final-output.md',
  'scripts/init-rd-workflow.mjs',
  'scripts/validate-skill.mjs'
];

const forbiddenLegacyPaths = [
  'AGENTS.md',
  'prompts',
  'templates',
  'guides',
  'examples',
  'docs'
];

const requiredSkillReferences = [
  'references/workflow.md',
  'references/generalized-lab-model.md',
  'references/agent-roles.md',
  'references/quality-rules.md',
  'references/implementation-notes.md',
  'assets/templates/project-brief.md',
  'scripts/init-rd-workflow.mjs',
  'work/06-final-output.md'
];

function fail(message) {
  failures.push(message);
}

function readText(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function parseFrontmatter(relativePath) {
  const text = readText(relativePath).replaceAll('\r\n', '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);

  if (!match) {
    fail(`${relativePath} must start with YAML frontmatter`);
    return {};
  }

  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(':');
        if (separator === -1) return [line, ''];
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
  );
}

function checkRequiredFiles() {
  for (const file of requiredFiles) {
    const fullPath = path.join(root, file);
    if (!existsSync(fullPath) || !statSync(fullPath).isFile()) {
      fail(`Missing required file: ${file}`);
    }
  }
}

function checkLegacyPathsAreAbsent() {
  for (const relativePath of forbiddenLegacyPaths) {
    if (existsSync(path.join(root, relativePath))) {
      fail(`Legacy redundant path should not exist: ${relativePath}`);
    }
  }
}

function checkSkillFrontmatter() {
  if (!existsSync(path.join(root, 'SKILL.md'))) return;

  const frontmatter = parseFrontmatter('SKILL.md');
  const allowedKeys = new Set(['name', 'description', 'license', 'metadata', 'allowed-tools']);

  for (const key of Object.keys(frontmatter)) {
    if (!allowedKeys.has(key)) {
      fail(`Unexpected SKILL.md frontmatter key: ${key}`);
    }
  }

  if (frontmatter.name !== 'agentic-rd-skill') {
    fail('SKILL.md frontmatter name must be agentic-rd-skill');
  }

  if (!frontmatter.description || frontmatter.description.length > 1024) {
    fail('SKILL.md must have a description under 1024 characters');
  }

  if (frontmatter.license !== 'MIT') {
    fail('SKILL.md license must be MIT');
  }
}

function checkSkillReferences() {
  if (!existsSync(path.join(root, 'SKILL.md'))) return;

  const skill = readText('SKILL.md');
  for (const reference of requiredSkillReferences) {
    if (!skill.includes(reference)) {
      fail(`SKILL.md must reference ${reference}`);
    }
  }
}

function checkReadmePresentation() {
  if (!existsSync(path.join(root, 'README.md'))) return;

  const readme = readText('README.md');
  const requiredReadmeSnippets = [
    'assets/agentic-rd-skill-hero.png',
    'alt="Pixel-art overview of Agentic R&D Skill',
    'width="100%"'
  ];

  for (const snippet of requiredReadmeSnippets) {
    if (!readme.includes(snippet)) {
      fail(`README.md must include presentation snippet: ${snippet}`);
    }
  }
}

function checkParallelSubagentPolicy() {
  const requiredPolicySnippets = [
    ['SKILL.md', 'Prefer real parallel subagents'],
    ['SKILL.md', 'spawn all independent specialists before waiting'],
    ['SKILL.md', 'Collaborative Team Protocol'],
    ['references/implementation-notes.md', 'Parallel Subagent Policy'],
    ['references/implementation-notes.md', 'Spawn all independent specialists in the same orchestration wave'],
    ['references/implementation-notes.md', 'Team Collaboration Protocol'],
    ['references/workflow.md', 'Parallel Subagent Waves'],
    ['references/workflow.md', 'Team Collaboration Phase'],
    ['references/agent-roles.md', 'Parallelization Guidance'],
    ['references/agent-roles.md', 'Team Collaboration Guidance']
  ];

  for (const [relativePath, snippet] of requiredPolicySnippets) {
    if (!existsSync(path.join(root, relativePath))) {
      continue;
    }

    if (!readText(relativePath).includes(snippet)) {
      fail(`${relativePath} must include parallel subagent policy snippet: ${snippet}`);
    }
  }
}

function checkScaffoldScript() {
  const scriptPath = path.join(root, 'scripts', 'init-rd-workflow.mjs');
  if (!existsSync(scriptPath)) return;

  const tempRoot = mkdtempSync(path.join(tmpdir(), 'agentic-rd-skill-'));

  try {
    execFileSync(process.execPath, [scriptPath, tempRoot], { encoding: 'utf8' });

    const expectedCreatedPaths = [
      'project-brief.md',
      'work/00-lab-notes.md',
      'work/01-orchestration-plan.md',
      'work/02-specialist-outputs',
      'work/03-team-collaboration.md',
      'work/04-cross-review-notes.md',
      'work/05-stage-gate-review.md'
    ];

    for (const expectedPath of expectedCreatedPaths) {
      if (!existsSync(path.join(tempRoot, expectedPath))) {
        fail(`init-rd-workflow.mjs did not create ${expectedPath}`);
      }
    }

    if (existsSync(path.join(tempRoot, 'work/06-final-output.md'))) {
      fail('init-rd-workflow.mjs must not create work/06-final-output.md');
    }

    const marker = 'Existing brief must not be overwritten';
    const briefPath = path.join(tempRoot, 'project-brief.md');
    writeFileSync(briefPath, marker, 'utf8');
    execFileSync(process.execPath, [scriptPath, tempRoot], { encoding: 'utf8' });

    if (readFileSync(briefPath, 'utf8') !== marker) {
      fail('init-rd-workflow.mjs overwrote project-brief.md without --force');
    }
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

checkRequiredFiles();
checkLegacyPathsAreAbsent();
checkSkillFrontmatter();
checkSkillReferences();
checkReadmePresentation();
checkParallelSubagentPolicy();
checkScaffoldScript();

if (failures.length > 0) {
  console.error('Validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Validation passed: skill package, metadata, and scaffold script checked.');
