import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { PlaceStored } from 'fireux-places/runtime/models/place.model'
import {
  AppPortfolioModel,
  PortfolioModel,
  type AppPortfolio,
  type Portfolio,
} from '../../models/portfolio.model'
import {
  AppPropertyModel,
  PropertyModel,
  type AppProperty,
  type Property,
} from '../../models/property.model'

const stamp: FirebaseTimestamp = { seconds: 1_720_000_000, nanoseconds: 0 }
const updated = { at: stamp, by: 'demo' }
const placeCreated = { at: stamp, by: 'demo' }

export type PortfolioDemoTarget = {
  portfolio: Portfolio
  appSupport: AppPortfolio
}

export type PropertyDemoTarget = {
  property: Property
  place: PlaceStored
  appSupport: AppProperty
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

const appSupport = <T extends AppPortfolio | AppProperty>(
  model: T,
  id: string,
  appId: string
): T => ({
  ...model,
  id,
  operator_ids: [],
  team_ids: [],
  join_requests: [],
  created: createdForApp(appId),
  updated,
})

const residentialPlace = (
  id: string,
  name: string
): PlaceStored => ({
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
  management: { mode: 'console' },
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
const alpineStayPlace = residentialPlace(
  'alpine-stay-place',
  'Alpine Stay'
)
const alpineStay: Property = {
  ...PropertyModel,
  id: 'alpine-stay',
  slug: 'alpine-stay',
  portfolio_id: '',
  place_id: alpineStayPlace.id,
  management: { mode: 'console' },
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
        management: { mode: 'console' },
        name: 'Alpine Residential Portfolio',
        tagline: 'A focused residential asset portfolio',
        slug: 'alpine-portfolio',
        owner_label: 'Demo Asset Management',
        strategy_label: 'Long-term residential',
        region_label: 'Bernese Oberland',
        notes: 'Deterministic read-only Portfolio Console data.',
        created: createdForApp(graniteAppId),
        updated,
      },
      appSupport: appSupport(
        AppPortfolioModel,
        'alpine-portfolio',
        graniteAppId
      ),
    },
    properties: [
      {
        property: alpineProperty,
        place: alpineResidencePlace,
        appSupport: appSupport(
          AppPropertyModel,
          alpineProperty.id,
          graniteAppId
        ),
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
        appSupport: appSupport(
          AppPropertyModel,
          alpineStay.id,
          buenohostAppId
        ),
      },
    ],
  },
]

const supportKeys = [
  'created',
  'id',
  'join_requests',
  'operator_ids',
  'team_ids',
  'updated',
] as const

const validateSupport = (
  scenario: PropertiesDemoScenario,
  root: Portfolio | Property,
  support: AppPortfolio | AppProperty
) => {
  const keys = Object.keys(support).sort()
  if (
    root.management.mode !== 'console' ||
    root.created.app_id !== scenario.appId ||
    support.id !== root.id ||
    support.created.app_id !== scenario.appId ||
    keys.length !== supportKeys.length ||
    keys.some((key, index) => key !== supportKeys[index]) ||
    !Array.isArray(support.operator_ids) ||
    !Array.isArray(support.team_ids) ||
    !Array.isArray(support.join_requests)
  ) {
    throw new Error(
      `Properties Demo ${scenario.appId}/${root.id} requires one same-App root and access-only support pair.`
    )
  }
}

for (const scenario of propertiesDemoScenarios) {
  if (!scenario.appId || !scenario.properties.length) {
    throw new Error('Every Properties Demo scenario requires an App and Property.')
  }

  const portfolioId = scenario.portfolio?.portfolio.id ?? ''
  if (scenario.portfolio) {
    validateSupport(
      scenario,
      scenario.portfolio.portfolio,
      scenario.portfolio.appSupport
    )
  }

  const propertyIds = new Set<string>()
  for (const target of scenario.properties) {
    validateSupport(scenario, target.property, target.appSupport)
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

export const portfolioDemoRecords = propertiesDemoScenarios.flatMap(
  (value) => value.portfolio ? [value.portfolio.portfolio] : []
)
export const propertyDemoRecords = propertiesDemoScenarios.flatMap(
  (value) => value.properties.map((target) => target.property)
)
