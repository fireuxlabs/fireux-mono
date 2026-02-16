# FireUX Constitution

## Core Principles

### P1. Ship the canonical system

FireUX is pre-v1. Every change defines the canonical architecture; avoid speculative compatibility layers.

### P2. Fail fast, avoid silent fallbacks

Missing required inputs must surface clearly (error, blocking UI, or explicit placeholder); never hide issues with implicit defaults.

### P3. Minimize indirection

Prefer a single, explicit implementation over parallel helpers or shims; deduplicate aggressively.

## Constraints

### C1. No legacy layers, no hidden fallbacks (pre-v1)

- Do not create re-export shims or “bridge” files unless an existing caller cannot be updated in the same change.
- Do not add hidden fallbacks that auto-fill missing config/data; validate and fail loudly instead.
- Do not expose private fields as UI fallbacks (e.g., never use email when displayName is missing); use neutral placeholders or block the flow.
- Do not add UI fallbacks that mask missing data; missing data should be visible so it can be fixed at the source.
- Do not chain fallbacks across identity/location/media fields (e.g., name -> subtitle, short_address -> formatted_address -> name, image_url -> generic image) unless explicitly specified.
- Only add a fallback when explicitly requested in a spec (example: short address → long address).
- If two functions/files do the same job, pick one, delete the other, and update call sites.
- After v1, migration layers may be added deliberately with docs; before v1, legacy does not exist.

### C2. Framework docs live at `/docs`

- All public FireUX documentation lives in `/docs/` at the monorepo root.
- Ecosystem, package, and app docs stay in their own `packages/**/docs/` or `projects/**/docs/` folders.
- The `fireux-fireux` ecosystem is a template and must not host framework docs.

## Workflow

- Copilot/agents must reference this constitution when proposing new helpers, fallbacks, or shims.
- Required fields (ecosystem, appId, displayName, etc.) must be validated; absence should stop the flow or show a neutral message.
- Prefer migrations or data backfills over UI fallbacks when data is missing.
- Prefer simplifying APIs over adding compatibility layers “just in case.”

## Governance

- This constitution supersedes other practices for FireUX pre-v1.
- Amendments require documenting intent, scope, and migration plan.

**Version**: 0.1.3 | **Ratified**: 2025-12-07 | **Last Amended**: 2026-02-15
