# FireUX Walking Bridge

ChatGPT publishes a bounded Markdown handoff to GitHub. A GitHub approval
comment authorizes Big Mac to run that exact revision locally. The bridge posts
the result back to GitHub. This is separate from the Core reset.

## Use it on Big Mac

From a clean FireUX Mono checkout on main:

    node tools/walking-bridge/bridge.mjs init
    node tools/walking-bridge/bridge.mjs start
    node tools/walking-bridge/bridge.mjs status

Initialize once. This pins the numeric GitHub ID of the signed-in gh account
as the approver. It needs repository write access, working Git push
credentials, and a signed-in Codex CLI. Only configure the GitHub account that
will author approvals. Anyone or anything acting as that account can approve.

The macOS LaunchAgent polls every 60 seconds while Big Mac is awake and the
user is logged in. It needs no incoming port. The default start is read-only.
Use poll for an immediate read-only check.

## Open a walking session

Before leaving Big Mac, explicitly open a two-hour session from a clean
checkout. Big Mac must remain awake and logged in.

    node tools/walking-bridge/bridge.mjs stop
    node tools/walking-bridge/bridge.mjs start --session
    node tools/walking-bridge/bridge.mjs status

From your phone, approve one handoff using the commit-comment workflow below.
Use one exact Markdown file under `docs/reviews/` as the scope. The approval
must be posted after the session opens. All existing approval and publication
checks apply. The bridge consumes the session before launching Codex and
resumes read-only polling after that job, including if it fails. An unused
session expires after two hours. A job already claimed at expiry can finish
within the usual execution limit.

For an individually supervised run, the existing armed mode remains available.
Return it to monitoring after the run.

    node tools/walking-bridge/bridge.mjs stop
    node tools/walking-bridge/bridge.mjs start --armed

Use stop to unload it and remove its login registration. After updating the
bridge itself, stop and start in the desired mode to install the updated
runner. Status shows its mode and local log path.

## Publish and approve a handoff

1.  Ask ChatGPT to publish a bounded Markdown handoff at
    docs/handoffs/<lowercase-hyphenated-name>.md on GitHub main. Have it return
    the commit link and propose exact edit paths. A handoff commit alone
    authorizes nothing.
2.  Review the handoff, then post one new **top-level commit comment** on the
    current main commit from the configured GitHub account. Replace the SHA,
    handoff path and comma-separated scope list in this example.

        /fireux-walk <40-character-sha> docs/handoffs/example.md docs/concepts,packages/core/fireux-core/src/ecosystem

    Keep approvals separate from ChatGPT's drafting or publishing workflow.
    The bridge ignores edited approvals, inline comments, old approvals and
    comments from other accounts. Use one approval per revision. If main moves
    before execution or publication, review the new revision before approving it.
    Delete the approval to revoke it before the bridge's final publication check.

3.  Read the completion comment on the approved commit or ask ChatGPT with
    GitHub access to read the result file under docs/handoffs/results/ on main.
    Successful jobs commit changes and then a JSON report recording the change
    SHA, status, tests and blockers. The completion comment includes the report
    commit SHA. Blocked jobs post a structured comment and retain a local report
    and scratch checkout for review. Neither the scratch path nor raw logs go
    into GitHub.

An interrupted or failed approval is consumed once. Review the retained result
instead of reposting the same approval. After a crash, the run lock deliberately
blocks execution until you confirm the old process is gone and remove the
empty running directory under the state directory. Use a new current-main
checkpoint for an approved retry.

## Boundaries

- The worker edits a disposable clone of the approved revision. It uses a
  dedicated filesystem profile, no command network, no approval escalation, and
  no hooks, apps, or plugins. The trusted controller checks the exact revision
  and clean checkout before launch and owns diff validation and publication.
  The worker verifies files directly. Git metadata and environment files are
  denied to worker commands.
- One local run lock serializes workers. The shared checkout must be clean and
  on main before work and before publication. Main advancing blocks publication,
  and pushes use ordinary fast-forward semantics. Stop the service before
  working through a competing interactive session. The bridge cannot detect
  a clean Codex or editor session that has not written changes yet.
- Approved scopes cover regular source and documentation files under docs,
  packages or projects. The controller reserves `docs/handoffs/` for handoffs
  and its own reports. The controller rejects out-of-scope edits, staged edits,
  deletions, renames, links, executables, dependency manifests, Rules and
  release/deploy paths. The worker is for offline development only.
  Shell commands may edit or test inside the disposable checkout. The sandbox
  controls environment access, while the publication check controls the final
  diff. Review high-impact or destructive tasks interactively.
- The worker never inherits a running App environment or a live database
  credential. Keep handoffs and reports appropriate for the public repository.
  Tasks requiring installed dependencies, network access, GUI access, or
  production services may stop as blocked. Fresh clones do not inherit
  node_modules. The bridge checks Git whitespace and records Codex-reported
  test results. It does not attest those results independently.
- The local state and retained checkouts live in
  ~/Library/Application Support/FireUX Walking Bridge. Review and prune old
  scratch checkouts when the bridge is idle. Keep claim JSON files to prevent
  repeat execution. The background runner is copied from the clean checkout
  when starting, so local edits cannot replace it during a poll.

## Completion notifications

The controller posts a GitHub commit comment and requests a Mac notification
immediately when it finishes. macOS notification delivery depends on settings.
GitHub's own notification delivery depends on participation and account
preferences, and you may not receive a notification for a comment posted by
your own account. The committed JSON is the durable completion record.

GitHub webhooks deliver events to an external receiver. OpenAI API webhooks
deliver API-project events to a receiver you control. Neither is an inbound
endpoint for an existing ChatGPT conversation. The bridge does not expose the
Mac or provision a webhook receiver. ChatGPT can retrieve the completion from
GitHub in a later turn.

- [GitHub commit comments](https://docs.github.com/en/rest/commits/comments)
- [GitHub webhooks](https://docs.github.com/en/webhooks/about-webhooks)
- [GitHub notification delivery](https://docs.github.com/en/subscriptions-and-notifications/concepts/about-notifications)
- [Codex non-interactive mode](https://developers.openai.com/codex/noninteractive)
- [Codex permission profiles](https://learn.chatgpt.com/docs/permissions)
- [OpenAI API webhooks](https://developers.openai.com/api/docs/guides/webhooks)

## Verification

Run the local approvals, file scope, deduplication, Git result and report tests:

    node --test tools/walking-bridge/bridge.test.mjs

The local sandbox smoke test used the installed Codex CLI in a synthetic
checkout. It verified a permitted edit and denied reads of external files
and Git metadata, writes outside the checkout, and outbound GitHub access.
The supervised smoke test verified a real GitHub handoff and completion report.
A phone-approved run inside a walking session needs its own end-to-end check.
