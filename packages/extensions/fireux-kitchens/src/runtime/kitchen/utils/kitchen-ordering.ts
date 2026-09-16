import type {
  KitchenOrderingConfig,
  KitchenOrderingService,
} from '../models/ordering.model'
import { readKitchenOrderTypeConfig } from './ordering-policy'

export function readKitchenOrdering(value: unknown): KitchenOrderingConfig {
  const services = (value as KitchenOrderingConfig | undefined)?.services
  if (!Array.isArray(services)) return { services: [] }
  const seen = new Set<string>()
  return {
    services: services.flatMap((service): KitchenOrderingService[] => {
      const policy = readKitchenOrderTypeConfig(service)
      if (!policy || seen.has(policy.type)) return []
      seen.add(policy.type)
      return [
        {
          ...policy,
          enabled: service.enabled === true,
          menu_ids: Array.isArray(service.menu_ids)
            ? [
                ...new Set(
                  service.menu_ids.filter(
                    (id) => typeof id === 'string' && id && !id.includes('/')
                  )
                ),
              ]
            : [],
        },
      ]
    }),
  }
}
