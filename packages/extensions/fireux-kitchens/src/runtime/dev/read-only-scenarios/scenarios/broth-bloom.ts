import { brothBloomScenario } from '../../../composables/fireux/app/runtime-kitchen/read-only-scenarios/broth-bloom'
import { adaptLegacyScenario } from './_legacy-adapter'
import type { ReadOnlyKitchenScenario } from '../types'

export const scenarioBrothBloom: ReadOnlyKitchenScenario = adaptLegacyScenario(
  brothBloomScenario()
)

