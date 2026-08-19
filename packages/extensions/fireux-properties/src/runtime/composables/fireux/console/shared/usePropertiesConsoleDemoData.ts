import type { MaybeRefOrGetter } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useConsoleDemoData } from 'fireux-core/runtime/composables/fireux/console/useConsoleDemoData'
import type { PlaceStored } from 'fireux-places/runtime/place/models/place.model'
import {
  usePortfolioInterface,
  type PortfolioSurface,
} from '../../../../portfolio/composables/firestore/utils/view/usePortfolioInterface'
import {
  usePropertyInterface,
  type PropertySurface,
} from '../../../../property/composables/firestore/utils/view/usePropertyInterface'

export type PropertiesConsoleDemoScenario = {
  appId: string
  portfolio: PortfolioSurface | null
  properties: PropertySurface[]
  places: PlaceStored[]
}

export function usePropertiesConsoleDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  const { appId } = useFireUXConfig()
  const { surface: portfolioSurface } = usePortfolioInterface()
  const { surface: propertySurface } = usePropertyInterface()

  return useConsoleDemoData<PropertiesConsoleDemoScenario[]>({
    active,
    loader: async () => {
      const { propertiesDemoScenarios } = await import(
        '../../../../demo/properties/scenarios'
      )
      const currentAppId = String(appId || '').trim()

      return propertiesDemoScenarios
        .filter((scenario) => scenario.appId === currentAppId)
        .map((scenario) => {
          const portfolio = scenario.portfolio
            ? portfolioSurface({
                portfolio: scenario.portfolio.portfolio,
                appSupport: scenario.portfolio.appSupport,
              })
            : null
          const properties = scenario.properties.flatMap((target) => {
            const property = propertySurface({
              source: target.property,
              appSupport: target.appSupport,
            })
            return property ? [property] : []
          })
          const places = [
            ...new Map(
              scenario.properties.map((target) => [
                target.place.id,
                { ...target.place },
              ])
            ).values(),
          ]

          if (
            (scenario.portfolio && !portfolio) ||
            properties.length !== scenario.properties.length
          ) {
            throw new Error(
              `Properties Demo ${scenario.appId} failed canonical root/support composition.`
            )
          }

          return {
            appId: scenario.appId,
            portfolio,
            properties,
            places,
          }
        })
    },
    isEmpty: (value) => value.length === 0,
  })
}
