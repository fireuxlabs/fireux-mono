# Documentation Manifest

> Legend  
> - ✅ Canonical: single source of truth, referenced by code and other docs  
> - 🧠 Concept: high-level ideas, mission, vision, architecture  
> - 🧪 Working: temporary reports, scratch notes, analysis for humans/AI  
> - 🧩 App/Ecosystem: project-specific docs (app mission, app roadmap, etc.)

> Long-term goal:  
> - Canonical + Concept docs gradually move under `docs/**`  
> - App/Ecosystem docs live under their `projects/**/docs` or `packages/**/docs`  
> - Working docs remain in `copilot-documentation/temporary-reports/**` and can be pruned/merged as they stabilise.

## Files
### Root — mixed 🧠 Concept / 🧪 Working
- [AGENTS.md](AGENTS.md) — ✅ Canonical
- [README.md](README.md)
- [config-report.md](config-report.md)
- [deployment-config.md](deployment-config.md)
- [ecosystem-change.md](ecosystem-change.md)
- [profiles-stack.md](profiles-stack.md)

### .github — ✅ Canonical prompts (AI control)
- [.github/prompts/speckit.analyze.prompt.md](.github/prompts/speckit.analyze.prompt.md)
- [.github/prompts/speckit.checklist.prompt.md](.github/prompts/speckit.checklist.prompt.md)
- [.github/prompts/speckit.clarify.prompt.md](.github/prompts/speckit.clarify.prompt.md)
- [.github/prompts/speckit.constitution.prompt.md](.github/prompts/speckit.constitution.prompt.md)
- [.github/prompts/speckit.implement.prompt.md](.github/prompts/speckit.implement.prompt.md)
- [.github/prompts/speckit.plan.prompt.md](.github/prompts/speckit.plan.prompt.md)
- [.github/prompts/speckit.specify.prompt.md](.github/prompts/speckit.specify.prompt.md)
- [.github/prompts/speckit.tasks.prompt.md](.github/prompts/speckit.tasks.prompt.md)

### .specify — ✅ Canonical SpecKit templates
- [.specify/memory/constitution.md](.specify/memory/constitution.md) — ✅ Canonical
- [.specify/templates/agent-file-template.md](.specify/templates/agent-file-template.md)
- [.specify/templates/checklist-template.md](.specify/templates/checklist-template.md)
- [.specify/templates/plan-template.md](.specify/templates/plan-template.md)
- [.specify/templates/spec-template.md](.specify/templates/spec-template.md)
- [.specify/templates/tasks-template.md](.specify/templates/tasks-template.md)

### copilot-documentation — 🧠 Concept & ✅ Canonical guidance; `temporary-reports/**` are 🧪 Working
- [copilot-documentation/auth-ui.md](copilot-documentation/auth-ui.md)
- [copilot-documentation/copilot-00-toc.md](copilot-documentation/copilot-00-toc.md) — ✅ Canonical
- [copilot-documentation/copilot-01-orientation.md](copilot-documentation/copilot-01-orientation.md)
- [copilot-documentation/copilot-02-architecture.md](copilot-documentation/copilot-02-architecture.md)
- [copilot-documentation/copilot-03-configuration.md](copilot-documentation/copilot-03-configuration.md)
- [copilot-documentation/copilot-04-platform-services.md](copilot-documentation/copilot-04-platform-services.md)
- [copilot-documentation/copilot-05-development-workflow.md](copilot-documentation/copilot-05-development-workflow.md)
- [copilot-documentation/copilot-06-ci-cd.md](copilot-documentation/copilot-06-ci-cd.md)
- [copilot-documentation/copilot-07-ux-conventions.md](copilot-documentation/copilot-07-ux-conventions.md)
- [copilot-documentation/copilot-08-operations.md](copilot-documentation/copilot-08-operations.md)
- [copilot-documentation/copilot-adr/README.md](copilot-documentation/copilot-adr/README.md)
- [copilot-documentation/copilot-adr/copilot-0001-nuxt-config-simplification.md](copilot-documentation/copilot-adr/copilot-0001-nuxt-config-simplification.md)
- [copilot-documentation/copilot-adr/copilot-0002-src-first-no-dist.md](copilot-documentation/copilot-adr/copilot-0002-src-first-no-dist.md)
- [copilot-documentation/copilot-adr/copilot-0003-vuefire-auth-init.md](copilot-documentation/copilot-adr/copilot-0003-vuefire-auth-init.md)
- [copilot-documentation/copilot-appendices/README.md](copilot-documentation/copilot-appendices/README.md)
- [copilot-documentation/copilot-appendices/profiles-model-summary.md](copilot-documentation/copilot-appendices/profiles-model-summary.md)
- [copilot-documentation/copilot-instructions/README.md](copilot-documentation/copilot-instructions/README.md)
- [copilot-documentation/gap.md](copilot-documentation/gap.md)
- [copilot-documentation/imported/packages/extensions/fireux-jobs/ROADMAP.md](copilot-documentation/imported/packages/extensions/fireux-jobs/ROADMAP.md)
- [copilot-documentation/liturature.md](copilot-documentation/liturature.md)
- [copilot-documentation/package-docs-index.md](copilot-documentation/package-docs-index.md)
- [copilot-documentation/roadmap.md](copilot-documentation/roadmap.md)
- [copilot-documentation/temporary-reports/README.md](copilot-documentation/temporary-reports/README.md)
- [copilot-documentation/temporary-reports/app-config.md](copilot-documentation/temporary-reports/app-config.md)
- [copilot-documentation/temporary-reports/app-factory-report.md](copilot-documentation/temporary-reports/app-factory-report.md)
- [copilot-documentation/temporary-reports/app-report.md](copilot-documentation/temporary-reports/app-report.md)
- [copilot-documentation/temporary-reports/app-utils.md](copilot-documentation/temporary-reports/app-utils.md)
- [copilot-documentation/temporary-reports/bloat-reduction-program.md](copilot-documentation/temporary-reports/bloat-reduction-program.md)
- [copilot-documentation/temporary-reports/blog-report.md](copilot-documentation/temporary-reports/blog-report.md)
- [copilot-documentation/temporary-reports/chef-composables.md](copilot-documentation/temporary-reports/chef-composables.md)
- [copilot-documentation/temporary-reports/composables/state-and-utils-report.md](copilot-documentation/temporary-reports/composables/state-and-utils-report.md)
- [copilot-documentation/temporary-reports/composables/use.md](copilot-documentation/temporary-reports/composables/use.md)
- [copilot-documentation/temporary-reports/current-pages-code.md](copilot-documentation/temporary-reports/current-pages-code.md)
- [copilot-documentation/temporary-reports/current-pages-components.md](copilot-documentation/temporary-reports/current-pages-components.md)
- [copilot-documentation/temporary-reports/current-pages-inventory.md](copilot-documentation/temporary-reports/current-pages-inventory.md)
- [copilot-documentation/temporary-reports/dashboard-dev-panels-todo.md](copilot-documentation/temporary-reports/dashboard-dev-panels-todo.md)
- [copilot-documentation/temporary-reports/edit.md](copilot-documentation/temporary-reports/edit.md)
- [copilot-documentation/temporary-reports/ensure-report.md](copilot-documentation/temporary-reports/ensure-report.md)
- [copilot-documentation/temporary-reports/firebse-operations-before.md](copilot-documentation/temporary-reports/firebse-operations-before.md)
- [copilot-documentation/temporary-reports/firestore-core-contract-2025-11.md](copilot-documentation/temporary-reports/firestore-core-contract-2025-11.md)
- [copilot-documentation/temporary-reports/images-sync-temp.md](copilot-documentation/temporary-reports/images-sync-temp.md)
- [copilot-documentation/temporary-reports/index-page.md](copilot-documentation/temporary-reports/index-page.md)
- [copilot-documentation/temporary-reports/liturature-plan.md](copilot-documentation/temporary-reports/liturature-plan.md)
- [copilot-documentation/temporary-reports/navigation/legacy-nav-report.md](copilot-documentation/temporary-reports/navigation/legacy-nav-report.md)
- [copilot-documentation/temporary-reports/navigation/navigation-report.md](copilot-documentation/temporary-reports/navigation/navigation-report.md)
- [copilot-documentation/temporary-reports/objects/legacy-firestore-objects-report.md](copilot-documentation/temporary-reports/objects/legacy-firestore-objects-report.md)
- [copilot-documentation/temporary-reports/objects/product-composables-current.md](copilot-documentation/temporary-reports/objects/product-composables-current.md)
- [copilot-documentation/temporary-reports/objects/product-composables-legacy.md](copilot-documentation/temporary-reports/objects/product-composables-legacy.md)
- [copilot-documentation/temporary-reports/pill-report.md](copilot-documentation/temporary-reports/pill-report.md)
- [copilot-documentation/temporary-reports/scripts-audit.md](copilot-documentation/temporary-reports/scripts-audit.md)
- [copilot-documentation/temporary-reports/stack-scripts.md](copilot-documentation/temporary-reports/stack-scripts.md)
- [copilot-documentation/temporary-reports/stacks/app-v-user-comparison.md](copilot-documentation/temporary-reports/stacks/app-v-user-comparison.md)
- [copilot-documentation/temporary-reports/stacks/use-app-stack.md](copilot-documentation/temporary-reports/stacks/use-app-stack.md)
- [copilot-documentation/temporary-reports/stacks/use-user-stack.md](copilot-documentation/temporary-reports/stacks/use-user-stack.md)
- [copilot-documentation/temporary-reports/tenants/landing.md](copilot-documentation/temporary-reports/tenants/landing.md)
- [copilot-documentation/temporary-reports/tenants/tenant-landing-follow-up.md](copilot-documentation/temporary-reports/tenants/tenant-landing-follow-up.md)
- [copilot-documentation/temporary-reports/tree-report.md](copilot-documentation/temporary-reports/tree-report.md)
- [copilot-documentation/temporary-reports/update-function.md](copilot-documentation/temporary-reports/update-function.md)

### docs — ✅ Canonical docs root
- [docs/10-core/figma.md](docs/10-core/figma.md) — ✅ Canonical
- [docs/10-core/images.md](docs/10-core/images.md) — ✅ Canonical
- [docs/30-ecosystems/_index.md](docs/30-ecosystems/_index.md)
- [docs/_manifest.md](docs/_manifest.md) — ✅ Canonical

### packages — 🧩 App/Ecosystem docs (promote `mission.md`/`roadmap.md` to ✅ when stable)
- [packages/core/fireux-core/docs/gap.md](packages/core/fireux-core/docs/gap.md)
- [packages/core/fireux-core/docs/images-sync.md](packages/core/fireux-core/docs/images-sync.md)
- [packages/core/fireux-core/docs/liturature.md](packages/core/fireux-core/docs/liturature.md)
- [packages/core/fireux-core/docs/mission.md](packages/core/fireux-core/docs/mission.md)
- [packages/core/fireux-core/docs/molecules-forms.md](packages/core/fireux-core/docs/molecules-forms.md)
- [packages/core/fireux-core/docs/roadmap.md](packages/core/fireux-core/docs/roadmap.md)
- [packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/STABLE_README.md](packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/STABLE_README.md)
- [packages/ecosystem/fireux-cleanbox/docs/gap.md](packages/ecosystem/fireux-cleanbox/docs/gap.md)
- [packages/ecosystem/fireux-cleanbox/docs/liturature.md](packages/ecosystem/fireux-cleanbox/docs/liturature.md)
- [packages/ecosystem/fireux-cleanbox/docs/mission.md](packages/ecosystem/fireux-cleanbox/docs/mission.md)
- [packages/ecosystem/fireux-cleanbox/docs/roadmap.md](packages/ecosystem/fireux-cleanbox/docs/roadmap.md)
- [packages/ecosystem/fireux-fireux/docs/gap.md](packages/ecosystem/fireux-fireux/docs/gap.md)
- [packages/ecosystem/fireux-fireux/docs/liturature.md](packages/ecosystem/fireux-fireux/docs/liturature.md)
- [packages/ecosystem/fireux-fireux/docs/mission.md](packages/ecosystem/fireux-fireux/docs/mission.md)
- [packages/ecosystem/fireux-fireux/docs/roadmap.md](packages/ecosystem/fireux-fireux/docs/roadmap.md)
- [packages/ecosystem/fireux-misebox/docs/gap.md](packages/ecosystem/fireux-misebox/docs/gap.md)
- [packages/ecosystem/fireux-misebox/docs/liturature.md](packages/ecosystem/fireux-misebox/docs/liturature.md)
- [packages/ecosystem/fireux-misebox/docs/mission.md](packages/ecosystem/fireux-misebox/docs/mission.md)
- [packages/ecosystem/fireux-misebox/docs/roadmap.md](packages/ecosystem/fireux-misebox/docs/roadmap.md)
- [packages/extensions/fireux-jobs/docs/gap.md](packages/extensions/fireux-jobs/docs/gap.md)
- [packages/extensions/fireux-jobs/docs/liturature.md](packages/extensions/fireux-jobs/docs/liturature.md)
- [packages/extensions/fireux-jobs/docs/roadmap.md](packages/extensions/fireux-jobs/docs/roadmap.md)
- [packages/extensions/fireux-places/docs/gap.md](packages/extensions/fireux-places/docs/gap.md)
- [packages/extensions/fireux-places/docs/liturature.md](packages/extensions/fireux-places/docs/liturature.md)
- [packages/extensions/fireux-places/docs/places-overview.md](packages/extensions/fireux-places/docs/places-overview.md)
- [packages/extensions/fireux-places/docs/roadmap.md](packages/extensions/fireux-places/docs/roadmap.md)

### projects — 🧩 App/Tenant docs (promote `mission.md`/`roadmap.md` to ✅ when stable)
- [projects/cleanbox/cleanbox-app/docs/gap.md](projects/cleanbox/cleanbox-app/docs/gap.md)
- [projects/cleanbox/cleanbox-app/docs/liturature.md](projects/cleanbox/cleanbox-app/docs/liturature.md)
- [projects/cleanbox/cleanbox-app/docs/mission.md](projects/cleanbox/cleanbox-app/docs/mission.md)
- [projects/cleanbox/cleanbox-app/docs/roadmap.md](projects/cleanbox/cleanbox-app/docs/roadmap.md)
- [projects/cleanbox/richies-reinigung/docs/gap.md](projects/cleanbox/richies-reinigung/docs/gap.md)
- [projects/cleanbox/richies-reinigung/docs/liturature.md](projects/cleanbox/richies-reinigung/docs/liturature.md)
- [projects/cleanbox/richies-reinigung/docs/mission.md](projects/cleanbox/richies-reinigung/docs/mission.md)
- [projects/cleanbox/richies-reinigung/docs/roadmap.md](projects/cleanbox/richies-reinigung/docs/roadmap.md)
- [projects/fireux/fireux-app/docs/gap.md](projects/fireux/fireux-app/docs/gap.md)
- [projects/fireux/fireux-app/docs/liturature.md](projects/fireux/fireux-app/docs/liturature.md)
- [projects/fireux/fireux-app/docs/mission.md](projects/fireux/fireux-app/docs/mission.md)
- [projects/fireux/fireux-app/docs/roadmap.md](projects/fireux/fireux-app/docs/roadmap.md)
- [projects/fireux/tennant/docs/gap.md](projects/fireux/tennant/docs/gap.md)
- [projects/fireux/tennant/docs/liturature.md](projects/fireux/tennant/docs/liturature.md)
- [projects/fireux/tennant/docs/mission.md](projects/fireux/tennant/docs/mission.md)
- [projects/fireux/tennant/docs/roadmap.md](projects/fireux/tennant/docs/roadmap.md)
- [projects/misebox/misebox-app/docs/gap.md](projects/misebox/misebox-app/docs/gap.md)
- [projects/misebox/misebox-app/docs/liturature.md](projects/misebox/misebox-app/docs/liturature.md)
- [projects/misebox/misebox-app/docs/mission.md](projects/misebox/misebox-app/docs/mission.md)
- [projects/misebox/misebox-app/docs/roadmap.md](projects/misebox/misebox-app/docs/roadmap.md)
- [projects/misebox/niederhorn/docs/gap.md](projects/misebox/niederhorn/docs/gap.md)
- [projects/misebox/niederhorn/docs/liturature.md](projects/misebox/niederhorn/docs/liturature.md)
- [projects/misebox/niederhorn/docs/mission.md](projects/misebox/niederhorn/docs/mission.md)
- [projects/misebox/niederhorn/docs/roadmap.md](projects/misebox/niederhorn/docs/roadmap.md)

## Stats
- Total markdown files: 132
- Aggregate size: 0.68 MB

### Largest files by size
1. copilot-documentation/temporary-reports/objects/legacy-firestore-objects-report.md — 44.36 kB
2. copilot-documentation/temporary-reports/app-report.md — 34.29 kB
3. copilot-documentation/temporary-reports/navigation/navigation-report.md — 31.43 kB
4. profiles-stack.md — 28.27 kB
5. copilot-documentation/temporary-reports/objects/product-composables-legacy.md — 28.12 kB
6. copilot-documentation/temporary-reports/edit.md — 20.65 kB
7. config-report.md — 19.54 kB
8. copilot-documentation/temporary-reports/firebse-operations-before.md — 18.85 kB
9. copilot-documentation/temporary-reports/objects/product-composables-current.md — 18.25 kB
10. copilot-documentation/temporary-reports/blog-report.md — 16.76 kB

