/**
 * Read-only production-planning fixtures for the Deanos Main Menu demo.
 *
 * Each production concern owns its data beneath ./production. This module
 * remains the stable public entrypoint and validates the assembled world.
 */
import { validateDeanosKitchenDemoProduction } from './production/validation'

export * from './production/deltas'
export * from './production/prep-items'
export * from './production/recipes'
export * from './production/specs'
export * from './production/types'

validateDeanosKitchenDemoProduction()
