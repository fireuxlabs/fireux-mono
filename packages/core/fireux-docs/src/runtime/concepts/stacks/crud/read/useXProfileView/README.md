---
title: useXProfileView
description: Early FireUX guidance for the useXProfileView seam when a profile surface needs a richer view model than useXInterface should carry.
---

# useXProfileView

Authority: Operational
Updated: 2026-04-20
Scope: early FireUX guidance for stack-specific profile view-model seams.

This page documents the early `useXProfileView` seam.

It is not yet fully frozen canon.
Use `packages/core/fireux-docs/src/runtime/concepts/stacks/crud/read/README.md`
for overall read canon.
Use `packages/core/fireux-docs/src/runtime/concepts/stacks/crud/read/useXInterface/README.md`
for the base read-to-UI seam.

## What This Seam Is

`useXProfileView` is a second-layer read seam for profile surfaces.

Its job is:

- take already-fetched entity truth
- take the thin base interface card when useful
- build one richer profile view model for `Profile.vue`

This seam exists because `useXInterface` is being pushed toward the boring thin
projector role across the repo.

If a profile card genuinely needs more than the stable base interface shape,
that extra shaping should happen here instead of back inside `useXInterface`.

## Current Repo Examples

Current repo examples include:

- `useAppProfileView`
- `useProfessionalProfileView`
- `useKitchenProfileView`

These examples should be treated as the current working direction, not as proof
that every detail of the seam is already final canon.

## Core Rule

Use `useXProfileView` only when a profile surface needs a richer dedicated model
than the thin `useXInterface().profile()` result should carry.

If the profile surface can render directly from the thin interface card, do not
add `useXProfileView`.

So the intended stack is:

- `useXFetch` or `useXCollection`
- `useXInterface`
- optional `useXProfileView`
- `Profile.vue`

## Shared Contract

A good `useXProfileView` seam should:

- stay read-only
- accept already-fetched truth
- avoid owning route logic, selection logic, or mutation logic
- expose one stable profile view model
- keep `Profile.vue` render-only

It may:

- compose the thin interface card
- add derived display fields needed only by the profile surface
- perform clearly profile-scoped linked-read shaping when that work has already
  been accepted as part of the profile seam

## What Does Not Belong Here

This seam should not become:

- a replacement for `useXInterface`
- a generic fetch seam
- a collection seam
- a console selection seam
- a mutation seam
- an excuse to make every entity grow a profile view model whether it needs one
  or not

## When To Reach For It

Reach for `useXProfileView` when all of these are true:

- the entity already has a thin base interface seam
- a profile card needs more than that thin shape
- the extra fields are specific to the profile surface
- pushing those fields back into `useXInterface` would make the base seam less
  boring

## Short Version

`useXProfileView` is the current FireUX second-layer seam for richer profile
view models.

Use it only when a profile surface genuinely needs more than the thin
`useXInterface` contract should carry.
