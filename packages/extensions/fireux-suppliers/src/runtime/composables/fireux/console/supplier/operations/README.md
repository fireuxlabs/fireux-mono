Authority: fireux-suppliers selected Supplier operations layer
Updated: 2026-06-10
Extends: packages/core/fireux-docs/src/runtime/concepts/console/README.md

# Supplier Console Operations

This directory owns composables for work an operator does inside a selected Supplier workspace.

`operations` is a code bucket, not a Firestore collection, stored entity, or public route.

Use this layer for selected-Supplier work such as:
- identity
- items
- catalogues
- ingredients

Keep stored CRUD in `firestore/`.
Keep guest-facing route shaping in `public/supplier/`.
Keep demo scenario data in `demo/supplier/`.
