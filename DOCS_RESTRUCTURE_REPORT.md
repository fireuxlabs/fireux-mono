# Docs Restructure Report (2025-09-01)

This summarizes the documentation framework reset and archival performed today.

## Framework created

- Added /docs/framework/ with chapters:
  - 01-overview.md
  - 02-structure.md
  - 03-config.md
  - 04-packages.md
  - 05-projects.md
  - 06-firebase.md
  - 07-dev-workflow.md
  - 08-ci-cd.md
  - 09-conventions.md
- Added copilot-instructions.doc.md in /docs and in key package/project docs folders.

## Archived and moved

Moved reports/audits/snapshots to archive/reports/migrated-20250901/ (git mv to preserve history):
- ALL_TYPESCRIPT_ERRORS.md
- PHANTOM_INVESTIGATION_REPORT.md
- packages-report.md
- packages-packagejson-report.md
- config-state.md
- reoper.md
- rootReport.md
- repot.md
- report.md
- env-report.md
- config-consolidation-report.md
- CONFIG-CONSOLIDATION-RESULTS.md
- NUXT_CONSOLIDATION_REPORT.md
- reports/current-state-report.md → archive/reports/migrated-20250901/current-state-report.md
- reports/packages-health-report.md → archive/reports/migrated-20250901/packages-health-report.md

Existing archive reports under docs/archive/reports remained in place.

## Per-package and per-project docs

- Ensured copilot-instructions docs exist:
  - packages/core/fireux-core/docs/copilot-instructions.doc.md
  - packages/extensions/fireux-jobs/copilot-instructions-dev.doc.md (already existed)
  - packages/extensions/fireux-places/copilot-instructions-dev.doc.md (already existed)
  - packages/tenants/fireux-cleanbox/copilot-instructions-dev.doc.md (already existed)
  - packages/tenants/fireux-misebox/copilot-instructions-dev.doc.md (already existed)
  - projects/fireux/copilot-instructions-app.doc.md
  - projects/misebox/copilot-instructions-app.doc.md
  - projects/cleanbox/copilot-instructions-app.doc.md
  - projects/docs/copilot-instructions.doc.md
  - docs/copilot-instructions.doc.md

## No deletions

- All information preserved; transient reports are archived in dated folder.

## Next steps

- Fill out draft framework chapters with deeper content (env tables, commands, diagrams).
- Add README.md to projects that don’t have one, linking to framework.
- Regularly roll reports from /reports to /archive/reports/YYYYMMDD.
