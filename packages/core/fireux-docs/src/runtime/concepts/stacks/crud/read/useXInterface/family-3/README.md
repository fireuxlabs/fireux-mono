---
title: useXInterface Family 3
description: The rich projection mapper family for useXInterface.
---

# useXInterface Family 3

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `useXInterface` rich projection mapper family.

## What This Family Is

Family 3 is the rich projection mapper.

It exposes one base `interface`, but some of the display seams are genuinely different projections.

That means:

- `pill` may be a real pill projection
- `cell` may be a real cell projection
- `preview` may be a richer summary projection
- `profile` may be a richer detail projection

## When To Use It

Use this family when:

- the entity genuinely has more than one stable display projection
- a single shared card shape would hide important meaning
- the seam still needs to stay one `useXInterface` contract

## Typical Entities

Current examples include families such as:

- `Place`
- `Company`
- `Kitchen`
- `Ingredient`
- `Dish`
- `Menu`
- `Mise`

## Core Rule

Richness is allowed here, but the top-level API still stays the same:

- `interface`
- `pill`
- `cell`
- `preview`
- `profile`

## Short Version

Family 3 is one interface seam with genuinely different stable display projections.
