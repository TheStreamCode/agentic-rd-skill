#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');

const REQUIRED_SKILL_FILES = [
  'SKILL.md',
  'LICENSE',
  'references/workflow.md',
  'references/roles.md',
  'references/quality-and-safety.md',
  'references/compatibility.md',
  'references/laboratory-model.md',
  'references/example-run.md',
  'scripts/rd.mjs',
  'assets/project-brief.md',
  'assets/run-log.md',
  'assets/evidence.md',
  'assets/plan.md',
  'assets/execution.md',
  'assets/results.md',
  'assets/cross-review.md',
  'assets/stage-gate.md',
  'assets/final-output.md'
];

const REQUIRED_ROOT_FILES = [
  'README.md',
  'AGENTS.md',
  'RELEASING.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CITATION.cff',
  'package.json',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  '.github/FUNDING.yml',
  '.github/CODEOWNERS',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE/config.yml',
  '.github/ISSUE_TEMPLATE/bug_report.yml',
  '.github/ISSUE_TEMPLATE/documentation.yml',
  '.github/ISSUE_TEMPLATE/skill_improvement.yml',
  '.github/workflows/ci.yml',
  'evals/manifest.json',
  'evals/dogfood-v1.0.0.md',
  'evals/security-review-v1.1.0.md',
  'evals/usability-review.md',
  'requirements-validation.txt',
  'scripts/benchmark.mjs',
  'scripts/smoke-hosts.mjs',
  'tests/package.test.mjs',
  'tests/rd-cli.test.mjs',
  'tests/smoke-hosts.test.mjs'
];

function readText(filePath) {
  return readFileSync(filePath, 'utf8').replaceAll('\r\n', '\n');
}

function isRegularFile(filePath) {
  try {
    return lstatSync(filePath).isFile();
  } catch {
    return false;
  }
}

function parseScalarFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const values = {};
  for (const line of match[1].split('\n')) {
    if (/^\s/.test(line)) continue;
    const separator = line.indexOf(':');
    if (separator > 0) values[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return { raw: match[1], values };
}

function markdownFiles(root) {
  const files = [];
  // `.venv` is the documented local validator environment and `work/`/`project-brief.md`
  // are ignored local dogfood artifacts; neither is tracked product source.
  const ignoredDirectories = new Set(['.git', '.venv', 'coverage', 'node_modules', 'work']);
  const ignoredFiles = new Set([path.join(root, 'project-brief.md')]);
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!ignoredDirectories.has(entry.name)) visit(entryPath);
      } else if (entry.isFile() && entryPath.toLowerCase().endsWith('.md') && !ignoredFiles.has(entryPath)) {
        files.push(entryPath);
      }
    }
  };
  visit(root);
  return files;
}

function releaseVersion(root) {
  const packagePath = path.join(root, 'package.json');
  if (!isRegularFile(packagePath)) return null;
  try {
    const version = JSON.parse(readText(packagePath)).version;
    return typeof version === 'string' && /^\d+\.\d+\.\d+$/.test(version) ? version : null;
  } catch {
    return null;
  }
}

export function validateRepository(root = repositoryRoot) {
  const failures = [];
  const skillRoot = path.join(root, 'skills', 'agentic-rd-skill');
  const fail = (message) => failures.push(message);
  // package.json is the single source of truth for the release version; every other
  // surface listed in RELEASING.md is checked against it so a partial bump fails locally.
  const expectedVersion = releaseVersion(root);

  for (const relativePath of REQUIRED_ROOT_FILES) {
    const fullPath = path.join(root, relativePath);
    if (!isRegularFile(fullPath)) fail(`Missing repository file: ${relativePath}`);
  }
  for (const relativePath of REQUIRED_SKILL_FILES) {
    const fullPath = path.join(skillRoot, relativePath);
    if (!isRegularFile(fullPath)) fail(`Missing skill file: ${relativePath}`);
  }

  for (const legacyPath of [
    'SKILL.md',
    'scripts/init-rd-workflow.mjs',
    'scripts/validate-skill.mjs'
  ]) {
    if (existsSync(path.join(root, legacyPath))) fail(`Legacy v0.3 path remains: ${legacyPath}`);
  }

  const skillPath = path.join(skillRoot, 'SKILL.md');
  if (isRegularFile(skillPath)) {
    const skillText = readText(skillPath);
    const frontmatter = parseScalarFrontmatter(skillText);
    if (!frontmatter) {
      fail('SKILL.md must start with YAML frontmatter');
    } else {
      const { values, raw } = frontmatter;
      if (values.name !== 'agentic-rd-skill') fail('SKILL.md name must be agentic-rd-skill');
      if (!values.description || values.description.length > 1024) fail('SKILL.md description must be 1-1024 characters');
      if (!values.compatibility || values.compatibility.length > 500) fail('SKILL.md compatibility must be 1-500 characters');
      if (values.license !== 'MIT') fail('SKILL.md license must be MIT');
      if (/^allowed-tools\s*:/m.test(raw)) fail('Portable SKILL.md must not pre-approve host-specific tools');
      const skillVersion = raw.match(/^\s{2}version:\s*"(\d+\.\d+\.\d+)"\s*$/m)?.[1] ?? null;
      if (skillVersion === null) {
        fail('SKILL.md metadata version must be a quoted x.y.z string');
      } else if (expectedVersion && skillVersion !== expectedVersion) {
        fail(`SKILL.md metadata version ${skillVersion} must match package.json version ${expectedVersion}`);
      }
    }
    if (skillText.split('\n').length > 500) fail('SKILL.md must remain under 500 lines');
    for (const requiredReference of [
      'references/workflow.md',
      'references/roles.md',
      'references/quality-and-safety.md',
      'references/compatibility.md',
      'references/example-run.md',
      'scripts/rd.mjs'
    ]) {
      if (!skillText.includes(requiredReference)) fail(`SKILL.md must reference ${requiredReference}`);
    }
  }

  const packagePath = path.join(root, 'package.json');
  if (isRegularFile(packagePath)) {
    let packageJson;
    try {
      packageJson = JSON.parse(readText(packagePath));
    } catch (error) {
      fail(`Invalid package.json: ${error.message}`);
    }
    if (packageJson) {
      if (expectedVersion === null) fail('package.json version must be a semantic x.y.z string');
      if (packageJson.engines?.node !== '>=20') fail('package.json must require Node.js >=20');
      if (packageJson.scripts?.test !== 'node --test') fail('package.json test script must run node --test');
      if (packageJson.scripts?.check !== 'npm run validate && npm test && npm run benchmark') {
        fail('package.json check script must run validation, tests, and benchmark');
      }
      if (packageJson.scripts?.benchmark !== 'node scripts/benchmark.mjs') {
        fail('package.json benchmark script must run scripts/benchmark.mjs');
      }
      const keywords = packageJson.keywords ?? [];
      if (new Set(keywords).size !== keywords.length) fail('package.json keywords must be unique');
      for (const keyword of ['agent-skills', 'ai-research', 'research-agent', 'codex', 'claude-code']) {
        if (!keywords.includes(keyword)) fail(`package.json keywords must include ${keyword}`);
      }
    }
  }

  for (const workflowPath of ['.github/workflows/ci.yml']) {
    const fullPath = path.join(root, workflowPath);
    if (!isRegularFile(fullPath)) continue;
    const workflow = readText(fullPath);
    for (const match of workflow.matchAll(/^\s*-?\s*uses:\s*[^@\s]+@([^\s#]+)/gm)) {
      if (!/^[0-9a-f]{40}$/.test(match[1])) {
        fail(`${workflowPath} must pin actions to full commit SHAs`);
      }
    }
  }

  const citationPath = path.join(root, 'CITATION.cff');
  if (isRegularFile(citationPath) && expectedVersion) {
    const citationVersion = readText(citationPath).match(/^version:\s*"(\d+\.\d+\.\d+)"\s*$/m)?.[1] ?? null;
    if (citationVersion !== expectedVersion) {
      fail(`CITATION.cff version ${citationVersion ?? '<missing>'} must match package.json version ${expectedVersion}`);
    }
  }

  const readmePath = path.join(root, 'README.md');
  if (isRegularFile(readmePath) && expectedVersion) {
    const badgeVersion = readText(readmePath)
      .match(/!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-(\d+\.\d+\.\d+)-/)?.[1] ?? null;
    if (badgeVersion !== expectedVersion) {
      fail(`README version badge ${badgeVersion ?? '<missing>'} must match package.json version ${expectedVersion}`);
    }
  }

  const changelogPath = path.join(root, 'CHANGELOG.md');
  if (isRegularFile(changelogPath) && expectedVersion) {
    const escapedVersion = expectedVersion.replaceAll('.', '\\.');
    const released = new RegExp(`^## \\[?${escapedVersion}\\]? - \\d{4}-\\d{2}-\\d{2}[ \\t]*$`, 'm');
    if (!released.test(readText(changelogPath))) {
      fail(`CHANGELOG.md must contain a dated "## [${expectedVersion}] - YYYY-MM-DD" section`);
    }
  }

  const rootLicensePath = path.join(root, 'LICENSE');
  const skillLicensePath = path.join(skillRoot, 'LICENSE');
  if (
    isRegularFile(rootLicensePath)
    && isRegularFile(skillLicensePath)
    && readText(rootLicensePath) !== readText(skillLicensePath)
  ) {
    fail('Bundled skill LICENSE must match the repository LICENSE');
  }

  if (existsSync(root)) {
    for (const markdownPath of markdownFiles(root)) {
      const content = readText(markdownPath);
      const links = content.matchAll(/\[[^\]]*\]\((?!https?:\/\/|mailto:|#)([^)#]+)(?:#[^)]+)?\)/g);
      for (const match of links) {
        const target = path.resolve(path.dirname(markdownPath), match[1]);
        if (!existsSync(target)) {
          fail(`Broken local link in ${path.relative(root, markdownPath)}: ${match[1]}`);
        }
      }
    }
  }

  const evalPath = path.join(root, 'evals', 'manifest.json');
  if (isRegularFile(evalPath)) {
    try {
      const manifest = JSON.parse(readText(evalPath));
      if (manifest.schemaVersion !== 1) fail('eval manifest schemaVersion must be 1');
      if (!Array.isArray(manifest.cases) || manifest.cases.length < 5) fail('eval manifest must contain at least five cases');
    } catch (error) {
      fail(`Invalid eval manifest: ${error.message}`);
    }
  }

  return failures;
}

function run() {
  const failures = validateRepository();
  if (failures.length > 0) {
    console.error('Repository validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log('Repository validation passed.');
}

if (path.resolve(process.argv[1] ?? '') === scriptPath) run();
