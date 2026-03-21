# Models Directory

Authority: Operational
Updated: 2026-03-21
Scope: `packages/*/fireux-*/src/runtime/models` and child directories under `models/*`.

Learn how FireUX runtime models are classified, how they are stored, and how future model decisions should be explained.

## Models Directory

`runtime/models/` contains the runtime model layer for FireUX packages.

This directory can contain:
- canonical root entities
- stored overlays for entities that genuinely have scoped truth
- console facades over root entities
- scoped operational entities owned by a console
- model support and protocol types that belong with runtime models

## Model Families

### Identity

Who is using the system.

Examples:
- `User`
- `Chef`
- `Agent`
- `Professional`

Identity models normally use root plus overlay storage:
- root canonical record
- app-scoped overlay only when real scoped stored state exists

### Console

Where people operate.

Examples:
- `Kitchen`
- `Portfolio`
- `Supplier`
- `Project`

Some console models use root plus overlay storage.
Some console models stay root-only and expose a console facade.

### System

What makes FireUX run.

Examples:
- `App`
- `Ecosystem`
- `Module`

System models are usually stored once at root.
If a console manages them, it should normally do so through a facade first, not by inventing a second stored overlay.

### Domain Root

What exists independently of a console.

Examples:
- `Place`
- `Company`
- `Ingredient`
- `Job`
- `BlogPost`
- `Product`

These stay canonical at root unless real scoped stored truth appears later.

### Scoped

What only exists because a console owns it.

A scoped model must declare:
- what console owns it
- whether it links to a root entity
- whether it is purely local to the console

Examples:
- Kitchen-scoped: `Menu`, `Dish`, `Recipe`, `KitchenOrder`, `KitchenTeamMember`, `KitchenMiseTask`, `KitchenCostSnapshot`
- Portfolio-scoped: `Property`, `Unit`, `Client`, `Document`, `DocumentLink`, `ComplianceRecord`, `Task`

## Overlay Versus Facade

### Overlay

A second stored scoped model.

Use an overlay only when scoped truth really exists.

Examples:
- `UserCore` + `UserApp`
- `KitchenCore` + `KitchenApp`
- `PortfolioCore` + `PortfolioApp`

### Facade

A runtime, read, or console face of the same root entity.

Use a facade when a console is managing the entity but there is not yet a second stored scoped truth.

Examples for now:
- `Project`
- `App`
- `Ecosystem`
- `Module`

Do not invent stored models like `ProjectApp`, `ProjectEcosystem`, or `ProjectModule` unless real scoped stored state appears.

## Child Directories

Child directories under `models/*` are in scope for this directory.

Important rule:
- child directory names are package-local organization seams
- they are not the primary canon

The primary canon is:
- family
- storage mode
- owner
- path

Current child-dir notes:
- `profiles/` is a real and useful pattern
- `core/`, `shared/`, and `system/` are package-local organization seams, not the main cross-repo family classification
- `shared/` and `supporting/` can become vague buckets if they are not kept tight

## What Belongs Here

- canonical runtime entity models
- stored overlay models where scoped truth is real
- console facades where managed state is read-only or derived
- scoped runtime entity models owned by a console
- model-adjacent runtime types that belong with their model
- shared runtime model support like stamps or small reusable protocols

## File Comment Rule

Each real model file should state:
- family
- storage mode
- path or scope
- owner console where relevant
- why the current choice is root, overlay, facade, or scoped

Each file should point back to this README so future changes can be made in one place first.

## Aligned In Repo

- `runtime/models/` is already the normal home for FireUX runtime models
- root, overlay, facade, and scoped models already coexist in runtime delivery space
- the repo already supports `User` and `Kitchen` as root plus overlay patterns
- the repo already supports `Project`, `App`, `Ecosystem`, and `Module` as root models that may have console facades

## Not Aligned Yet

- some child directories still reflect older structure rather than the newer family model
- `shared/` and `supporting/` still need tighter boundaries
- some models still mix legacy flat stamps with newer nested stamps
- some paths are still implicit in implementation rather than clearly documented in the file header

## Roadmap To Reconciliation

1. Keep runtime models in `runtime/models/`.
2. Use this README as the decision point before changing model families or storage mode.
3. Update touched model files to explain family, storage mode, owner, and path.
4. Use overlays only when stored scoped truth is real.
5. Use facades when a console is managing a root entity without a second stored model.
6. Normalize the active shipping slice first, not the whole repo at once.

## Short Version

Runtime models belong here.

Each model should clearly say:
- what family it belongs to
- whether it is root, overlay, facade, or scoped
- who owns it
- why that decision was made
