# ADR-0001: Unified Documentation Framework

Date: 2025-09-01
Status: Proposed

## Context
The repo’s markdown files are inconsistent and duplicated across root, packages, and projects. We need a simple, uniform structure and a parallel set of Copilot playbooks for automation.

## Decision
Adopt a per-package/app documentation structure:
- README.md — short human overview with links
- docs/ — chapters (how-to, reference, architecture)
- copilot-instructions-*.doc.md — machine playbooks for AI assistants

Root-level docs stay minimal (README.md, CONTRIBUTING.md, docs/adr/).

## Consequences
- Easier onboarding and navigation
- Lower duplication (human docs vs machine playbooks are separate)
- Predictable locations for automation and contributors
