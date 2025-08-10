# FIReUX Structure Guide
Last updated: 2025-08-10

## Monorepo layout
- packages/* — domain Nuxt modules (core, jobs, misebox, places)
- projects/* — runnable apps composed from packages

## Development
- pnpm dev:fireux / dev:cleanbox / dev:misebox
- pnpm build:packages
- ./deploy-all.sh

## Dependency flow
- packages export composables/components
- projects import modules and compose features

See ../CONTEXT.md for principles and the Task Routing Matrix.
