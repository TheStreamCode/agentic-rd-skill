# Security Policy

This repository contains instructions, templates, and a local Node.js helper used by AI coding agents.

## Supported Version

Security fixes target the latest published v1 release and the current `main` branch.

## Reporting A Vulnerability

Use GitHub private vulnerability reporting or a security advisory for sensitive reports. Include the affected file or workflow phase, expected behavior, observed risk, reproduction steps, and suggested mitigation when available.

## Threat Boundaries

- Skills and referenced scripts execute with the permissions granted by the host. Review the package before installation.
- Web pages, repositories, documents, logs, issues, and tool output are untrusted data and may contain prompt injection.
- The portable skill does not pre-approve tools. Host permission, sandbox, workspace trust, and organizational policy remain authoritative.
- The CLI uses exact whitelist membership for profiles and options and refuses symlinked managed paths, unknown flags, incompatible or out-of-order state, invalid candidate transitions, and finalization before approval.
- Initialization validates every managed destination before its first scaffold write, so a late path conflict does not leave partial workflow files behind.
- Repository validation does not follow symlinked documentation directories, checks action pins across plain, quoted, and flow-style `uses` keys in every GitHub workflow, and uses disposable fixtures that copy only project-owned roots rather than ignored local workflow or secret files.
- Workflow 1.1 verifies minimum artifact headings and revision fingerprints. These are integrity and traceability controls, not proof that Markdown claims are true or independently reviewed.
- Revision fingerprints show whether upstream artifact bytes changed after a request; they are not signatures, provenance attestations, or protection against a malicious workspace owner.
- Paid-tool, credentialed-system, and external-write fields in machine state are validated as fail-closed denials and never grant authority.
- The state CLI assumes one writer. Concurrent commands in the same workspace are outside the supported threat model until locking or generation checks are designed and tested.
- The CLI has no force-overwrite or automatic migration path and preserves existing artifacts.
- Do not place credentials, secrets, sensitive personal data, proprietary source, or private logs into external searches or public artifacts.

## External And Sensitive Actions

Research or planning does not authorize implementation. Local implementation does not authorize commits, pushes, deployments, publication, messages, purchases, production changes, credentialed private-system access, or secret rotation.

Legal, medical, financial, compliance, employment, insurance, credit, security, and safety-critical outputs are informational and require qualified human review before use.
