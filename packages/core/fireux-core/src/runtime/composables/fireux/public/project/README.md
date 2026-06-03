Authority: fireux-core public project layer
Updated: 2026-06-03
Extends: packages/core/fireux-core/src/runtime/composables/fireux/public/README.md

# Project Public Layer

This directory is reserved for guest-facing Project route helpers.

Project stored truth lives under `firestore/core/project`. The selected Project console runtime currently lives in `projects/fireux/fireux-app/app/composables/fireux/console/project` because Project is managed through the FireUX app console.

Add public Project helpers here when `/projects/**` needs route-specific view or SEO shaping that does not belong in the stored Firestore stack.
