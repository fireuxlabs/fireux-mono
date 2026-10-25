# Misebox transparent-media backdrop audit

> Archived / parked on 2026-10-25. Preserved planning and evidence; this file is not the active task list. See [current FireUX priorities](../../../roadmaps/fireux-priorities.md) before resuming work.

Date: 2026-07-29
Scope: read-only Live `misebox` Place/Kitchen audit plus current Demo fixtures

## Classification

- Indian Gourmet Restaurant & Pizzeria logo: missing canonical colour;
  inferred `#111827` from the current legacy `light` value.
- Indian Gourmet Restaurant & Pizzeria no-logo wordmark: missing canonical
  colour; inferred `#111827` from the same legacy value.
- Luna logo (`ChIJ93_ggY-jj0cRTCyLcfBuK2w`): the canonical current object is
  now a genuine-alpha square PNG and the Kitchen sparsely owns
  `identity.media_backdrop_color: "#FFFFFF"` for its black text. The previous
  current logo is archived under
  `identity/logo/history/2026-07-29-pre-square`. No backdrop action remains.
- Luna standard wordmark: no backdrop required for the current 1727×911 opaque
  PNG.
- Luna no-logo wordmark: absent.
- Luna Kitchen card override: absent; cards continue to resolve the linked
  Place fallback.
- Deanos Demo logo: missing colour; palette inference candidate `#ff4f2e`.
- Pizza the Action Demo logo: missing colour; palette inference candidate
  `#1f6b45`.
- Misebox Restaurant Demo logo: missing colour; palette inference candidate
  `#914632`.

No production data was changed by this audit. Inferred colours require review
before any separately approved migration. Luna is complete under the canonical
transparent-media contract.
