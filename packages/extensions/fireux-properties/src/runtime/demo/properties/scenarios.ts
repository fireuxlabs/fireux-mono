import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { PlaceStored } from 'fireux-places/runtime/place/models/place.model'
import {
  PortfolioModel,
  type Portfolio,
} from '../../portfolio/models/portfolio.model.ts'
import {
  PropertyModel,
  type Property,
} from '../../property/models/property.model.ts'

const stamp: FirebaseTimestamp = { seconds: 1_720_000_000, nanoseconds: 0 }
const updated = { at: stamp, by: 'demo' }
const placeCreated = { at: stamp, by: 'demo' }

export type PortfolioDemoTarget = {
  portfolio: Portfolio
}

export type PropertyDemoTarget = {
  property: Property
  place: PlaceStored
}

export type PropertiesDemoScenario = {
  appId: string
  portfolio: PortfolioDemoTarget | null
  properties: PropertyDemoTarget[]
}

const createdForApp = (appId: string) => ({
  at: stamp,
  by: 'demo',
  app_id: appId,
})

const residentialPlace = (id: string, name: string): PlaceStored => ({
  id,
  name,
  short_name: name,
  place_type: 'physical',
  source: 'manual',
  formatted_address: 'Interlaken, Switzerland',
  short_address: 'Interlaken',
  address: {
    street: '',
    city: 'Interlaken',
    region: 'Bern',
    postal_code: '3800',
    country_code: 'CH',
  },
  timezone: 'Europe/Zurich',
  default_currency_code: 'CHF',
  types: ['residential'],
  tags: ['demo', 'residential-location'],
  slug: id,
  created: placeCreated,
  updated,
})

const graniteAppId = 'granite-app'
const alpineResidencePlace = residentialPlace(
  'alpine-residence-place',
  'Alpine Residence'
)
const alpineProperty: Property = {
  ...PropertyModel,
  id: 'alpine-residence',
  slug: 'alpine-residence',
  portfolio_id: 'alpine-portfolio',
  place_id: alpineResidencePlace.id,
  management: { mode: 'workspace' },
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
  created: createdForApp(graniteAppId),
  updated,
}

const buenohostAppId = 'buenohost'
const alpineStayPlace = residentialPlace('alpine-stay-place', 'Alpine Stay')
const alpineStay: Property = {
  ...PropertyModel,
  id: 'alpine-stay',
  slug: 'alpine-stay',
  portfolio_id: '',
  place_id: alpineStayPlace.id,
  management: { mode: 'workspace' },
  identity: {
    name: 'Alpine Stay',
    image_url: '',
    property_type: 'residential',
    unit_count: 1,
    estimated_value: 960_000,
    estimated_value_currency: 'CHF',
  },
  status: 'active',
  publication_state: 'draft',
  created: createdForApp(buenohostAppId),
  updated,
}

export const propertiesDemoScenarios: PropertiesDemoScenario[] = [
  {
    appId: graniteAppId,
    portfolio: {
      portfolio: {
        ...PortfolioModel,
        id: 'alpine-portfolio',
        management: { mode: 'workspace' },
        name: 'Alpine Residential Portfolio',
        tagline: 'A focused residential asset portfolio',
        slug: 'alpine-portfolio',
        owner_label: 'Demo Asset Management',
        strategy_label: 'Long-term residential',
        region_label: 'Bernese Oberland',
        notes: 'Deterministic read-only Portfolio Workspace data.',
        created: createdForApp(graniteAppId),
        updated,
      },
    },
    properties: [
      {
        property: alpineProperty,
        place: alpineResidencePlace,
      },
    ],
  },
  {
    appId: buenohostAppId,
    portfolio: null,
    properties: [
      {
        property: alpineStay,
        place: alpineStayPlace,
      },
    ],
  },
]

const validateRoot = (
  scenario: PropertiesDemoScenario,
  root: Portfolio | Property
) => {
  if (
    root.management.mode !== 'workspace' ||
    root.created.app_id !== scenario.appId
  ) {
    throw new Error(
      `Properties Demo ${scenario.appId}/${root.id} requires one canonical root.`
    )
  }
}

for (const scenario of propertiesDemoScenarios) {
  if (!scenario.appId || !scenario.properties.length) {
    throw new Error(
      'Every Properties Demo scenario requires an App and Property.'
    )
  }

  const portfolioId = scenario.portfolio?.portfolio.id ?? ''
  if (scenario.portfolio) {
    validateRoot(scenario, scenario.portfolio.portfolio)
  }

  const propertyIds = new Set<string>()
  for (const target of scenario.properties) {
    validateRoot(scenario, target.property)
    if (
      !target.property.place_id ||
      target.place.id !== target.property.place_id ||
      target.place.place_type !== 'physical' ||
      target.place.source !== 'manual' ||
      'entity_families' in target.place ||
      (target.property.portfolio_id &&
        target.property.portfolio_id !== portfolioId) ||
      (!scenario.portfolio && target.property.portfolio_id) ||
      propertyIds.has(target.property.id)
    ) {
      throw new Error(
        `Properties Demo ${scenario.appId}/${target.property.id} has an invalid parent relationship.`
      )
    }
    propertyIds.add(target.property.id)
  }
}

export const portfolioDemoRecords = propertiesDemoScenarios.flatMap((value) =>
  value.portfolio ? [value.portfolio.portfolio] : []
)
export const propertyDemoRecords = propertiesDemoScenarios.flatMap((value) =>
  value.properties.map((target) => target.property)
)
