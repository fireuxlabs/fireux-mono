import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { PortfolioModel, type Portfolio } from '../../models/portfolio.model'
import { PropertyModel, type Property } from '../../models/property.model'

const stamp: FirebaseTimestamp = { seconds: 1_720_000_000, nanoseconds: 0 }
const created = { at: stamp, by: 'demo', app_id: 'granite-app' }
const updated = { at: stamp, by: 'demo' }

export type PropertiesDemoScenario = {
  appId: string
  portfolio: Portfolio
  properties: Property[]
}

const alpineProperty: Property = {
  ...PropertyModel,
  id: 'alpine-residence',
  slug: 'alpine-residence',
  portfolio_id: 'alpine-portfolio',
  place_id: 'interlaken',
  app_scope_state: 'parent_app',
  app_scope_app_id: 'granite-app',
  identity: {
    name: 'Alpine Residence',
    image_url: '',
    property_type: 'residential',
    unit_count: 12,
    estimated_value: 4_800_000,
    estimated_value_currency: 'CHF',
  },
  status: 'active',
  publication_state: 'draft',
  created,
  updated,
}

export const propertiesDemoScenarios: PropertiesDemoScenario[] = [
  {
    appId: 'granite-app',
    portfolio: {
      ...PortfolioModel,
      id: 'alpine-portfolio',
      app_scope_state: 'parent_app',
      app_scope_app_id: 'granite-app',
      name: 'Alpine Residential Portfolio',
      tagline: 'A focused residential asset portfolio',
      slug: 'alpine-portfolio',
      owner_label: 'Demo Asset Management',
      strategy_label: 'Long-term residential',
      region_label: 'Bernese Oberland',
      notes: 'Deterministic read-only Portfolio Console data.',
      created,
      updated,
    },
    properties: [alpineProperty],
  },
]

export const portfolioDemoRecords = propertiesDemoScenarios.map(
  (value) => value.portfolio
)
export const propertyDemoRecords = propertiesDemoScenarios.flatMap(
  (value) => value.properties
)
