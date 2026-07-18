# Host Compatibility

The portable contract is the Agent Skills `SKILL.md` format. Discovery paths, invocation syntax, permissions, and subagent APIs remain host-specific.

| Host | Typical project path | Invocation | Verification |
| --- | --- | --- | --- |
| Codex | `.agents/skills/agentic-rd-skill/` | `$agentic-rd-skill` | Local discovery/activation smoke passed on Codex CLI 0.144.6. |
| Claude Code | `.claude/skills/agentic-rd-skill/` | `/agentic-rd-skill` | Local discovery/activation smoke passed on Claude Code 2.1.214; host permissions remain authoritative. |
| GitHub Copilot | `.agents/skills/agentic-rd-skill/` or `.github/skills/agentic-rd-skill/` | Automatic or host skill command | Local discovery/activation smoke passed on GitHub Copilot CLI 1.0.71. Other surfaces may expose different tools. |
| Gemini CLI | `.agents/skills/agentic-rd-skill/` or `.gemini/skills/agentic-rd-skill/` | Automatic or `/skills` | Format/path verified from current official documentation; no local binary was available for activation testing. |
| OpenCode | `.agents/skills/agentic-rd-skill/` or `.opencode/skills/agentic-rd-skill/` | Native `skill` tool | Local discovery/activation smoke passed on OpenCode 1.18.3. |

Local smoke snapshot: 2026-07-18 on Windows with isolated temporary workspaces, read-only activation prompts, no external research, and no persistent test workspace.

## Requirements

- Filesystem read/write access is required for durable workflow artifacts.
- Node.js 20 or newer is required only for `scripts/rd.mjs`.
- Web access is optional; offline runs must label current external facts as unverified.
- Native subagents are optional; the `compact` profile provides a single-agent fallback.
- Host limits and approval policies always override this skill.

## Distribution

The repository uses `skills/agentic-rd-skill/` so standard skill discovery and GitHub CLI publishing can identify the package. Install the skill directory, not the repository-level documentation and tests, unless the host's installer handles repository discovery.

Do not claim a host is smoke-tested unless a real activation test was run on the named version. Format compatibility derived from vendor documentation is not the same as behavioral verification.
