# Recipe Model Spec

Authority: working model design spec
Updated: 2026-03-16

## 1. Final Entity Definition

Recipe is the canonical culinary source-of-truth record for a kitchen.

In plain English:

- a Recipe is the authoritative record for how a kitchen makes something
- it stores the method, ingredient lines, yield, timing, protection policy, authorship, and publication eligibility for that method
- it belongs operationally to one kitchen only
- it is authored by a chef profile, backed by an authenticated user
- it may be used by zero, one, or many dishes
- it is not itself a menu item
- it is not a global root entity
- it is not a public-content entity first
- it may feed public surfaces later through a derived publication layer

Recipe is therefore a kitchen-owned runtime child entity with optional public projection.

That definition resolves the current drift by making one record authoritative for both operational use and publishable metadata, while keeping public delivery as a derivative concern instead of a competing model.

## 2. Canonical Firestore Residence

### Final recommendation

Canonical authoring path:

- kitchens/{kitchenId}/recipes/{recipeId}

This is the only canonical authoring residence.

### Why this path is correct

- Kitchen is the owner of record.
- Recipe access rules naturally follow kitchen membership and kitchen policy.
- Secret and confidential recipes are easier to protect under kitchen ownership than under a global root collection.
- Dish and menu relationships already live in the kitchen domain.
- This matches the approved canon and the existing real runtime pattern.

### Derived and public projection docs

Derived projection docs should exist, but only as projections of the canonical kitchen-owned document.

Create these later when public publishing is implemented:

- recipe_publications/{recipeId}
- recipe_publication_slugs/{slug}

Purpose of recipe_publications/{recipeId}:

- public-facing published projection only
- contains denormalized public-safe fields needed by public pages
- exists only when publication_status is published
- never becomes an authoring source

Purpose of recipe_publication_slugs/{slug}:

- global slug lookup index for public routing
- maps slug to recipeId and publication record metadata
- prevents slug collision without turning slug into the primary document id

### Search projection

Do not create a dedicated search projection now.

Reason:

- the immediate need is canonical authoring plus safe public page delivery
- a search index is a scaling concern, not a model-definition concern
- adding search now would introduce another derived shape before the canonical model is even stabilized

### App overlays

Do not create app overlays now.

Exact rule:

- no second app-scoped recipe entity
- no app-specific authoring document for Recipe
- if app-specific presentation is needed later, it must be projection-only and derived from the kitchen-owned canonical recipe

Final storage direction:

- authoring canon now: kitchens/{kitchenId}/recipes/{recipeId}
- public projection later: recipe_publications/{recipeId}
- slug index later: recipe_publication_slugs/{slug}
- no app overlay now
- no search projection now

## 3. Exact Field Model

## Identity

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| id | string | required | Stable recipe document id. | Every canonical entity needs one durable identity key. |
| name | string | required | Internal canonical recipe name used operationally by the kitchen. | This is the primary human label for kitchen workflows. |
| slug | string | optional | Reserved public slug for publication use. | Public pages need stable route identity, but drafts and private recipes do not. |
| recipe_type | RecipeType | required | Declares what kind of recipe record this is operationally. | Dishes may use multiple recipes with different roles; this keeps the model expressive without overloading Dish. |

### Identity rules

- id is the Firestore doc id.
- name is the authoritative internal title.
- slug is optional until publication workflow needs it.
- slug must be globally unique across published recipe projections, enforced through recipe_publication_slugs.
- recipe_type is required from day one so the kitchen can distinguish prep recipes from service recipes without inferring from names.

## Ownership

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| kitchen_id | string | required | The owning kitchen id. | Ownership, access, secrecy, and authoring residence all depend on the kitchen. |

### Ownership rules

- kitchen_id must match the parent path segment in kitchens/{kitchenId}/recipes/{recipeId}.
- Recipe cannot move between kitchens as the same authoritative record.
- Reuse across kitchens must happen through duplication or import, not ownership reassignment.

## Authorship

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| author_chef_id | string | required | Chef profile id for the recipe author. | Chef is the domain author identity. |
| author_user_id | string | required | Authenticated user id behind the authoring chef profile. | User identity is needed for stamps, permissions, and audit history. |

### Authorship rules

- author_chef_id is the primary domain-level author reference.
- author_user_id is the primary auth-level author reference.
- The author may change over time only through explicit reassignment by kitchen admin.
- Public display names should be derived or snapshotted in projections, not stored as canonical author fields on the recipe doc.

## Lifecycle

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| workflow_status | WorkflowStatus | required | Operational lifecycle state of the recipe. | Operational use and publication are not the same concern. |
| archived_at | FirebaseTimestamp | optional | Timestamp when the recipe was archived. | Archive transitions should be traceable without overloading updated.at. |
| archived_by | string | optional | User id that archived the recipe. | Archive changes need explicit auditability. |

### Lifecycle rules

- workflow_status controls operational readiness, not public visibility.
- archived_at and archived_by must only be present when workflow_status is archived.
- draft recipes cannot be publicly published.

## Visibility

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| visibility | RecipeVisibility | required | Declares the intended audience scope for the recipe. | Audience scope must be explicit instead of inferred from publication side effects. |

### Visibility rules

- visibility answers who may see the recipe in principle.
- visibility does not override protection_level.
- visibility public is only valid when publication_status is published and protection_level is not secret.

## Protection

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| protection_level | ProtectionLevel | required | Declares how tightly the recipe body must be protected. | Secret handling must be a first-class protection concern. |
| access_policy | RecipeAccessPolicy | required | Explicit role-based access policy for metadata, method, edit, publish, export, and duplication behavior. | Permissions cannot be modeled safely with only visibility and booleans. |

### access_policy fields

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| metadata_read_roles | RecipePolicyRole[] | required | Roles allowed to read operational metadata. | Metadata access is broader than full method access. |
| method_read_roles | RecipePolicyRole[] | required | Roles allowed to read full ingredient and step content. | Full method access is the sensitive boundary. |
| edit_roles | RecipePolicyRole[] | required | Roles allowed to edit recipe content. | Edit rights should be explicit and auditable. |
| publish_roles | RecipePolicyRole[] | required | Roles allowed to publish or withdraw public projections. | Publication authority should not be implied from edit access. |
| export_roles | RecipePolicyRole[] | required | Roles allowed to export the recipe outside the app surface. | Export is a separate leakage vector. |
| duplicate_scope | DuplicateScope | required | Whether duplication is blocked, same-kitchen only, or can create approved shared imports. | Duplication needs tighter rules than ordinary reads. |
| shared_kitchen_ids | string[] | optional | Approved destination kitchens when visibility is shared. | Shared visibility needs an explicit list, not a vague concept. |

### Protection rules

- protection_level governs how much of the recipe body may be exposed, even to otherwise legitimate viewers.
- access_policy.shared_kitchen_ids must be empty or omitted unless visibility is shared.
- protection_level secret overrides any attempt to publish full method content.

## Culinary Content

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| description | string | required | Short canonical description of the recipe. | Operational and public surfaces both need a concise summary. |
| ingredient_lines | RecipeIngredientLine[] | required | Ordered ingredient lines used to execute the recipe. | Ingredient structure is part of the culinary source of truth. |
| steps | RecipeStep[] | required | Ordered method steps used to execute the recipe. | Method structure is the core recipe body. |
| tags | string[] | required | Lightweight kitchen tags for filtering and grouping. | Kitchens need flexible internal organization without schema churn. |
| notes | string | optional | Internal freeform notes for kitchen-only context. | Recipes often need non-public instructions or caveats that do not belong in public copy. |
| cuisine_types | string[] | optional | Cuisine labels for filtering and public presentation. | This preserves useful Misebox display semantics without making them the core identity. |
| dietary_flags | string[] | optional | Dietary labels such as vegetarian or gluten-free. | Public and internal filtering benefit from explicit dietary labeling. |
| difficulty_level | DifficultyLevel | optional | Human difficulty rating for preparation. | This supports planning and public presentation without driving core lifecycle. |

### ingredient_lines[] item shape

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| id | string | required | Stable line item id within the recipe. | Stable ids support editing, reordering, and diffing. |
| ingredient_id | string | optional | Linked ingredient entity id when the line references a kitchen ingredient record. | Some lines will map to canon ingredients; some will remain free text. |
| ingredient_name | string | required | Human-readable ingredient name. | The recipe must remain readable even when ingredient_id is absent. |
| quantity | number | required | Numeric amount for the line. | Quantity is fundamental operational data. |
| unit | string | required | Unit tied to quantity. | Quantity is ambiguous without a unit. |
| prep_note | string | optional | Prep qualifier such as diced or room temperature. | These modifiers belong with the ingredient line itself. |

### steps[] item shape

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| id | string | required | Stable step id within the recipe. | Stable ids support reordering and editing. |
| order | number | required | Explicit step ordering. | Firestore arrays should not carry semantic order implicitly only by position. |
| title | string | optional | Short label for the step. | Step titles help large recipes and public presentation. |
| instruction | string | required | Full step instruction text. | This is the executable method content. |
| minutes | number | optional | Optional time estimate for the step. | Some recipes need step-level timing granularity. |

## Yield / Timing

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| yield_qty | number | required | Numeric yield amount produced by the recipe. | Kitchens need operational yield information for scaling and dish planning. |
| yield_unit | string | required | Yield unit such as portion, batch, tray, or liter. | Yield quantity is meaningless without a unit. |
| prep_minutes | number | required | Prep time estimate. | Planning and staffing need explicit prep time. |
| cook_minutes | number | required | Cook time estimate. | Production planning needs explicit cook time. |

### Yield and timing rules

- total_time_minutes should be derived, not stored.
- public servings should be derived from yield fields when possible, not modeled as a second canonical quantity unless later requirements prove necessary.

## Linking / Provenance

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| primary_dish_id | string | optional | Optional primary dish that most directly uses this recipe. | This supports navigation and convenience without reversing the ownership model. |
| source_recipe_id | string | optional | Upstream canonical recipe id when this recipe was imported or duplicated from another source. | Reuse should preserve lineage without sharing authoritative ownership. |
| source_kitchen_id | string | optional | Kitchen id of the source recipe when imported from another kitchen. | Provenance should identify where a duplicated recipe came from. |

### Linking and provenance rules

- primary_dish_id is optional convenience only.
- Recipe must remain valid when no dish exists.
- Dish holds the stronger dependency on Recipe, not the other way around.
- source_recipe_id and source_kitchen_id must either both exist together or both be omitted.

## Publication

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| publication_status | PublicationStatus | required | Public publication state separate from operational workflow. | A recipe can be active operationally and still not be public. |
| published_at | FirebaseTimestamp | optional | Timestamp when public projection was published. | Public state transitions need explicit audit and projection control. |
| published_by | string | optional | User id that published the recipe. | Publication is a privileged action and must be traceable. |
| published_summary | PublishedRecipeSummary | optional | Public-safe presentation payload used to build projections. | Public copy often differs from kitchen-operational wording and should be explicitly curated. |

### published_summary fields

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| title | string | required | Public-facing title. | Public display may need cleaner copy than internal name. |
| description | string | required | Public-facing summary description. | Public pages should not read raw kitchen notes or operational shorthand. |
| hero_image_url | string | optional | Main public image for the recipe. | Public recipe pages usually need a lead image. |
| cuisine_types | string[] | optional | Public cuisine labels. | Public filtering and categorization need display-safe labels. |
| dietary_flags | string[] | optional | Public dietary labels. | Public visitors benefit from explicit dietary filtering. |
| difficulty_level | DifficultyLevel | optional | Public difficulty display. | Public pages often expose difficulty. |

### Publication rules

- publication_status is unpublished by default.
- published_at and published_by must only exist when publication_status is published.
- published_summary must exist when publication_status is published.
- visibility public requires publication_status published.
- protection_level secret forbids publication_status published.
- archived recipes must not remain published.

## Stamps / Meta

| Field | Type | Required | Meaning | Why it exists |
| --- | --- | --- | --- | --- |
| created | FireuxStamped['created'] | required | Canonical creation stamp. | Existing repo conventions already rely on stamped metadata. |
| updated | FireuxStamped['updated'] | required | Canonical update stamp. | Existing repo conventions already rely on stamped metadata. |

### Meta rules

- created.app_id may remain for provenance, but it is not an ownership field.
- No separate top-level app_id field should be added to Recipe now.
- Projection docs may denormalize metadata, but the canonical recipe doc should stay kitchen-owned.

## 4. Enum Definitions

### workflow_status

Final enum:

- draft
- active
- archived

Meaning:

- draft: recipe is being authored or revised and is not yet an approved operational standard
- active: recipe is approved for normal operational use
- archived: recipe is retired from normal operational use

Exact rules:

- draft cannot be published
- active may be unpublished or published
- archived must be unpublished or withdrawn from public projection

### visibility

Final enum:

- private
- team
- shared
- public

Meaning:

- private: visible only to explicitly allowed owner-side roles
- team: visible to the owning kitchen team according to access_policy
- shared: visible to approved external kitchens listed in shared_kitchen_ids
- public: eligible for public projection and public reading

Exact rules:

- public requires publication_status published
- shared requires access_policy.shared_kitchen_ids to contain at least one kitchen id
- private and team do not create public projection docs
- secret recipes cannot use public

### protection_level

Final enum:

- standard
- confidential
- secret

Meaning:

- standard: normal operational protection
- confidential: internal recipe that should not be broadly exported or casually exposed
- secret: tightly protected recipe body with no public full-method exposure

Exact rules:

- standard may be public if visibility and publication_status allow it
- confidential may be public only if business policy later allows it and the recipe is not marked secret; in first implementation, confidential may be published only when the kitchen explicitly chooses to do so
- secret may not be publicly published in first implementation

### recipe_type

Final enum:

- base
- component
- prep
- service

Meaning:

- base: foundational recipe such as stock, mother sauce, dough, or broth
- component: subrecipe used inside another recipe or dish
- prep: batch prep or mise-oriented recipe prepared ahead of service
- service: final recipe intended to support a service-facing dish outcome

Why keep it:

- it helps the kitchen classify recipes without forcing every recipe into the same operational role
- it prevents Dish from carrying too much interpretive logic

### publication_status

Final enum:

- unpublished
- published
- withdrawn

Meaning:

- unpublished: no public projection exists
- published: public projection exists and is routable
- withdrawn: previously published content has been removed from public delivery

Exact rules:

- unpublished is the default
- published requires workflow_status active, visibility public, protection_level not secret, and a valid published_summary
- withdrawn removes or disables public projection docs

### difficulty_level

Final enum:

- easy
- moderate
- advanced

Reason to keep it:

- it already exists in public-facing assumptions
- it is useful for public display and kitchen planning
- it is lightweight and does not distort the canonical model

## 5. Secret Recipe Rules

### Final rule set

Secret is a protection state, not a visibility state.

That means:

- protection_level secret is the canonical indicator that a recipe is secret
- visibility still describes audience scope separately
- publication_status still describes whether public projection exists

### What fields may exist on secret recipes

Secret recipes may use the full canonical model, including:

- all identity fields
- all ownership and authorship fields
- all lifecycle fields
- visibility
- protection_level
- access_policy
- full ingredient_lines
- full steps
- notes
- yield and timing
- provenance
- stamps

Important restriction:

- published_summary should not be populated for secret recipes in first implementation because secret recipes are not publishable now

### Can secret recipes ever be public

Final answer for first implementation:

- no

Exact rule:

- if protection_level is secret, then visibility must not be public
- if protection_level is secret, then publication_status must be unpublished or withdrawn
- if protection_level is secret, no recipe_publications doc may be emitted
- if protection_level is secret, no recipe_publication_slugs doc may be emitted

### Is public summary without full method allowed

Final answer for first implementation:

- no

Future possibility:

- later the product may support public teaser shells for protected recipes
- if that is ever added, it must use a distinct projection contract that exposes summary metadata only and never ingredient_lines, step instructions, notes, or exact yield details that reveal the protected method

But that is postponed. It is not part of the first canonical model implementation.

### Export and duplicate rules for secret recipes

Exact rules:

- export of full secret recipe content is blocked for kitchen editors, team members, author chefs, public visitors, and app admins by default
- export of full secret recipe content is allowed only to kitchen owner/admin
- cross-kitchen duplication of secret recipes is blocked
- same-kitchen duplication of secret recipes is allowed only for kitchen owner/admin and, if explicitly granted by access_policy, the author chef
- secret recipes may be attached to dishes inside the owning kitchen if the actor can read full method and edit dishes

### Field exposure boundary for secret recipes

For secret recipes, treat these as method-sensitive fields:

- ingredient_lines
- steps
- notes
- source_recipe_id
- source_kitchen_id

These fields must never be exposed publicly in first implementation.

## 6. Relationship Model

### Exact relationships

Recipe -> Kitchen

- many recipes belong to one kitchen
- each recipe belongs to exactly one kitchen

Recipe -> Chef

- many recipes may be authored by one chef
- each recipe has one primary author_chef_id

Dish -> Recipe

- one dish may reference zero, one, or many recipes
- one recipe may be referenced by zero, one, or many dishes

Menu -> Dish

- one menu groups one or many dishes
- menu should reference dishes only
- menu should never reference recipes directly

### Exact answers to the open relationship questions

Should Recipe keep dish_id

- no

Reason:

- it creates backward authority pressure from Dish into Recipe
- it forces Recipe to look subordinate to Dish
- it creates a bidirectional dependency when Recipe should remain valid before any dish exists

Should Dish keep recipe_ids

- yes

Reason:

- Dish is the service-facing assembly layer
- dishes may legitimately use multiple recipes
- recipe_ids expresses the stronger dependency in the correct direction

Should Dish keep one primary_recipe_id

- yes

Reason:

- many dishes need a primary recipe for UI, linking, default navigation, and reporting
- keeping both primary_recipe_id and recipe_ids avoids forcing clients to infer a primary recipe from array order

Can Dish reference many recipes

- yes

Reason:

- dishes often combine multiple components, prep recipes, and bases

What is the preferred canon

- Dish holds primary_recipe_id for the main recipe relationship
- Dish holds recipe_ids for the full set of linked recipes
- Recipe does not hold required dish ownership fields
- Recipe may hold optional primary_dish_id as a convenience pointer only
- Menu references Dish only

### Final recommended relationship model

- Recipe is kitchen-owned and chef-authored
- Dish depends on Recipe, not the other way around
- Dish should evolve to include both primary_recipe_id and recipe_ids
- Recipe.primary_dish_id remains optional and non-authoritative
- Menu references Dish only

## 7. Permissions Model

### Field-level permission boundary

Treat recipe fields as three permission bundles.

Metadata bundle:

- id
- name
- slug
- recipe_type
- kitchen_id
- author_chef_id
- workflow_status
- visibility
- protection_level
- yield_qty
- yield_unit
- prep_minutes
- cook_minutes
- tags
- cuisine_types
- dietary_flags
- difficulty_level
- publication_status
- primary_dish_id
- created
- updated

Method bundle:

- ingredient_lines
- steps
- notes

Control bundle:

- access_policy
- source_recipe_id
- source_kitchen_id
- published_summary
- published_at
- published_by
- archived_at
- archived_by

### Action-level permissions

| Actor | Create | Read metadata | Read full method | Edit | Publish | Archive | Duplicate | Export | Attach to dish |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| kitchen owner/admin | yes | yes | yes | yes | yes | yes | yes | yes | yes |
| kitchen editor | yes | yes | yes unless secret policy restricts method_read_roles | yes if in edit_roles | no by default | yes if in edit_roles or archive policy | same-kitchen only if duplicate_scope allows | no by default | yes |
| author chef | yes | yes | yes if in method_read_roles | yes on own recipes if in edit_roles | no by default, yes only if in publish_roles | no by default, yes only if explicitly granted | same-kitchen only if duplicate_scope allows | no by default | yes if can edit the target dish |
| team member | no by default | yes only if metadata_read_roles allows | yes only if method_read_roles allows | no by default | no | no | no unless duplicate_scope and roles allow | no | yes only if dish-edit rights and method access both exist |
| public visitor | no | yes only through published projection | no unless the recipe is published and not secret, in which case they read the projected public method only | no | no | no | no | no | no |
| app admin | no by default | yes for moderation/support metadata | no by default for secret recipes; otherwise only through explicit support or moderation policy | limited moderation edits only, not ordinary culinary authorship | yes for moderation override if platform policy allows | yes for moderation override if platform policy allows | no by default | no by default for secret recipes | no |

### Exact permission interpretation

- kitchen owner/admin is the highest operational authority for canonical recipe docs
- kitchen editor is an operational contributor, not a publisher by default
- author chef is the domain author, but authorship alone does not imply publication authority
- team member is not assumed to be a recipe editor
- public visitor never reads canonical docs directly; public access comes only through published projections
- app admin may govern platform safety and publication moderation, but should not automatically gain secret full-method access

## 8. Derived Public Projection

### Final recommendation

Create one derived published recipe projection plus one slug index.

Do not create a competing canonical recipe model.
Do not create a search projection yet.

### Exact direction

Projection docs to create later:

- recipe_publications/{recipeId}
- recipe_publication_slugs/{slug}

### Why this is the right direction

- public pages need a safe, stable, route-friendly shape
- public pages should not read canonical kitchen docs directly
- secret and confidential controls are easier to enforce when the public layer is generated from an allowlisted projection
- slug uniqueness is easier to manage with a dedicated slug index than by making slug the canonical id
- search is premature until the publication projection is settled

### What goes into recipe_publications

Only public-safe fields, for example:

- recipe_id
- kitchen_id
- slug
- title
- description
- hero_image_url
- cuisine_types
- dietary_flags
- difficulty_level
- yield_qty
- yield_unit
- prep_minutes
- cook_minutes
- total_time_minutes
- public_ingredient_lines if policy allows full public method
- public_steps if policy allows full public method
- author display snapshot
- published_at

Important rule:

- recipe_publications is always derived from the canonical kitchen recipe and never edited as the source of truth

### What goes into recipe_publication_slugs

- slug
- recipe_id
- publication_status
- path
- updated_at

Important rule:

- the slug index exists only to resolve public routing and uniqueness
- it must never become a second recipe content store

## 9. Migration From Current Shape

### From kitchen-recipe.model.ts

| Current field | Action | Target field | Notes |
| --- | --- | --- | --- |
| id | keep | id | Keep as-is. |
| kitchen_id | keep | kitchen_id | Keep as-is. |
| dish_id | remove | none | Remove as canonical dependency. Replace with optional Recipe.primary_dish_id only if needed for convenience. |
| name | keep | name | Keep as the canonical internal title. |
| description | keep | description | Keep as canonical summary. |
| status | rename | workflow_status | Rename for clarity and to separate lifecycle from publication. |
| yield_qty | keep | yield_qty | Keep as-is. |
| yield_unit | keep | yield_unit | Keep as-is. |
| prep_minutes | keep | prep_minutes | Keep as-is. |
| cook_minutes | keep | cook_minutes | Keep as-is. |
| ingredient_lines | keep and refine | ingredient_lines | Keep the field, but add stable line ids and make ingredient_id optional instead of assumed. |
| steps | keep and refine | steps | Keep the field, but allow optional title and optional minutes. |
| notes | keep | notes | Keep as optional internal notes. |
| tags | keep | tags | Keep as-is. |
| created | keep | created | Keep existing stamp shape. |
| updated | keep | updated | Keep existing stamp shape. |

### New fields to add beyond kitchen-recipe.model.ts

| New field | Action | Why it is needed |
| --- | --- | --- |
| slug | add | Publication routing and stable public identity. |
| recipe_type | add | Operational classification. |
| author_chef_id | add | Explicit chef authorship. |
| author_user_id | add | Auth-backed authorship and audit linkage. |
| visibility | add | Audience scope must be first-class. |
| protection_level | add | Secret/confidential handling must be explicit. |
| access_policy | add | Permission logic must be modeled directly. |
| primary_dish_id | add | Optional convenience pointer without reversing authority. |
| source_recipe_id | add | Provenance for duplicated or imported recipes. |
| source_kitchen_id | add | Provenance for cross-kitchen duplication lineage. |
| publication_status | add | Separate operational workflow from public publication. |
| published_at | add | Audit for publication events. |
| published_by | add | Audit for publication events. |
| published_summary | add | Curated public-safe copy and presentation payload. |
| archived_at | add | Explicit archive transition stamp. |
| archived_by | add | Explicit archive transition stamp. |
| cuisine_types | add | Preserve useful public-facing categorization. |
| dietary_flags | add | Preserve useful public-facing dietary filters. |
| difficulty_level | add | Preserve useful difficulty metadata from current public assumptions. |

### From current Misebox public recipe assumptions

| Current assumption | Action | Canon target | Notes |
| --- | --- | --- | --- |
| title | derive | published_summary.title | Internal canon keeps name; public copy lives in published_summary. |
| slug | keep | slug | Keep as optional canonical field reserved for publication. |
| chef_name | derive | projection snapshot only | Derive from chef profile or projection snapshot, not canonical recipe doc. |
| featured_image | rename | published_summary.hero_image_url | Keep as public presentation metadata only. |
| total_time_minutes | derive | derived in projection | Do not store canonically; derive from prep_minutes + cook_minutes. |
| difficulty_level | keep | difficulty_level | Keep as optional canonical metadata. |
| servings | postpone | none now | Derive from yield fields when possible; add only if a real separate need emerges. |
| ingredients | derive and normalize | ingredient_lines | Public ingredients must derive from canonical ingredient_lines. |
| instructions | derive and normalize | steps | Public instructions must derive from canonical steps. |
| cuisine_type | rename | cuisine_types | Normalize to plural array field. |
| dietary_restrictions | rename | dietary_flags | Normalize terminology and intent. |
| source | remove | none | Replace vague source labeling with source_recipe_id and source_kitchen_id provenance. |
| parent_app_id | derive | created.app_id | Keep app provenance in stamps, not as a second ownership field. |
| creator_id | rename | author_user_id | Canon needs explicit user authorship, but attached to the kitchen-owned record. |
| status: published | remove default | publication_status default unpublished | Publication must be explicit, not create-time default behavior. |
| seo public true | postpone and derive | projection creation on publish | SEO side effects must happen only after canonical publication rules pass. |

### Keep / rename / add / remove / derive / postpone summary

Keep:

- id
- kitchen_id
- name
- description
- yield_qty
- yield_unit
- prep_minutes
- cook_minutes
- ingredient_lines
- steps
- notes
- tags
- created
- updated

Rename:

- status -> workflow_status
- cuisine_type -> cuisine_types
- dietary_restrictions -> dietary_flags
- featured_image -> published_summary.hero_image_url
- creator_id -> author_user_id

Add:

- slug
- recipe_type
- author_chef_id
- visibility
- protection_level
- access_policy
- primary_dish_id
- source_recipe_id
- source_kitchen_id
- publication_status
- published_at
- published_by
- published_summary
- archived_at
- archived_by
- difficulty_level

Remove:

- dish_id as a canonical required field
- source as a vague public badge field
- parent_app_id as a top-level ownership field
- create-time default published public behavior

Derive:

- total_time_minutes
- chef_name public display
- public ingredient and instruction display lists
- public route path from slug
- projection docs and slug index

Postpone:

- dedicated search projection
- public summary for secret recipes
- separate servings field

## 10. Final Recommended Type Shape

```ts
type WorkflowStatus = 'draft' | 'active' | 'archived'

type RecipeVisibility = 'private' | 'team' | 'shared' | 'public'

type ProtectionLevel = 'standard' | 'confidential' | 'secret'

type RecipeType = 'base' | 'component' | 'prep' | 'service'

type PublicationStatus = 'unpublished' | 'published' | 'withdrawn'

type DifficultyLevel = 'easy' | 'moderate' | 'advanced'

type RecipePolicyRole =
  | 'kitchen_admin'
  | 'kitchen_editor'
  | 'author_chef'
  | 'team_member'
  | 'app_admin'

type DuplicateScope = 'blocked' | 'same_kitchen_only' | 'approved_shared_import'

type RecipeIngredientLine = {
  id: string
  ingredient_id?: string
  ingredient_name: string
  quantity: number
  unit: string
  prep_note?: string
}

type RecipeStep = {
  id: string
  order: number
  title?: string
  instruction: string
  minutes?: number
}

type RecipeAccessPolicy = {
  metadata_read_roles: RecipePolicyRole[]
  method_read_roles: RecipePolicyRole[]
  edit_roles: RecipePolicyRole[]
  publish_roles: RecipePolicyRole[]
  export_roles: RecipePolicyRole[]
  duplicate_scope: DuplicateScope
  shared_kitchen_ids?: string[]
}

type PublishedRecipeSummary = {
  title: string
  description: string
  hero_image_url?: string
  cuisine_types?: string[]
  dietary_flags?: string[]
  difficulty_level?: DifficultyLevel
}

type Recipe = {
  id: string

  name: string
  slug?: string
  recipe_type: RecipeType

  kitchen_id: string

  author_chef_id: string
  author_user_id: string

  workflow_status: WorkflowStatus
  archived_at?: FirebaseTimestamp
  archived_by?: string

  visibility: RecipeVisibility

  protection_level: ProtectionLevel
  access_policy: RecipeAccessPolicy

  description: string
  ingredient_lines: RecipeIngredientLine[]
  steps: RecipeStep[]
  tags: string[]
  notes?: string
  cuisine_types?: string[]
  dietary_flags?: string[]
  difficulty_level?: DifficultyLevel

  yield_qty: number
  yield_unit: string
  prep_minutes: number
  cook_minutes: number

  primary_dish_id?: string
  source_recipe_id?: string
  source_kitchen_id?: string

  publication_status: PublicationStatus
  published_at?: FirebaseTimestamp
  published_by?: string
  published_summary?: PublishedRecipeSummary

  created: FireuxStamped['created']
  updated: FireuxStamped['updated']
}
```

## Final Recommendation

Implement Recipe as one kitchen-owned canonical entity with explicit chef authorship, explicit protection policy, explicit publication state, and derived public projections only.

Use this final shape and these final enum rules as the last design pass before implementation.