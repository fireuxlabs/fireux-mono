# FIReUX Ecosystem — Gap Analysis

| Area                               | Current Status            | Key Missing Elements                                          |
| ---------------------------------- | ------------------------- | ------------------------------------------------------------- |
| **fireux-core**                    | ✅ Strong composable base | ❌ Developer portal, full Stripe stack, analytics, CI presets |
| **fireux-jobs**                    | ⚙️ CRUD scaffolding       | ❌ Applications, contracts, ratings, verification             |
| **fireux-places**                  | ⚙️ Search + details       | ❌ Manual create/edit, map, linking, invites, audit           |
| **fireux-cleanbox**                | ⚙️ Tenant shell           | ❌ Scheduling, QA, billing, seeder, theme tokens              |
| **fireux-misebox**                 | ⚙️ Tenant shell           | ❌ Recipes, suppliers, prep plans, costing, branding          |
| **fireux-fireux**                  | ✅ Module wiring          | ❌ Auth, billing, tenant config UI, PWA assets                |
| **Apps (Cleanbox/Misebox/FireUX)** | Marketing-only            | ❌ Functional routes, binding to tenant composables           |
| **Examples (Richie’s/Niederhorn)** | Landing-only              | ❌ Operational consoles, training, compliance               |

### Cross-Cutting Gaps

- No unified feature-flag manifest
- No shared notification/messaging layer
- Limited test coverage (no tenant-switch tests)
- Docs not auto-generated from code
