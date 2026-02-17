import { takumiRamenScenario } from '../../../composables/fireux/app/runtime-kitchen/read-only-scenarios/takumi-ramen'
import { adaptLegacyScenario } from './_legacy-adapter'
import type { ReadOnlyKitchenScenario } from '../types'

export const scenarioTakumiRamen: ReadOnlyKitchenScenario = adaptLegacyScenario(
  takumiRamenScenario()
)

