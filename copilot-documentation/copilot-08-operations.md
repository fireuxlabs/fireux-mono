---
title: Operations & Troubleshooting
status: draft
created: 2025-10-15
---

# Operations & Troubleshooting

This chapter captures operational procedures, debugging tips, and the baseline incident response flow. Expand it as new playbooks emerge.

## Incident Response Primer

1. **Triage**: Confirm scope (single tenant vs global) and gather logs (Nitro, browser console, Firebase). Use dev pages to reproduce quickly.
2. **Stabilise**: Roll back, toggle feature flags, or revert recent deployments if necessary.
3. **Communicate**: Record the issue in the shared tracker and notify stakeholders (Slack/Teams channel TBD).
4. **Mitigate**: Apply a hotfix branch or data correction script. See CI/CD chapter for hotfix workflow.
5. **Document**: Update this chapter or relevant appendices with remediation steps, then schedule follow-up work (tests, automation).

## Common Issues & Fixes

- **Firebase auth already initialised**: remove custom client init; rely on VueFire module.
- **Missing env variables**: ensure the root `.env` is up to date and symlinked into apps.
- **Firestore permission errors**: confirm collection path matches `core` vs `apps/<appId>` convention and that service account roles include required scopes.
- **Navigation mismatch**: check that the owning package exports the route and nav metadata; rerun `tools/check-app-structure.mjs` if necessary.

## Diagnostics Toolkit

- **Dev pages**: `/dev/app`, `/dev/users`, `/dev/fireux-core`, `/dev/fireux-places` (when available) provide snapshots of runtime state.
- **Automation**: Remediation scripts live under `automation/` (migrations, maintenance, guards). Stick to dry runs first, then rerun with `--apply` or similar flags once reviewed.
- **Logging**: Use consistent prefixes in server/client logs to trace issues (`[fireux-core]`, `[fireux-places]`, etc.).
- **Analytics**: Pending integration. When added, document dashboards and alert policies here.

## Operational Checklists (to be expanded)

- Pre-deploy verification (lint, type, build, smoke tests).
- Post-deploy monitoring (errors, performance metrics, Places API quota).
- Backup & recovery (Firestore export schedule, storage backups).

Additional detailed runbooks should live under `copilot-appendices/` once authored.
