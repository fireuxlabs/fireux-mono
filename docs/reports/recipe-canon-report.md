# Recipe Canon Report

Authority: working canon audit
Updated: 2026-03-16

Containment note: this report contains pre-containment analysis. Current canonical recipe model is `packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts`. The former `packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts` and `packages/ecosystem/fireux-misebox/src/runtime/models/Recipe.model.ts` files have been removed.

Current status lock:
- Recipe is aligned as a kitchen-owned runtime child entity.
- Public Misebox recipe pages are projection surfaces over kitchen-owned recipe data.
- True root-level or dual-residence recipe canon is deferred, not implied.
- This is a deliberate containment compromise so wider model alignment can continue from a clean base.

## Executive Summary

Superseded summary note:
The historical analysis below captures why the repo was inconsistent before containment. The current operational answer is simpler: `Recipe` is canonical in kitchens only for now, and any future global recipe residence must be added later as an explicit design, not recovered from legacy wrapper drift.

Recipe is currently split across two incompatible directions in the repo.

The first direction is real and operational:
- packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts defines a concrete KitchenRecipe model.
- kitchen runtime data loads recipes from kitchens/{kitchenId}/recipes/{recipeId} through the kitchen menu stack fetch.
- dishes already reference recipe_ids.
- kitchen console already has a recipes page.

The second direction is richer but structurally incomplete:
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue and packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue present Recipe as a public content entity.
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts reads a root recipes collection.
- multiple Misebox recipe components import a Recipe.model that does not exist in the current workspace.
- create and edit surfaces are placeholders or partial scaffolds.

The repo does not currently have one canonical Recipe system.

Recommended canon:

Recipe should be canonised as a kitchen-owned runtime child entity owned by packages/extensions/fireux-kitchens.

That means:
- the primary Recipe entity is a kitchen child, not a global root entity
- the owning kitchen is the operational authority
- a chef is the author identity, not the owner
- Dish references Recipe
- Menu references Dish, not Recipe directly
- future public or global exposure should happen through derived publication/search surfaces, not through a second canonical recipe entity

Final recommendation in one line:

Make Recipe a canonical kitchen-owned content entity in packages/extensions/fireux-kitchens, add a real authorship and publication policy to that model, and treat the current Misebox root-recipe stack as a UI/publication scaffold to be refit on top of the kitchen-owned canon rather than as a competing data model.

## Current Recipe Inventory

### Confirmed recipe-related files in fireux-kitchens

Core model and runtime loading:
- packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/mutations/useKitchenMenuStackCreate.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/useRuntimeKitchenData.ts

Console and dashboard surfaces:
- packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue
- packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue

Relationship files that already bind recipe into the kitchen system:
- packages/extensions/fireux-kitchens/src/runtime/models/dish.model.ts
- packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts
- packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts

Read-only scenario recipe support:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/read-only-scenarios/_shared/types.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/read-only-scenarios/stack-sizzle/index.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/read-only-scenarios/broth-bloom/index.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/app/kitchen-runtime/read-only-scenarios/takumi-ramen/index.ts

### Confirmed recipe-related files in fireux-misebox

Public pages:
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue

Recipe composables:
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeUpdate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeDelete.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts

Recipe components:
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/CTA.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/Manager.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/List.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Cell.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Pill.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Profile.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Preview.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Create/System.vue
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Edit.vue

### Confirmed missing file

Recipe.model does not exist now.

Evidence:
- file search for any Recipe.model.ts in the workspace returned no matching file.
- these files import a Recipe model path that does not resolve to a confirmed file:
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Profile.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Cards/Preview.vue
  - packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/Manager.vue
  - packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/utils/view/useRecipeInterface.ts

### What is actually real today

Real today:
- KitchenRecipe model exists.
- kitchens/{kitchenId}/recipes/{recipeId} is already treated as a real Firestore residence.
- kitchen runtime fetches recipes together with menus, dishes, and mise tasks.
- Dish already references recipe_ids.

Partly real today:
- Misebox recipe composables read and write a root recipes collection.
- Misebox recipe detail page expects a content-rich recipe object with slug, title, description, chef_name, featured_image, ingredients, instructions, cuisine_type, dietary_restrictions, source, parent_app_id, difficulty_level, total_time_minutes, and servings.

Scaffold-only today:
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue currently returns an empty computed collection.
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Create/System.vue is an empty div placeholder.
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Edit.vue is an empty div placeholder.
- packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue is a placeholder panel with no recipe store wiring.

## Current Drift And Gaps

### Drift 1: two competing residences

Current kitchen canon points to:
- kitchens/{kitchenId}/recipes/{recipeId}

Current Misebox scaffold points to:
- recipes/{recipeId}

This is the central drift.

### Drift 2: two incompatible recipe shapes

Current KitchenRecipe shape in fireux-kitchens is operational and compact:
- id
- kitchen_id
- dish_id
- name
- description
- status
- yield_qty
- yield_unit
- prep_minutes
- cook_minutes
- ingredient_lines
- steps
- notes
- tags
- created / updated

Current Misebox recipe UI expects a richer content object with fields such as:
- slug
- title
- chef_name
- featured_image
- total_time_minutes
- difficulty_level
- servings
- ingredients
- instructions
- cuisine_type
- dietary_restrictions
- source
- parent_app_id

These are not the same model.

### Drift 3: authorship is implicit in one stack and loose in the other

KitchenRecipe currently has stamp fields but no explicit chef authorship field.

Misebox recipe create currently sets creator_id from the authenticated user and immediately creates SEO index state with published visibility assumptions.

Neither stack currently models the intended truth cleanly:
- recipe is authored by a chef
- recipe belongs operationally to a kitchen

### Drift 4: public and console surfaces are inverted

Kitchen side has a console/runtime recipe page but weak public/content surfaces.

Misebox side has public/content recipe surfaces but weak console/create/edit reality.

### Drift 5: secrecy and visibility are not canonised

Current Misebox recipe create defaults to:
- status: published
- seo index public visibility true

There is no real secrecy model.

### Drift 6: recipe is already subordinate to dish in part of the current model

KitchenRecipe currently includes dish_id.

Dish also includes recipe_ids.

That creates a bidirectional coupling that risks muddying source of truth.

Canonically, Dish should depend on Recipe more than Recipe depends on Dish.

## Canon Recommendation

### Recommended primary Recipe entity

Recipe should be a canonical content entity that is operationally a runtime child of Kitchen.

That means the correct canon class is:
- runtime child

Not:
- root entity
- profile extension

Not a true hybrid either.

The hybrid temptation is understandable because Recipe has both operational and publishable aspects, but making Recipe hybrid at the entity level would recreate the exact drift already visible between fireux-kitchens and fireux-misebox.

### Recommended owner package

Recommended owner:
- packages/extensions/fireux-kitchens

Reasoning:
- the only confirmed recipe model already lives there
- the intended truth says recipe belongs operationally to a kitchen
- the kitchen runtime already fetches recipes as first-class operational records
- dish and menu relationships already live in fireux-kitchens
- chef authorship is already part of the kitchens domain through Chef profile support

Why not packages/ecosystem/fireux-misebox as the canonical owner:
- its recipe stack currently assumes a competing root collection
- its model file is missing
- its create and edit surfaces are placeholders or partial scaffolds
- its strongest assets are public/content display components, not ownership canon

### What fireux-misebox should own instead

Misebox should own recipe presentation and public/editorial surface variations, not the canonical recipe entity.

That means Misebox can own:
- public recipe browsing presentation
- public recipe detail design
- editorial or consumer-facing recipe cards
- ecosystem-specific branding around published recipes

But Misebox should not own the canonical Recipe model or its primary Firestore residence.

## Ownership And Identity Model

### Canon relationships

- Kitchen owns the recipe operationally.
- Chef authors the recipe.
- Dish uses recipe.
- Menu uses dish.

### Exact ownership rule

Owning entity:
- the kitchen is the owner of record

Canonical owner fields should include:
- kitchen_id
- app_id if needed by runtime context, but not as a competing owner

Why kitchen owns it:
- recipes exist to drive operational kitchen output
- secrecy, access, and workflow all naturally follow kitchen membership
- recipe publication later should not erase operational ownership

### Exact authorship rule

Authorship entity:
- a chef profile authors the recipe

Canonical authorship fields should include:
- author_chef_id
- author_user_id
- created.by in stamps

Why both chef and user matter:
- Chef is the domain author identity
- User is the underlying authenticated identity

### Who can edit recipe

Default edit authority:
- owning kitchen admins
- author chef
- kitchen team members with recipe-edit permission

### Who can publish recipe

Default publish authority:
- owning kitchen admins
- optionally author chef if the kitchen policy allows it

Publishing should not be open to all kitchen team members by default.

### Who can use recipe in a kitchen

Any member of the owning kitchen with menu or dish composition rights should be able to attach recipe references to dishes.

### Can a recipe move between kitchens

Recommended answer:
- no, not as the same authoritative record

Why:
- ownership, secrecy, provenance, and permissions become unstable if the same canonical document is reassigned across kitchens

### Can multiple kitchens use one recipe

Recommended answer:
- not as one shared authoritative operational document

Future sharing model should be:
- publish or share a recipe
- import or duplicate into another kitchen
- preserve lineage through fields such as source_recipe_id or origin_recipe_id
- the imported recipe becomes a new kitchen-owned canonical recipe in the destination kitchen

This keeps one canon while still supporting reuse later.

## Secret Recipe Policy

### Recommendation

Do not model secrecy with one boolean.

Use three distinct concepts:
- workflow_status
- visibility
- protection_level

And one policy object:
- access_policy

### Recommended field shape

- workflow_status: draft | active | archived
- visibility: private | team | shared | public
- protection_level: standard | confidential | secret
- access_policy:
  - readers
  - editors
  - publishers
  - exporters
  - duplication
  - allowed_kitchen_ids when shared across selected kitchens later

### Why this is better

Visibility answers: who should see this recipe.

Protection level answers: how tightly the recipe should be protected even among otherwise legitimate viewers.

Workflow status answers: where the recipe is in lifecycle.

These are not the same thing.

### Canon meaning of the requested categories

private internal recipe:
- visibility: private
- protection_level: standard or confidential
- readable only by explicit owner/editor roles

team-only recipe:
- visibility: team
- protection_level: standard or confidential
- readable by permitted members of the owning kitchen team

shared recipe:
- visibility: shared
- protection_level: standard or confidential
- readable by explicit receiving kitchens, groups, or app-level collaboration contexts

public recipe:
- visibility: public
- protection_level: standard
- readable on public surfaces

secret recipe:
- not a visibility state alone
- secret is primarily a protection state

### Canon answer on secret

Secret should be a protection state, not just a visibility state.

Recommended interpretation:
- secret is carried by protection_level: secret
- visibility still says whether the recipe is private, team, shared, or public

Important rule:
- protection_level: secret should block full public publication of the complete recipe body

That means a recipe could potentially have:
- public summary visibility
- but protected full method and quantities

However the simpler first canon should be:
- if protection_level is secret, full public publication is not allowed
- public visibility may only expose summary metadata if explicitly supported later

### Access policy recommendation

access_policy should be explicit and human-readable in intent, for example:
- readers: owner_admins | owner_team | shared_kitchens | public_summary
- editors: owner_admins | author_chef | owner_recipe_editors
- publishers: owner_admins | author_chef_if_allowed
- exporters: blocked | owner_admins_only | owner_team
- duplication: allowed_internal | allowed_shared_import | blocked

This is better than encoding everything in booleans.

## Menu / Dish / Recipe Relationship Model

### Canon roles

Recipe:
- culinary source of truth
- method, ingredients, yield, internal notes, protection, and authorship live here

Dish:
- service-facing output
- a sellable or operational output assembled from one or more recipes

Menu:
- publishing and grouping layer for dishes

### Canon answers

Is Menu just a grouping of dishes?
- yes

Is Dish the service-facing output?
- yes

Does Dish reference Recipe?
- yes

Can a Dish exist without a Recipe?
- yes temporarily for legacy or speed, but canonically that should be the exception

Recommendation:
- allow Dish without Recipe during transition and for edge cases
- treat Recipe-backed Dish as the preferred canon

Should Menu reference Recipe directly or only through Dish?
- Menu should reference Dish only

Why:
- Menu is a publishing layer
- direct Menu-to-Recipe binding would collapse the separation between culinary truth and service presentation

Should Recipe be the culinary source of truth?
- yes

### Important cleanup implication

Recipe should not depend on Dish as a required authority field.

Current KitchenRecipe includes dish_id.

Recommended canon:
- Recipe may optionally reference a primary_dish_id for convenience or provenance
- Dish should hold recipe_ids as the stronger relationship
- Recipe should remain valid even before any Dish exists

This preserves Recipe as the source of truth.

## Surface Plan

### Public surfaces

1. Public recipe index
- route family: ecosystem-facing recipe browsing
- audience: public visitors
- content: only recipes whose visibility allows public exposure

2. Public recipe detail page
- route family: public published recipe detail
- audience: public visitors
- content: only recipes whose visibility is public and whose protection level allows full public detail

3. Optional public summary page for protected recipes later
- audience: public visitors
- content: summary-only shells if the product later wants public teasers for protected recipes
- not required for first canon

### Authenticated non-console surfaces

4. Chef-authored recipe view
- audience: authenticated chef author
- purpose: personal authorship, draft status, publication state, and usage analytics
- current placeholder: packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue

### Console and runtime surfaces

5. Kitchen recipe workspace
- audience: authenticated kitchen team
- purpose: canonical operational recipe management inside the kitchen runtime
- current seed surface: packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue

6. Console recipe index
- audience: authenticated kitchen team
- purpose: browse, filter, inspect, duplicate, archive, protect, and attach recipes to dishes

7. Recipe create flow
- audience: authenticated kitchen team with recipe-create permission
- purpose: create a recipe in the active kitchen context

8. Recipe edit flow
- audience: author chef, kitchen editors, kitchen admins
- purpose: edit ingredients, steps, metadata, protection, and publication state

### Admin or editorial surfaces

9. Publication/admin surface
- audience: kitchen admins and app admins
- purpose: approve publication visibility, manage shared/public exposure, export policy, and moderation if needed

### Canon split of surfaces

Public:
- public recipe index
- public recipe detail

Authenticated:
- chef-authored recipe view

Console/runtime:
- kitchen recipe workspace
- recipe create flow
- recipe edit flow

Admin/editorial:
- publication and protection control surface

## Firestore Residence Recommendation

### Options assessed

Global root recipe collection:
- rejected as primary canon
- this is what current Misebox recipe composables assume
- it conflicts with the operational truth that recipes belong to kitchens

Kitchen-owned recipes collection:
- recommended as primary canon

App-scoped overlay for recipes:
- not recommended as a first-class second recipe entity
- overlays would create avoidable duplication too early

Hybrid root plus app overlay recipe entity:
- rejected as canon because it would formalize the current split instead of resolving it

### Recommended structure

Canonical source of truth:
- kitchens/{kitchenId}/recipes/{recipeId}

This should be the only authoring canon.

Optional derived projections later:
- SEO index docs
- search index docs
- public publication index docs

But those should be treated as derived surfaces, not competing entities.

### Why this supports the requirements

Kitchen ownership:
- direct and natural through kitchen_id and residence path

Chef authorship:
- stored inside the canonical recipe doc through author fields

Secret recipes:
- easiest to protect under kitchen membership boundaries

Public exposure:
- can be derived later from canonical docs when visibility allows it

Sharing later:
- published or shared recipes can be imported or duplicated into other kitchens with lineage, without changing the core ownership rule

## Permissions Matrix

### Owning kitchen
- create: yes
- read: yes
- update: yes
- delete: yes
- publish: yes
- duplicate: yes
- attach to menu: yes through dishes
- attach to dish: yes
- export: yes according to protection policy

### Kitchen team member
- create: yes if granted recipe-create
- read: yes if visibility and access policy allow it
- update: yes if granted edit rights
- delete: usually no unless elevated
- publish: no by default
- duplicate: yes if policy allows
- attach to menu: yes if they can edit dishes/menus
- attach to dish: yes if they can edit dishes
- export: no by default

### Author chef
- create: yes
- read: yes
- update: yes on authored recipes unless policy revokes it
- delete: usually no without kitchen approval
- publish: optional, only if kitchen policy allows it
- duplicate: yes within the owning kitchen
- attach to menu: indirectly through dish workflows if permitted
- attach to dish: yes if dish-edit rights exist
- export: no by default for protected recipes

### Other chefs
- create: yes if they belong to the kitchen and have create rights
- read: yes only if visibility and access policy allow it
- update: only if shared edit rights exist
- delete: no by default
- publish: no by default
- duplicate: only if policy allows
- attach to menu: only if they can edit dishes/menus
- attach to dish: only if they can edit dishes
- export: no by default

### Public visitor
- create: no
- read: only public recipes or public summaries when allowed
- update: no
- delete: no
- publish: no
- duplicate: no unless future public-copy pattern is intentionally added
- attach to menu: no
- attach to dish: no
- export: no

### App admin
- create: usually no operational need, but may be allowed
- read: yes for moderation or support where policy allows
- update: yes for admin or moderation tasks
- delete: yes if the app policy allows escalation
- publish: yes
- duplicate: yes
- attach to menu: usually not primary operational role
- attach to dish: usually not primary operational role
- export: yes subject to protection policy

## Target Stack And Path Shape

### Recommended owner package

- packages/extensions/fireux-kitchens

### Recommended canonical model path

- packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts

Note:
- rename or replace kitchen-recipe.model.ts so the canon reads as Recipe, not KitchenRecipe, while keeping kitchen ownership explicit in path and residence

### Recommended relative stack pattern

Model:
- packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts

Fetch composables:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/fetch/useRecipeCollection.ts
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/fetch/useRecipeFetch.ts

Create composable:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeCreate.ts

Update composable:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeUpdate.ts

Delete composable:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/mutations/useRecipeDelete.ts

Interface composable:
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/recipe/utils/view/useRecipeInterface.ts

Cards:
- packages/extensions/fireux-kitchens/src/runtime/components/organisms/Recipe/Cards/*

Collection manager:
- packages/extensions/fireux-kitchens/src/runtime/components/organisms/Recipe/Collection/Manager.vue

CTA:
- packages/extensions/fireux-kitchens/src/runtime/components/organisms/Recipe/CTA.vue

Kitchen console index:
- packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue

Kitchen detail page:
- packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes/[id].vue

Kitchen edit page:
- packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes/edit/[id].vue

Chef authored page:
- packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue

Public index page:
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/index.vue

Public detail page:
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue

### Surface ownership rule

Authoring and canonical data logic live in fireux-kitchens.

Public publishing presentation can live in fireux-misebox, but it must read from the kitchen-owned canon or from derived publication projections of that canon.

## Cleanup / Migration Plan

### Reusable now

Keep and build on:
- packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts as the starting point for the canonical Recipe model
- packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/runtime-kitchen/stack/fetch/useKitchenMenuStackFetch.ts as proof that kitchen-owned recipe residence already works
- packages/extensions/fireux-kitchens/src/runtime/pages/console/kitchen/recipes.vue as the seed kitchen workspace
- packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/chef/my-recipes.vue as the seed author-centric surface, even though it is currently placeholder
- packages/ecosystem/fireux-misebox/src/runtime/pages/recipes/[slug].vue as a public detail design reference
- packages/ecosystem/fireux-misebox/src/runtime/components/organisms/Recipe/Collection/Manager.vue and card components as public-facing UI references

### Misleading now

These currently point in the wrong canonical direction:
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeUpdate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeDelete.ts

Why misleading:
- they assume a root recipes collection
- create defaults to published public SEO behavior
- they do not respect kitchen ownership as the primary canon

### Duplicate or conflicting now

Conflict to resolve:
- KitchenRecipe under fireux-kitchens versus root Recipe assumptions under fireux-misebox

Conflict to remove:
- current KitchenRecipe includes dish_id, while Dish also holds recipe_ids

Recommendation:
- make Dish reference Recipe the stronger canonical dependency
- downgrade Recipe.dish_id to optional derived convenience or remove it from the canonical source model

### Missing now

Missing files or layers:
- canonical Recipe model named as Recipe rather than a kitchen-prefixed special case
- real recipe fetch/create/update/delete stack under fireux-kitchens runtime-kitchen/recipe
- recipe interface under fireux-kitchens
- recipe cards and collection manager under fireux-kitchens
- kitchen recipe detail/edit pages
- authored recipe dashboard wired to live data
- real publication policy fields and edit surfaces

### Should be renamed or moved

Recommended rename:
- packages/extensions/fireux-kitchens/src/runtime/models/kitchen-recipe.model.ts
to
- packages/extensions/fireux-kitchens/src/runtime/models/recipe.model.ts

Recommended refit, not outright deletion:
- refit Misebox recipe components and pages so they depend on the canon from fireux-kitchens rather than a missing root Recipe model

### Should be removed after refit

After canonical migration, remove or rewrite the root-collection assumptions inside:
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipes.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeCreate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeUpdate.ts
- packages/ecosystem/fireux-misebox/src/runtime/composables/fireux/firestore/recipe/useRecipeDelete.ts

### Phased cleanup plan

Phase 1: lock canon
- declare Recipe as a kitchen-owned canonical entity in fireux-kitchens
- define owner fields, author fields, visibility, protection, and publication policy
- decide the final Recipe model shape

Phase 2: normalize data model
- rename KitchenRecipe to Recipe in the owning package
- remove competing root recipe assumptions
- resolve Dish to Recipe as the canonical dependency direction

Phase 3: build the canonical kitchen stack
- add dedicated recipe fetch/create/update/delete composables under runtime-kitchen/recipe
- add recipe interface, cards, collection manager, CTA, detail, and edit surfaces
- wire chef my-recipes to real authored recipe data

Phase 4: refit Misebox public layer
- point public recipe index and detail at canonical kitchen-owned recipe data or derived publication projections
- remove missing Recipe.model imports
- remove direct root recipes collection assumptions

Phase 5: add publication and secrecy policy
- enforce visibility and protection fields
- add publication workflow and SEO behavior only for allowed recipe states
- ensure secret recipes cannot leak full public detail

## Final Recommendation

Canonise Recipe as a kitchen-owned runtime child entity in packages/extensions/fireux-kitchens.

Use this ownership rule:
- Kitchen owns the recipe.
- Chef authors the recipe.
- Dish references the recipe.
- Menu references dishes only.

Use this data rule:
- the only canonical authoring residence is kitchens/{kitchenId}/recipes/{recipeId}

Use this surface rule:
- fireux-kitchens owns the canonical model and authoring stack
- fireux-misebox may own public recipe presentation, but only as a surface on top of the kitchen-owned canon

Use this policy rule:
- visibility, protection_level, and access_policy must be first-class fields
- secret is primarily a protection state, not just a publication flag

Use this migration rule:
- do not create a second competing root Recipe entity
- refit the current Misebox recipe stack onto the kitchen-owned canon instead of trying to preserve both systems