# Documentation Manifest
Authority: Tier2 (Operational index)

## Authority model
- Tier1 (authoritative): canon + contracts.
- Tier2 (operational): how-to, incidents, migrations, task tracking.
- Tier3 (non-authoritative): tooling prompts, AI memory, imported historical context.

## Tier1 locations
- `docs/fireux-canon.md`
- `docs/runtime-contract.md`
- `docs/seo-canon.md`
- `packages/extensions/fireux-*/docs/contract.md`

## Tier2 locations
- `docs/**` (except explicitly Tier3-marked folders/files)
- `packages/**/docs/**`
- `projects/**/docs/**`
- Root operational docs such as `fulfillment.md`

## Tier3 locations (non-authoritative)
- `AI/**`
- `.github/prompts/**`
- `.specify/**`
- `temp/**`
- `docs/copilot-documentation/imported/**`
- `docs/git-tree.md`

## Notes
- `.github/prompts` and `.specify` are workflow/tooling inputs, not architecture canon.
- If a Tier2/Tier3 file conflicts with Tier1 docs, Tier1 wins.
