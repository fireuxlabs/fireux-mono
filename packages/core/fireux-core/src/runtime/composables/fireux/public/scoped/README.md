Authority: fireux-core public scoped projection helpers
Updated: 2026-06-03
Extends: packages/core/fireux-core/src/runtime/composables/fireux/public/README.md

# Public Scoped Projection Helpers

<!-- docs:public:start -->
This directory owns small helpers for public routes that render scoped records.

Use these helpers when:
- a public route first resolves a public scope
- then reads records owned by that scope
- then filters those records to public/published records
- then optionally resolves one selected record

The helpers do not read from Firestore and do not own storage. They only shape already-read refs.
<!-- docs:public:end -->

Example shape:
- public scope: Kitchen
- scoped record: Menu
- public route: `/kitchens/[slug]/menus/[menuId]`
