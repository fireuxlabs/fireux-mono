# Walking Bridge handoff: Core User Firestore access-policy review

**Status:** Proposed; not approved for execution  
**Work type:** Offline, documentation-only audit  
**Repository:** `fireuxlabs/fireux-mono`  
**Target:** current `main` after explicit GitHub commit-comment approval

## Purpose

Review the FireUX Core User Firestore access-control boundary. Previous emulator checks showed that an intentionally restrictive policy can enforce owner-only access, while the actual named-database deployment has not passed the same security acceptance gate. This handoff is **not** permission to contact any production database, inspect live customer data, change security rules, or deploy.

## Bounded Codex task

1. Read existing repository code and docs describing canonical User, private account, App membership, Firestore rule templates, rules tests, named-database configuration and relevant Firebase APIs. Distinguish client Firestore access from trusted server/Admin SDK access.
2. Produce a short access-control inventory of the collections and operations actually used by Core User, including who needs to read/create/update/delete each type of document. Mark anything unknown rather than assuming it is public.
3. Recommend a **deny-by-default** rules design. Identify how private account documents would be readable/writable only by their owner, with anonymous and cross-user reads **and writes** rejected. Distinguish any genuinely public documents and multi-app membership behavior.
4. Describe a concrete emulator test matrix for unauthenticated, owning user, another authenticated user, and trusted server operations, including named-database targeting, create/read/update/delete, and the unverified SSR case.
5. Record what an authorized operator must review before any manual production rules deployment: exact target project/database, intended publicly readable resources, expected compatibility impact, rollback plan, and post-deployment verification. Clearly separate checked repository evidence from unverified deployed state.

## Single permitted authored output

`docs/handoffs/reviews/2026-11-21-core-user-firestore-policy-audit.md`

Write the findings there with relevant repository file paths, risks, recommended next actions and unresolved blockers. Keep the report suitable for a **public repository**: no account data, API keys, secrets, private identifiers, or instructions to exploit a live database.

## Hard boundaries

- **Documentation-only.** Do not edit any `.rules` file, Firebase configuration, production or test application code, CI, deployment workflows, dependencies, or infrastructure.
- No commits or changes outside the approved documentation scope. Do not access Firebase production services or user data; no live writes, authentication changes, or deployments.
- Do not expand into AppUser, Workspace, Kitchen, or unrelated Core restructuring.
- Do not enable/arm the bridge, attempt to approve this handoff, or change the Walking Bridge itself.
- If the review requires live credentials or a restricted operation, report it as **blocked for separate operator approval** instead.

## Acceptance

A concise, evidence-based policy review is committed in the allowed path, and the Walking Bridge posts its completion status and result reference. **Only a separate, explicit human-approved deployment may change the real Firestore rules.**
