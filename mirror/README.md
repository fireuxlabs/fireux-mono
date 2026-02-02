Mirror files index

This file is required by the FireUX guard.
Do not delete.

Copilot instructions

Purpose
- Mirror is a curated, symlinked workspace for quick cross-entity comparison.
- mirror/mirror.txt is the source list (one repo-relative path per line).

Standard flow
1) Clear mirror: remove symlinks in mirror/ and empty mirror/mirror.txt.
2) Populate mirror/mirror.txt with the desired file set.
3) Regenerate symlinks using scripts/mirror-links.sh.

Naming convention for symlinks
- Prefer descriptive names based on the search scope.
- Use the pattern: <entity>-<scope>.mirror.<ext>
	Examples:
	- agent-usefetch.mirror.ts
	- places-usecollection.mirror.ts
	- company-edit-page.mirror.vue
- Derive <entity> from the model/entity name in the path or filename.
- Derive <scope> from the search pattern (usefetch, usecollection, edit, page, card, etc.).
- If entity is unclear, fall back to <package>-<basename>.mirror.<ext>.

Entities index (search targets)

Core
- App
- User
- Profile
- Meta

Profiles
- Agent
- Professional
- Chef
- Supplier

Objects
- Place
- Company
- Kitchen
- Job
- Product
- BlogPost
- Ingredient
- Recipe
- RecipeSimple
- Dish
- Menu
- Task
- MiseEnPlace
- Location
