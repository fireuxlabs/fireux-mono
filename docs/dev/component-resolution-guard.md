# Component Resolution Guard
Status: Guarded by static check and release smoke
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

The call sites and component provision drifted apart. A route page used one component naming family while the module provider registered another. The root `/console/kitchen` stayed alive because it had a one-off alias, which masked the child route break.

Current direction:

```txt
Use the generated Nuxt path-based component names.
Do not rely on one-off aliases to hide prefix drift.
```

For the Kitchen console stack that means natural path names such as:

```txt
ConsoleKitchen*
```

## Why Current Smoke Missed It

The smoke script checks route HTTP status and a few HTML failure markers. It does not currently fail when Nuxt/Vue logs:

```txt
Failed to resolve component
Component <Anonymous> is missing template or render function
```

So a route can pass smoke while a critical module-owned child component is absent.

## Release Smoke

Run the component-resolution smoke when checking release-critical console routes:

```txt
pnpm smoke:components
```

This script starts the target app, probes the critical console routes, and fails if output contains:

```txt
Failed to resolve component
Component <Anonymous> is missing template or render function
```

It also fails if rendered HTML exposes unresolved component tags such as `console-kitchen`, `console-supplier`, or `organisms`.

This is not part of the normal `dev:*` startup loop.

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
- one-off aliases should not be used to paper over drift
- module-owned UI should live under `runtime/components/**` and use Nuxt path-based names

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

## Guard In Place

This is a release/pre-push style smoke check, not something run on every small edit.

Current useful guards:

1. `pnpm guard` fails if package/project component files import a missing relative target.
2. `pnpm guard` fails if package UI reintroduces `runtime/components/organisms`, `Organisms*`, or old organisms import paths.
3. `pnpm smoke:components` starts the app with smoke.
4. `pnpm smoke:components` visits critical route groups, including nested console child routes.
5. `pnpm smoke:components` fails if server/client output contains:
   - `Failed to resolve component`
   - `Component <Anonymous> is missing template or render function`
6. `pnpm smoke:components` fails if the rendered HTML contains the unresolved component tag name.

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

Implemented entry:

```txt
pnpm smoke:components
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
