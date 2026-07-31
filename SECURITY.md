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
- The CLI refuses symlinked managed paths, unknown flags, incompatible state, out-of-order phases, and finalization before approval.
- The CLI has no force-overwrite or automatic migration path and preserves existing artifacts.
- Do not place credentials, secrets, sensitive personal data, proprietary source, or private logs into external searches or public artifacts.

## External And Sensitive Actions

Research or planning does not authorize implementation. Local implementation does not authorize commits, pushes, deployments, publication, messages, purchases, production changes, credentialed private-system access, or secret rotation.

Legal, medical, financial, compliance, employment, insurance, credit, security, and safety-critical outputs are informational and require qualified human review before use.
