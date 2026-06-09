Authority: fireux-properties selected Portfolio operations layer
Updated: 2026-06-10
Extends: packages/core/fireux-docs/src/runtime/concepts/console/README.md

# Portfolio Console Operations

This directory owns composables for work an operator does inside a selected Portfolio workspace.

`operations` is a code bucket, not a Firestore collection, stored entity, or public route.

Use this layer for selected-Portfolio work such as:
- identity
- documents
- tasks
- compliance
- clients
- properties
- units

Keep stored CRUD in `firestore/`.
Keep guest-facing route shaping in `public/portfolio/`.
Keep demo scenario data in `demo/portfolio/`.
