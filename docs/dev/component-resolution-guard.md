# Component Resolution Guard
Status: Open operational risk
Authority: Tier2 (Development note)
Updated: 2026-05-25

This note records an ongoing FireUX risk: a route can return `200 OK` while its real child component fails to resolve, leaving the app apparently blank or partially rendered.

## Incident

Misebox Kitchen console child routes such as:

- `/console/kitchen/mise`
- `/console/kitchen/ingredients`
- `/console/kitchen/suppliers`

rendered the route page shell, but their child components did not render.

The useful diagnostic was adding literal text directly to the page file. The page text appeared, proving the route was alive and the problem was inside component resolution rather than routing, auth, Firestore, or the console selection guard.

## Regression Shape

The call sites and component provision drifted apart.

On `2026-05-16`, commit `f4fafad27` changed Kitchen console component usage from generated names such as:

```txt
OrganismsConsoleKitchenMise
OrganismsConsoleKitchenIngredients
OrganismsConsoleKitchenSuppliers
```

to shorter names such as:

```txt
ConsoleKitchenMise
ConsoleKitchenIngredients
ConsoleKitchenSuppliers
```

At the same time, the matching `OrganismsConsoleKitchen` provision was removed. The root `/console/kitchen` stayed alive because it had a one-off alias, which masked the child route break.

Current direction:

```txt
Use the generated Nuxt path-based component names.
Do not rely on one-off aliases to hide prefix drift.
```

For the Kitchen console stack that means:

```txt
OrganismsConsoleKitchen*
```

## Why Current Smoke Missed It

The smoke script checks route HTTP status and a few HTML failure markers. It does not currently fail when Nuxt/Vue logs:

```txt
Failed to resolve component
Component <Anonymous> is missing template or render function
```

So a route can pass smoke while a critical module-owned child component is absent.

## Component Provision Families

We should guard component resolution differently depending on who provides the component.

### Core/System Provided

Examples:

- layouts
- app shell components
- shared public page frames
- core collection managers/cards

Provider:

```txt
fireux-core
```

Guard direction:

- every FireUX app should have the expected core/system components available after prepare/build
- unresolved core/system components are release blockers for every app

### Module Provided

Examples:

- Kitchen console components
- Supplier console components
- Property/Portfolio console components
- domain-specific collection managers/cards

Provider:

```txt
packages/extensions/fireux-*
packages/ecosystem/fireux-*
```

Guard direction:

- only apps that install/enable a module should be checked for that module's components
- each module should have one declared component naming pattern
- module pages and module components must use that declared pattern
- one-off aliases should not be used to paper over drift unless explicitly documented as public API

### App-Local Provided

Examples:

- app-specific landing sections
- app-local page wrappers
- tenant-local visual surfaces

Provider:

```txt
projects/**/app/components
```

Guard direction:

- app-local components are checked inside that app only
- missing app-local components should fail that app's smoke/build

## Guard We Need

This should become a release/pre-push guard, not something run on every small edit.

Minimum useful guard:

1. Start the app with smoke.
2. Visit critical route groups, including nested console child routes.
3. Fail if server/client output contains:
   - `Failed to resolve component`
   - `Component <Anonymous> is missing template or render function`
4. Fail if the rendered HTML contains the unresolved component tag name.
5. For installed modules, verify generated component names exist in `.nuxt/components.d.ts` after prepare/build.

Misebox release smoke should include at least:

```txt
/console/kitchen
/console/kitchen/identity
/console/kitchen/mise
/console/kitchen/ingredients
/console/kitchen/suppliers
/console/kitchen/menus
/console/kitchen/dishes
/console/kitchen/recipes
/console/supplier
```

## Open Decision

We still need to choose the clean repo-wide declaration point for module component contracts.

Possible shape:

```txt
module provides:
- component prefix
- component directory
- critical route/component pairs
```

Then the release guard can say:

```txt
If app installs module X, verify X's required components resolve on X's critical routes.
```

This should stay explicit. A page returning `200 OK` is not enough proof that a FireUX module surface works.
