# Walking Session smoke test

This handoff verifies that a GitHub approval posted after a bounded Walking
Session opens can trigger one documentation task. It requires a separate
session authorization on Big Mac and a new top-level GitHub approval comment.

Create only `docs/reviews/walking-session-smoke-test.md` with this exact text:

```md
# Walking Session smoke test

The Walking Bridge completed this documentation-only handoff during a bounded walking session.
```

Compare the file directly with the expected text and report the result. The
trusted controller handles Git checks and publishes the completion comment
and JSON report. After the job, the operator verifies that Big Mac has
returned to read-only monitoring.
