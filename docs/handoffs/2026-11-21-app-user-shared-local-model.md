# FireUX Core reset: opinionated AppUser with local extension

**Status:** Agreed design direction for review before implementation, not an execution approval.
**Date:** 2026-11-21
**Scope:** Core AppUser and app-specific AppUser contracts. Workspace and other domains remain parked.

## Agreed boundaries

- **Firebase Auth** authenticates one person across the ecosystem with the same account credentials wherever that identity provider and Firebase project are shared.
- **Core User** owns canonical identity, separate from app membership and owner-only account data.
- **Core AppUser** provides an opinionated, reusable membership contract across apps, including the shared `free`, `pro`, `business` subscription tiers, shared roles and creation/update stamps. A membership refers to the canonical User and its App, without duplicating identity.
- **Local AppUser** is defined and extended by each application for its own membership settings and fields (for example onboarding or preferences). App-specific domain records, such as Chef history and qualifications, stay in their proper domain.
- **Workspace membership** is a separate relationship used for access to a particular business; workspace roles must not be conflated with global identity, AppUser subscription or app-level permissions.

## Composition rule

Prefer **one AppUser membership record** whose TypeScript contract composes Core's shared fields with the local app's extension. Do not create a second stored AppUser identity or document solely to mirror the type split. Split persistence only when there is an actual privacy, lifecycle or query requirement, with an explicit migration rationale.

Core defines stable defaults; each app owns and validates its local extension. `subscription` is a commercial tier, **not** an automatic authorization role.

## Current implementation to review

- `packages/core/fireux-core/src/runtime/user/models/user.model.ts`: canonical User with id, handle, display_name, bio and avatar; stored document adds stamps.
- `packages/core/fireux-core/src/runtime/user/models/user-account.model.ts`: separate private account.
- `packages/core/fireux-core/src/runtime/app/app-user/models/model.ts`: shared role (`user`, `admin`, `dev`), subscription (`free`, `pro`, `business`), and stamps. Review how the canonical User/App relationship is represented by existing document paths and operations before changing the shape.
- `packages/core/fireux-core/src/runtime/app/app-user/types.ts`: presentation types and path-owned IDs.

## Acceptance for future implementation

1. Core User remains canonical; joining a second app neither duplicates nor unnecessarily mutates it.
2. Each app can add local AppUser fields without changing another application's shared contract.
3. Shared subscription tiers remain consistent, independently from roles or workspace permission.
4. Existing memberships are preserved or explicitly migrated with tested backwards compatibility.
5. Cross-app sign-in uses the same canonical User while creating distinct app memberships.
6. Named-database and restrictive-rule safety checks are resolved before relying on production behavior.

## Next action

Inspect AppUser consumers and persistence/storage contracts, propose the smallest compatible TypeScript composition, and regression-test it. **Do not automatically implement, modify Firebase rules, deploy, or arm Walking Bridge based on this note.** Keep the Firestore security acceptance gate separate.
