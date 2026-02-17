import { stackSizzleScenario } from '../../../composables/fireux/app/runtime-kitchen/read-only-scenarios/stack-sizzle'
import { adaptLegacyScenario } from './_legacy-adapter'
import type { ReadOnlyKitchenScenario } from '../types'

export const scenarioStackSizzle: ReadOnlyKitchenScenario = adaptLegacyScenario(
  stackSizzleScenario()
)

