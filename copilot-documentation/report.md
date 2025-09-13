# CoreUser ↔ AppUser Architecture Report

Date: 2025-09-13
Scope: Core identity and per-tenant membership (no blog subsystem)

## Summary

The system cleanly separates identity (CoreUser) from per-app membership (AppUser):

- CoreUser is the single source of truth for identity fields and global badges.
- AppUser is minimal, per-tenant, and stores only membership role and app-enabled profiles.
- Ensure and update flows reflect this split and are idempotent and safe.

## Models

- CoreUser (canonical identity)
  - id (uid), email, display_name?, avatar?, handle?, profiles? (global)
  - userOf[] (apps where user is a member), adminOf[] (apps where admin)
  - created_at, updated_at

- AppUser (tenant-scoped membership only)
  - id (uid)
  - role: 'user' | 'admin'
  - profiles?: string[] (subset enabled in this app)
  - created_at, updated_at

Rationale: Avoids identity duplication and drift across apps. AppUser only carries app-specific state.

## Creation flows

- useCoreUserEnsure
  - Ensures `core-users/{uid}` exists with: id, email, display_name (fallback to email), avatar (prefer existing → auth.photoURL → default upload → static fallback).
  - Uses serverTimestamp for created_at/updated_at and merges if doc exists.

- useAppUserEnsure
  - Validates appId and user; verifies `apps/{appId}` exists.
  - If `apps/{appId}/users/{uid}` exists, no-op.
  - Creates minimal AppUser doc `{ id, role }` (role derived from app.admin_ids → 'admin' | 'user').
  - Updates `core-users/{uid}.userOf += appId` via arrayUnion.

## Update flows

- useCoreUserUpdate
  - Core ref: `core-users/{uid}` (uid optional; defaults to current user).
  - safePayload: strips undefined/null/empty strings, blocks `email`, always sets `updated_at`.
  - Normalization/validation: lowercases + hyphenates `handle`; light URL check for `avatar`.
  - Membership helpers: add/remove to `userOf` and `adminOf` with serverTimestamp bump.
  - Field helpers: `setDisplayName`, `setAvatar`, `setHandle`, `setProfiles` (global badges).

- useAppUserUpdate
  - Tenant-scoped only (no identity). Exposes `setProfiles(profiles: string[])` to toggle app-enabled badges.
  - Identity edits (display_name, avatar, handle, email) are intentionally excluded—use CoreUser updater (and Auth for email).

## Consumption (at a glance)

- Identity reads (display_name/email/avatar/handle) should use CoreUser. AppUser is for role/profiles only.
- UI components that previously read identity off AppUser should be migrated to use CoreUser or a composed view model.

## Soundness check

- Single source of truth: Identity centralized in CoreUser prevents duplication and inconsistencies.
- Tenant boundary: AppUser contains only what varies per app (role, enabled profiles).
- Idempotent ensures: Safe to call on every auth; existing docs are preserved and updated.
- Safe updates: Input cleaning prevents accidental erasures and illegal `email` writes; timestamps are consistent.

## Edge cases and notes

- No auth or no appId: ensure functions early-return (safe).
- App not found: AppUser ensure logs and returns (no write).
- Avatar URL validation allows absolute and site-relative URLs; default avatar always available.

## Recommended enhancements (optional)

- Handle uniqueness: If globally unique handles are required, enforce via an index collection or Cloud Function.
- Role drift: Role is set at creation from `app.admin_ids`. If admin_ids change, decide whether to recompute at read, sync periodically, or trigger updates.
- Membership consistency: Writes to AppUser and CoreUser.userOf are separate; consider batched write/transaction if atomicity is required.
- Timestamps: Ensure the create helper always sets both created_at and updated_at for AppUser to satisfy the interface.

## Current status

- Core/App models and composables align with the architecture.
- `useCoreUserUpdate.ts` includes normalization, validation, and membership helpers (email blocked, updated_at enforced).
- `useAppUserUpdate.ts` limited to `setProfiles`—identity updates are removed.
- Some legacy references to AppUser identity/subscription are being retired; focus remains on CoreUser/AppUser only.
