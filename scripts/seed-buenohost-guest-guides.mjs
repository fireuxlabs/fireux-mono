#!/usr/bin/env node
/*
  Deprecated: BuenoHost no longer seeds the old guest_guides shape.

  Use:
    node scripts/migrations/migrate-buenohost-property-shape.mjs
    node scripts/migrations/migrate-buenohost-property-shape.mjs --commit
*/

console.error(
  [
    '[seed-buenohost-guest-guides] Deprecated.',
    'BuenoHost property data now uses properties/{propertyId}.identity, properties/{propertyId}.manual, and manual_sections.',
    'Run scripts/migrations/migrate-buenohost-property-shape.mjs instead.',
  ].join('\n')
)

process.exit(1)
