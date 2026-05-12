# projects

Authority: Tier2 (branch intent)

`projects/` contains consuming Nuxt apps grouped by ecosystem/app.

- `projects/tsconfig.projects.json` is the shared base TypeScript config for apps and templates.
- `projects/templates/fireux-template` is currently a workspace template project/scaffold. Do not treat it as a deployed app unless `scripts/_lib/app-registry.mjs` and root scripts explicitly include it.
- Deployed/dev apps are tracked through `scripts/_lib/app-registry.mjs` and root dev scripts.
