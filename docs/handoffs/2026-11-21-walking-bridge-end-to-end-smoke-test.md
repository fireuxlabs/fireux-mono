# Walking Bridge: documentation-only end-to-end smoke test

**Status:** Published for review; NOT approved for execution.
**Repository:** `fireuxlabs/fireux-mono`
**Target:** Current `main` at the time of a separate explicit GitHub approval.

## Goal

Verify the **existing** ChatGPT handoff → GitHub approval → Big Mac Walking Bridge → Codex → GitHub completion/report path, without any production access or infrastructure changes. Publishing this file is only a proposed task; it is not an approval or a request to arm the bridge.

## Single permitted edit

Create this Markdown file, and no other source file:

`docs/handoffs/reviews/2026-11-21-walking-bridge-smoke-test-result.md`

Its complete contents should be:

```md
# Walking Bridge smoke test

Walking Bridge smoke test completed.

This file was created by Codex from the approved documentation-only GitHub handoff.

No application code, Firebase rules, or production resources were changed.
```

Do not modify this handoff, the bridge implementation, other documentation, or application files. Do not edit the bridge's generated result report: the controller owns that report.

## Acceptance

After **separate approval and arming by the operator**, the existing bridge should:

1. Detect the approved handoff revision on GitHub.
2. Run exactly one bounded Codex task in its sandbox and produce the one permitted documentation file.
3. Check the change against the approved path/scope and commit it to `main` if the bridge's normal safety checks pass.
4. Publish its normal GitHub completion comment and JSON report, identifying the result commit, status, and any blocker.

The operator and ChatGPT will verify those GitHub artifacts afterwards. This test does **not** authorize editing or executing Walking Bridge infrastructure, installing webhooks, deploying apps or Firebase rules, changing live data, or enabling unattended work. If any step is blocked, report the blocker through the bridge's normal mechanism rather than bypassing safeguards.

## Separate approval required

Follow the existing instructions in `tools/walking-bridge/README.md`. Only the configured approver may issue a new top-level GitHub **commit** comment on the then-current `main` SHA, scoped narrowly to `docs/handoffs/reviews/2026-11-21-walking-bridge-smoke-test-result.md`. The bridge must be explicitly armed on Big Mac; it is currently understood to be monitoring only. Do not auto-approve from this document.
