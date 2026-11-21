# Walking Bridge: documentation-only end-to-end smoke test

**Status:** Published for review; NOT approved for execution.
**Repository:** `fireuxlabs/fireux-mono`
**Target:** Current `main` at the time of a separate explicit GitHub approval.

## Goal

Verify the **existing** ChatGPT handoff → GitHub approval → Big Mac Walking Bridge → Codex → GitHub completion/report path, without any production access or infrastructure changes. Publishing this file is only a proposed task; it is not an approval or a request to arm the bridge.

## Single permitted edit

Create this Markdown file, and no other source file:

`docs/reviews/walking-bridge-smoke-test.md`

Its complete contents should be:

```md
# Walking Bridge smoke test

Walking Bridge smoke test completed.

This file was created by Codex from the approved documentation-only GitHub handoff.

No application code, Firebase rules, or production resources were changed.
```

Verify the file directly against the expected text above and report the check.
The controller owns Git verification and the generated JSON report.

## Acceptance

After **separate approval and arming by the operator**, the existing bridge should:

1. Detect the approved handoff revision on GitHub.
2. Run exactly one bounded Codex task in its sandbox and produce the one permitted documentation file.
3. Check the change against the approved path/scope and commit it to `main` if the bridge's normal safety checks pass.
4. Publish its normal GitHub completion comment and JSON report, identifying the result commit, status, and any blocker.

The operator and ChatGPT will verify those GitHub artifacts afterwards. This test does **not** authorize editing or executing Walking Bridge infrastructure, installing webhooks, deploying apps or Firebase rules, changing live data, or enabling unattended work. If any step is blocked, report the blocker through the bridge's normal mechanism rather than bypassing safeguards.

## Separate approval required

Follow the existing instructions in `tools/walking-bridge/README.md`. The configured approver posts a new top-level GitHub **commit** comment on the current `main` SHA, scoped to `docs/reviews/walking-bridge-smoke-test.md`. Arming on Big Mac requires separate operator authorization.
