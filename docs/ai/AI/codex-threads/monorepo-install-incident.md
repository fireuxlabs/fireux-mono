# Monorepo Install Incident (2026-02-06)

Updated: 2026-03-04
Audience: Codex implementation thread
Focus: monorepo-install-incident

Implementation context:
- Prioritize concrete execution constraints, files to touch, and validation order.
- Bias toward minimal, deterministic patches aligned with Tier1 contracts.
- Surface blockers that impact delivery risk or migration safety.

Commit window scanned: 2026-03-03T07:57:57Z -> 2026-03-04T07:27:26Z
Commit source: memory_last_run
Commits found: 21

Recent commit signals:
- 2026-03-04T03:17:54+01:00 | f9e56c68 | align runtime entry composables contract
- 2026-03-04T03:13:03+01:00 | 972e8115 | align runtime child composables and read-only resolution
- 2026-03-04T02:46:45+01:00 | 187b9d05 | feat: enable professionals in granite and make CTA preview actionable
- 2026-03-04T02:08:12+01:00 | 0fc1024e | chore: update packages/core/fireux-core/src/runtime/components/landing/LandingHeroSection.vue (+19 more)
- 2026-03-03T21:26:49+01:00 | 4e68f815 | chore: update packages/core/fireux-core/src/runtime/pages/users/index.vue (+19 more)
- 2026-03-03T21:21:56+01:00 | f041904a | chore: update packages/core/fireux-core/src/runtime/composables/fireux/app/routing/useKeyEntityTags.ts (+18 more)
- 2026-03-03T20:39:13+01:00 | 2cdaf202 | chore: update packages/core/fireux-core/src/runtime/components/landing/LandingHeroSection.vue (+30 more)
- 2026-03-03T18:39:14+01:00 | 61524bba | chore: update packages/core/fireux-core/src/runtime/components/landing/LandingHeroSection.vue (+17 more)
- 2026-03-03T18:12:37+01:00 | 1eab827d | refactor(landing): unify hero section in core and align app index entrypoints
- 2026-03-03T17:25:00+01:00 | 51b2e30f | chore: update projects/bringli/bringli-app/app/components/landing/Apps.vue (+7 more)

Most-touched repo areas:
- [293] packages/extensions
- [72] packages/core
- [59] packages/ecosystem
- [35] projects/fireux
- [27] projects/misebox
- [23] projects/cleanbox
- [18] projects/bringli
- [16] projects/granite


Execution guidance:
- Validate runtime composable contracts before extending downstream surfaces.
- Confirm landing and console routing behavior with targeted app-level checks.

#end
