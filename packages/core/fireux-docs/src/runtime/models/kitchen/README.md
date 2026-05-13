---
title: Kitchen
description: Kitchen model canon for public identity, app overlay, and authority boundaries.
---

Authority: Operational
Updated: 2026-05-13

`Kitchen` belongs in the runtime `models` spine.

It is a root public entity with an app-hosted console overlay.

This is not the same thing as:

- the kitchen console overlay
- `Chef`
- kitchen-owned operational child records

## Current Kitchen Canon

Rule of thumb:

- root public kitchen = `kitchens/<kitchenId>`
- app-hosted kitchen console = `apps/<appId>/kitchens/<kitchenId>`
- root public kitchen owns public kitchen identity
- app overlay owns console/runtime operation state

Kitchen authority rule:

- kitchen console access comes from the app overlay
- canonical authority field is overlay `team_ids`
- `Chef` linkage or workplace/profile history is relationship only
- relationship does not grant console access

Kitchen identity rule:

- live kitchen identity is place-backed
- stored Kitchen identity remains `kitchens/<kitchenId>`
- public kitchen URL identity is `kitchen.slug`
- missing slug means the kitchen is not public-ready

## Model Boundaries

`Kitchen` should stay clearly separated from:

- root public child records such as menus and dishes
- app-scoped operational children such as ingredients, recipes, mise, orders, team, stations, or supplier records
- profile extensions such as `Chef`

Public menu publishing rule:

- menus and dishes live as root public children under `kitchens/<kitchenId>`
- public menu and dish copy is translated directly from menu/dish text
- public menu delivery must not depend on private working `mise`

## Short Version

`Kitchen` is a root public entity plus an app-hosted console overlay.

The root kitchen owns identity.
The app overlay owns console operation and authority.
