---
title: useXInterface Family 2
description: The joined mapper family for useXInterface.
---

# useXInterface Family 2

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `useXInterface` joined mapper family.

## What This Family Is

Family 2 is the joined mapper.

It still returns one main interface shape, but it first resolves or combines more than one source.

Typical examples:

- base record plus linked identity context
- base record plus operator or profile context

## When To Use It

Use this family when:

- the UI shape is still basically one main card shape
- but the seam needs joined or enriched read data first
- the seam should stay one interface family rather than becoming a rich projection family

## Typical Entities

Current examples include families such as:

- `Chef`
- `Agent`
- `Professional`
- `Supplier`

## Core Rule

Joining is allowed here, but the output should still behave like one main interface shape.

If the entity needs truly different `pill`, `cell`, `preview`, or `profile` projections, it should move to Family 3 instead.

## Short Version

Family 2 is one main UI shape built from more than one read source.
