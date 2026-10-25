# Nuxt entrypoints and FireUX Entity ownership

> Archived / parked on 2026-10-25. Preserved planning and evidence; this file is not the active task list. See [current FireUX priorities](../../../roadmaps/fireux-priorities.md) before resuming work.

Status: reviewed replacement draft; not published.
Target: https://fireux.app/blog/ai-friendly-nuxt-architecture-with-an-entity-spine
Preserve the existing slug, canonical URL, author and publication identity.
Source baseline: `2807ceca9`. Review date: 2026-10-01.
Meta description: How FireUX keeps Nuxt entrypoints conventional while grouping domain-owned code by Entity, with explicit registration and honest verification limits.

---

A growing Nuxt application needs two useful answers: where does the framework find code, and which part of the product owns its behavior? Those answers often overlap, but they are not the same.

In FireUX, we use an Entity ownership convention alongside Nuxt’s framework entrypoints. A Place, Kitchen or User can keep its related implementation together without becoming a separate application or acquiring every possible folder. We call this repeatable organization an Entity spine.

The useful part is a readable route from an entrypoint to an owner. The directory tree does not discover arbitrary code, enforce authorization, or prove that an application is ready to ship.

## Keep the framework boundary recognizable

In our reusable package runtimes, pages, layouts, route middleware, plugins and HTTP handlers retain conventional Nuxt roles. A package’s native layer or module configuration connects that runtime to the consuming App.

Alongside those entrypoints, FireUX keeps genuinely shared UI, reactive mechanics, contracts and helpers. Named Entity directories hold the implementation owned by that domain:

```text
runtime/
├── pages/
├── layouts/
├── middleware/
├── plugins/
├── server/
│   └── api/
├── components/
├── composables/
├── models/
├── utils/
├── place/
│   ├── components/
│   ├── composables/
│   ├── models/
│   └── server/
└── kitchen/
    ├── components/
    ├── composables/
    ├── models/
    ├── server/
    └── utils/
```

This is an illustration of ownership, not a required scaffold. An Entity includes only roles containing real responsibilities. Other legitimate framework and package roles, such as public assets, are omitted from the illustration for clarity.

`models` and the nested Entity structure are FireUX conventions. Naming a folder `place/components` does not cause Nuxt to discover it automatically. Our modules explicitly register scoped component and composable directories, while ordinary models, helpers and domain server functions are imported by their consumers. Generated component names depend on that registration, including prefixes and priorities.

Native layers and module hooks must also be read together. FireUX has adopted declarative layers in several paths, while legacy package loading still inserts runtime roots through Nuxt’s internal resolved-layer list. That remaining mechanism is migration debt, not an example of a supported public Nuxt API.

## Follow one real capability

Place detail provides a concrete example in the Place extension:

- `runtime/pages/places/[id]/index.vue` reads the route and composes the detail surface.
- `runtime/place/composables/usePlaceDetail.ts` owns the detail state and acquisition lifecycle.
- `runtime/place/components/Detail.vue` presents the Place.
- `runtime/server/api/places/[placeId].get.ts` adapts the HTTP request, validates its locator and returns the response.
- `runtime/place/server/identity/read.ts` owns the trusted Place read.
- `runtime/place/models/place.model.ts` defines the domain contract.

These are different responsibilities, not a mandatory number of files. The HTTP handler has meaningful transport work, and the domain reader has meaningful ownership. Creating an extra forwarding function with no decision or adaptation would add another stop without making that boundary clearer.

## Distinguish shared mechanics from composition

A generic lower mechanism should not need to import a particular domain to complete its job. A shared read-state helper, for example, should not depend on Kitchen policy.

Upper composition has a different role. An ecosystem page may legitimately combine Kitchen, Place and other named capabilities. A root component can be shared composition without being a lower primitive. Calling both things “shared” must not erase their dependency direction.

Across the repository, Apps compose ecosystems, extensions and Core; ecosystems compose extensions and Core; domain extensions consume lower capabilities. The owning package and actual imports establish that relationship. A folder name does not establish it on its own.

## Keep authority separate from placement

A nested `server` directory expresses an intended owner. It is not, by itself, a client/server isolation mechanism. Review executable imports, framework bundling, runtime execution and authorization separately. A type-only import from a server file has different consequences from importing executable server code into a browser path.

Likewise, an Entity root is not a promise that all of its stored information is public. Trusted commands and bounded read projections still decide what the caller may change or receive. A visually hidden control does not protect data already returned to a client.

A parent-owned record does not need a new Entity root merely because it has an ID or appears on a Workspace page. Start with its actual identity, lifecycle and authority. Reuse the parent’s ownership where that is the product truth.

## What this means for AI-assisted work

We find predictable ownership useful when navigating the repository with a coding agent. A Place task has an obvious starting point, and explicit imports help trace the capability beyond it. This is an experience-based rationale, not a measured claim that the structure reduces errors, context size or development time.

An agent still needs to inspect registration, real consumers, authority and relevant tests. Similar filenames do not prove two domains share a contract. Nor does a successful build prove that their lifecycle behavior is equivalent.

For a bounded change, we compare the nearest working sibling, preserve the domain differences that have a reason, and check the affected behavior. A move may require checking generated imports and component names, routes, server responses, SSR and live state. We use current package checks and source-owned tests; retired repository guards are not evidence of present enforcement.

## A convention with limits

The Entity spine gives FireUX a way to express ownership while retaining recognizable Nuxt entrypoints. It does not require folder symmetry, a universal Entity engine, or a complete migration before every useful product change.

Our repository still has legacy loading, overlapping routes and incomplete surfaces to resolve. We track those as specific findings with owners and verification needs. That is more useful than calling the whole repository aligned because its top-level tree looks consistent.

When applying this approach, begin at one real route or command. Find its owner, follow its dependencies, and test the behavior that matters. Keep the convention only where it makes those steps clearer.
