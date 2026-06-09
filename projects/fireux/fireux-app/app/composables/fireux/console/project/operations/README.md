Authority: fireux-app selected Project operations layer
Updated: 2026-06-10
Extends: packages/core/fireux-docs/src/runtime/concepts/console/README.md

# Project Console Operations

This directory owns composables for work an operator does inside a selected Project workspace.

`operations` is a code bucket, not a Firestore collection, stored entity, or public route.

Use this layer for selected-Project work such as:
- identity
- apps
- ecosystem links

Keep stored Project truth in `packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project`.
Keep Project console selection and management in `projects/fireux/fireux-app/app/composables/fireux/console/project`.
