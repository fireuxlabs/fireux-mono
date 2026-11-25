# Walking mode handoff — GitHub Issues

Date: 2026-11-25
Status: Requested follow-up for Main Codex; not execution approval for bridge changes.

The user wants GitHub Issues enabled on fireuxlabs/fireux-mono and prefers issues as the standard walking-mode task queue. The GitHub API rejected issue creation with HTTP 410 because Issues are disabled.

Main Codex: check repository administration permissions and enable Issues if authorized; otherwise report the exact administrator action needed. Review tools/walking-bridge/README.md and current controller before proposing how issue-based handoffs can replace or complement Markdown handoffs. Preserve exact-revision approval, bounded scope, deduplication, revocation and separate user authorization. Do not treat issue creation or edits as execution approval. Propose the smallest transition, with verification and rollback, before changing the bridge. Until reviewed, retain the existing Markdown workflow.

Keep this tooling follow-up separate from the Nuxt spine investigation in docs/handoffs/2026-11-25-walk-mode-nuxt-spine-app-ownership.md.
