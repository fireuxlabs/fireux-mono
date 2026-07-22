import type { MaybeRefOrGetter } from 'vue'
import { useConsoleDemoData } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDemoData'
import type { Portfolio } from '../../../../models/portfolio.model'
import type { Property } from '../../../../models/property.model'

export type PropertiesConsoleDemoScenario = {
  appId: string
  portfolio: Portfolio
  properties: Property[]
}

export function usePropertiesConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  return useConsoleDemoData<PropertiesConsoleDemoScenario[]>({
    active,
    loader: async () => {
      const { propertiesDemoScenarios } = await import(
        '../../../../demo/properties/scenarios'
      )
      return propertiesDemoScenarios.map((scenario) => ({
        ...scenario,
        portfolio: { ...scenario.portfolio },
        properties: scenario.properties.map((property) => ({ ...property })),
      }))
    },
    isEmpty: (value) => value.length === 0,
  })
}
