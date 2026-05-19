# Dashboard Canon

Authority: Operational
Updated: 2026-05-15
Scope: FireUX runtime dashboard meaning, profile extension routes, and dashboard/console separation.

This note is the shared dashboard canon for FireUX runtime apps.

## Decision

`dashboard` is the authenticated personal area for a user and that user's profile extensions.

`console` is the selected workspace/entity area for operating something larger than the user.

Do not create a console family just because a user has a profile type.

## Current Supported Profile Identities

The current dashboard identity set is:

- `user` through the main user profile
- `professional`
- `chef`
- `agent`

Canonical profile routes:

```text
/dashboard
/dashboard/user-profile
/dashboard/professional/profile
/dashboard/chef/profile
/dashboard/agent/profile
```

Extension packages may also provide helper dashboard routes under the same profile branch, such as `my-jobs`, `my-recipes`, or profile overview pages.
Those helper routes do not make the profile a console family.

## Dashboard Selector

The top-left dashboard selector is profile-aware.

It is driven by dashboard nav items with:

```ts
group: 'profiles'
profileId: 'professional' | 'chef' | 'agent'
```

The selector should only show profile identities that the current user actually has.
The current source is:

```text
users/{uid}.profiles
```

Profile create/ensure flows must tag the user with the matching profile id.

For example:

```text
professional create -> users/{uid}.profiles includes "professional"
chef create         -> users/{uid}.profiles includes "chef"
agent create        -> users/{uid}.profiles includes "agent"
```

Profile identities that are available but not created yet should not appear as
active dashboard identities. They may be offered from the user's Profile page or
from a contextual workflow that explains why the profile is useful.

Examples:

```text
Chef profile     -> optional public chef/authorship profile, not kitchen access
Professional     -> optional career/provider profile, not a workspace
Agent            -> optional hiring/agent identity, not a console
```

App config controls profile consumption:

```ts
profiles: ['chef']
publicProfiles: ['chef']
```

`profiles` enables dashboard profile creation/management. `publicProfiles`
enables public directories and detail pages such as `/chefs` and `/chefs/[id]`.
Installing a module alone should not make every profile page part of a tenant
app.

An app with only one profile extension, such as Find My SEO today, may show only `Professional`.
An app with several profile extensions, such as Misebox, may show several options.

## Dashboard Is Not Console

Use dashboard when the user manages themselves:

- account profile
- professional profile
- chef profile
- agent profile
- applications, saved work, or personal availability

Use console when the user manages a workspace/entity:

- kitchen
- supplier
- portfolio
- project
- property

Examples:

```text
Professional = profile identity -> /dashboard/professional/profile
Chef         = profile identity -> /dashboard/chef/profile
Agent        = profile identity -> /dashboard/agent/profile

Kitchen      = managed workspace -> /console/kitchen
Portfolio    = managed workspace -> /console/portfolio
Supplier     = managed workspace -> /console/supplier
Project      = managed workspace -> /console/project
```

## App Composition

Apps should enable the package that owns the profile extension when they need the dashboard surface.

Examples:

- Find My SEO may enable the shared professional profile dashboard from `fireux-jobs`
- Misebox may enable professional, chef, and agent profile dashboard surfaces
- BuenoHost and Sproochli should not enable professional dashboard surfaces unless they need that profile identity

If an app needs public provider discovery, use public collection routes such as:

```text
/professionals
/professionals/[slug]
```

If an app later needs operational workspaces, add or reuse a console family for the operated entity.
Do not turn `Professional` itself into a workspace by default.

## Naming Rule

Dashboard profile branches use the singular profile identity:

```text
/dashboard/professional/profile
/dashboard/chef/profile
/dashboard/agent/profile
```

Public collection routes may be plural:

```text
/professionals
/chefs
/agents
```

Console family keys are reserved for operated workspace/entity families.
