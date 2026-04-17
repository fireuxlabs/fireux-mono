---
title: useXInterface Family 1
description: The single-shape mapper family for useXInterface.
---

# useXInterface Family 1

Authority: Operational
Updated: 2026-04-18
Scope: FireUX `useXInterface` single-shape mapper family.

## What This Family Is

Family 1 is the single-shape mapper.

It maps one input target into one stable base interface object.

Usually:

- `interface` returns that shape
- `pill` returns that shape
- `cell` returns that shape
- `preview` returns that shape
- `profile` returns that shape

Components then choose which fields to render.

## When To Use It

Use this family when:

- one stable UI shape is enough
- the entity does not need genuinely different projections
- the seam should stay thin and predictable

## Typical Entities

Current examples include families such as:

- `App`
- `User`
- `BlogPost`
- `Product`
- `Job`
- `Portfolio`

## Core Rule

This is the default `useXInterface` family unless a richer projection is clearly needed.

## Short Version

Family 1 is one input shape to one main UI shape.
