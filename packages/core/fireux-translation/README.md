# fireux-translation

Authority: Tier2 (Overview; package hierarchy canon in `docs/fireux-canon.md`)
Updated: 2026-06-12

Shared FireUX translation utilities and language catalogue.

This package owns generic translation concerns:
- available FireUX language options
- translation provider helpers
- locale/language utilities

It should not know about kitchen, recipe, dish, menu, blog, job, or product entities.

## Relationship To Sproochli

`fireux-translation` is the generic translation foundation.

`fireux-sproochli` is a product/provider layer for multilingual info pages and translation tools.
Sproochli may use translation primitives from this package, but generic language canon belongs here.
