# La Tapberne Photo Menu Source Review

Generated: 2026-06-09

## Inputs

- `/Users/danielwatson/Downloads/IMG_9006 2.HEIC`
- `/Users/danielwatson/Downloads/IMG_9007 2.HEIC`
- `/Users/danielwatson/Downloads/IMG_9008 3.HEIC`
- `/Users/danielwatson/Downloads/IMG_9009 2.HEIC`
- `/Users/danielwatson/Downloads/IMG_9010 2.HEIC`
- `/Users/danielwatson/Downloads/IMG_9011 2.HEIC`

Working JPEGs:

- `temp/la-tapberne-photo-menu/IMG_9006.jpg`
- `temp/la-tapberne-photo-menu/IMG_9007.jpg`
- `temp/la-tapberne-photo-menu/IMG_9008.jpg`
- `temp/la-tapberne-photo-menu/IMG_9009.jpg`
- `temp/la-tapberne-photo-menu/IMG_9010.jpg`
- `temp/la-tapberne-photo-menu/IMG_9011.jpg`

## Current Structured Menu

- Path checked: `apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/main`
- Canonical default path after alignment: `apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/default`
- Sections: 8
- Live items: 33
- Source seed: `scripts/seed-la-tapberne-public-menus.mjs`
- Tenant static source: `projects/misebox/la-tap-berne/app/menu.ts`

## Photo Source Findings

The photos confirm the current menu is broadly correct, but two source-level differences were found:

1. `Tabla Ibérica` exists in the paper menu but was missing from the structured menu.
   - Section: `Ein bisschen Meer`
   - Source text: `Iberische kalte Platte mit Serrano, Lomo, Chorizo, Salchichón und Manchego Käse.`
   - Price: `25`

2. `Tortilla de Patata` had its size prices in the description, but the structured menu item price was empty/zero in live data.
   - Source text: `Die spanische Kartoffel-Omelette. Ø24cm. Klein 9.50, mittel 16.-, gross 25.-`
   - Base price: `9.50`

## Source Patch Applied First

Patched source files only. No Firestore writes were made.

- Added `tabla-iberica` to `scripts/seed-la-tapberne-public-menus.mjs`
- Added base price `9.5` to `tortilla-de-patata` in `scripts/seed-la-tapberne-public-menus.mjs`
- Added `Tabla Ibérica` to `projects/misebox/la-tap-berne/app/menu.ts`

## Live Migration Applied

Applied to:

- `apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/dishes/tabla-iberica`
- `apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/default/sections/ein-bisschen-meer/items/ein-bisschen-meer-00`
- `apps/la-tap-berne/kitchens/ChIJ08WSgYSjj0cRD6oE3RwUFk0/menus/default/sections/las-tapas/items/las-tapas-03`

Verification:

- `menus/default` is now the published source-ingestion menu.
- `menus/main` was archived to avoid duplicate public menus.
- `Tabla Ibérica` is now the first item in `Ein bisschen Meer`, price `25`.
- `Tortilla de Patata` now has item price `9.5`.

## Still Needed

- Decide whether the one-price menu model should show `9.50` for Tortilla or support explicit variants.
