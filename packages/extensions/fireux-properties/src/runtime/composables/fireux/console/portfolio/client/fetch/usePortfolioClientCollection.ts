import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../../../app/portfolio-console/useActivePortfolio'
import type { Client } from '../../../../../../models/client.model'
import type {
  DemoLease,
  DemoPortfolioScenario,
} from '../../../../app/portfolio-console/demo-scenarios'

const clientAvatarPlaceholder = (seed: string) =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(`fireux-client-${seed || 'placeholder'}`)}`

const safeString = (value: unknown) => String(value ?? '').trim()
const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

const uniqueStrings = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => safeString(value)).filter(Boolean)))

type DemoClientSeed = {
  slug: string
  legal_name: string
  trading_name: string
  entity_type: NonNullable<Client['entity_type']>
  jurisdiction: string
  website_url: string
}

const DEMO_CLIENT_SEEDS: DemoClientSeed[] = [
  {
    slug: 'rivergate-holdings',
    legal_name: 'Rivergate Holdings Ltd',
    trading_name: 'Rivergate',
    entity_type: 'conglomerate',
    jurisdiction: 'United Kingdom',
    website_url: 'https://example.com/rivergate-holdings',
  },
  {
    slug: 'alpine-property-group',
    legal_name: 'Alpine Property Group AG',
    trading_name: 'Alpine Property Group',
    entity_type: 'company',
    jurisdiction: 'Switzerland',
    website_url: 'https://example.com/alpine-property-group',
  },
  {
    slug: 'cedar-family-office',
    legal_name: 'Cedar Family Office',
    trading_name: 'Cedar Family Office',
    entity_type: 'family_office',
    jurisdiction: 'United Kingdom',
    website_url: 'https://example.com/cedar-family-office',
  },
  {
    slug: 'northshore-income-fund',
    legal_name: 'Northshore Income Fund',
    trading_name: 'Northshore Fund',
    entity_type: 'fund',
    jurisdiction: 'Jersey',
    website_url: 'https://example.com/northshore-income-fund',
  },
  {
    slug: 'stadt-bern-immobilien',
    legal_name: 'Stadt Bern Immobilien',
    trading_name: 'Stadt Bern Immobilien',
    entity_type: 'public_body',
    jurisdiction: 'Switzerland',
    website_url: 'https://example.com/stadt-bern-immobilien',
  },
]

const hashString = (value: string) => {
  let hash = 0
  const input = safeString(value)
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const pickDemoClientSeeds = (scenarioId: string, count: number) => {
  const pool = DEMO_CLIENT_SEEDS
  const requested = Math.max(1, Math.min(count, pool.length))
  const start = hashString(scenarioId) % pool.length
  return Array.from({ length: requested }).map(
    (_, offset) => pool[(start + offset) % pool.length] as DemoClientSeed
  )
}

const normalizeStatus = (value: unknown): Client['status'] => {
  const status = safeString(value).toLowerCase()
  if (status === 'active') return 'active'
  if (status === 'ending') return 'ending'
  if (status === 'arrears') return 'arrears'
  if (status === 'prospect') return 'prospect'
  return 'active'
}

const normalizeRisk = (
  value: unknown,
  status: Client['status']
): Client['risk_level'] => {
  const risk = safeString(value).toLowerCase()
  if (risk === 'low') return 'low'
  if (risk === 'medium') return 'medium'
  if (risk === 'high') return 'high'
  if (status === 'arrears') return 'high'
  if (status === 'ending') return 'medium'
  return 'low'
}

const normalizeClient = (value: Partial<Client>): Client => {
  const id = safeString(value.id)
  const status = normalizeStatus(value.status)
  const displayName =
    safeString(value.display_name) ||
    safeString(value.legal_name) ||
    id ||
    'Unknown client'
  const portfolioId = safeString(value.portfolio_id)
  const propertyId = safeString(value.property_id)
  const unitId = safeString(value.unit_id)
  const leaseId = safeString(value.lease_id)

  const portfolioIds = uniqueStrings([
    ...(isArray(value.portfolio_ids) ? value.portfolio_ids : []),
    portfolioId,
  ])
  const propertyIds = uniqueStrings([
    ...(isArray(value.property_ids) ? value.property_ids : []),
    propertyId,
  ])
  const unitIds = uniqueStrings([
    ...(isArray(value.unit_ids) ? value.unit_ids : []),
    unitId,
  ])

  return {
    id:
      id ||
      `client-${
        safeString(displayName)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-') || 'unknown'
      }`,
    portfolio_id: portfolioId,
    portfolio_ids: portfolioIds,
    property_id: propertyId,
    property_ids: propertyIds,
    property_label: safeString(value.property_label) || 'Unknown property',
    unit_id: unitId,
    unit_ids: unitIds,
    lease_id: leaseId,
    lease_end_date: safeString(value.lease_end_date),

    display_name: displayName,
    legal_name: safeString(value.legal_name) || displayName,
    trading_name: safeString(value.trading_name),
    entity_kind: value.entity_kind || 'organization',
    entity_type: value.entity_type || 'company',
    parent_client_id: safeString(value.parent_client_id),
    ultimate_parent_name: safeString(value.ultimate_parent_name),
    registration_number: safeString(value.registration_number),
    tax_id: safeString(value.tax_id),
    jurisdiction: safeString(value.jurisdiction),

    status,
    relationship_status:
      value.relationship_status ||
      (status === 'prospect' ? 'prospect' : 'active'),
    relationship_since: safeString(value.relationship_since),
    risk_level: normalizeRisk(value.risk_level, status),
    risk_notes: safeString(value.risk_notes),
    monthly_rent: Number(value.monthly_rent || 0),
    currency: safeString(value.currency || 'GBP').toUpperCase() || 'GBP',

    avatar_url:
      safeString(value.avatar_url) ||
      safeString(value.logo_url) ||
      clientAvatarPlaceholder(id || displayName),
    logo_url: safeString(value.logo_url),
    email: safeString(value.email),
    phone: safeString(value.phone),
    website_url: safeString(value.website_url),

    contacts: isArray(value.contacts)
      ? (value.contacts as Client['contacts'])
      : [],
    account_owner_user_id: safeString(value.account_owner_user_id),
    notes: safeString(value.notes),
    tags: isArray(value.tags) ? uniqueStrings(value.tags) : [],
    created: value.created ?? {
      at: {} as any,
      by: undefined,
      app_id: undefined,
    },
    updated: value.updated ?? { at: {} as any, by: undefined },
  }
}

const buildDemoClients = (scenario: DemoPortfolioScenario): Client[] => {
  const portfolioId = safeString(scenario.id)
  const portfolioName = safeString(scenario.portfolio?.name) || portfolioId
  const properties = scenario.properties ?? []
  const units = scenario.units ?? []
  const tenants = scenario.tenants ?? []
  const leases = scenario.leases ?? []
  const currency =
    safeString(scenario.financials?.currency) ||
    safeString(scenario.transactions?.[0]?.currency) ||
    'GBP'

  if (!portfolioId || properties.length === 0) {
    const fallbackName =
      safeString(scenario.portfolio?.owner_label) || 'Portfolio Owner'
    const slug =
      safeString(fallbackName)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') || 'portfolio-owner'
    return [
      normalizeClient({
        id: `client-${portfolioId || 'unknown'}-${slug}`,
        portfolio_id: portfolioId,
        portfolio_ids: [portfolioId],
        property_id: '',
        property_ids: [],
        property_label: portfolioName,
        unit_id: '',
        unit_ids: [],
        lease_id: '',
        lease_end_date: '',
        display_name: fallbackName,
        legal_name: fallbackName,
        entity_kind: 'organization',
        entity_type: 'company',
        relationship_status: 'active',
        status: 'active',
        monthly_rent: 0,
        currency,
        avatar_url: clientAvatarPlaceholder(fallbackName),
        notes: 'Read-only entity client.',
        tags: ['demo', 'entity-client'],
      }),
    ]
  }

  const groupCount = properties.length >= 9 ? 3 : properties.length >= 4 ? 2 : 1
  const seeds = pickDemoClientSeeds(portfolioId, groupCount)
  const leaseById = new Map<string, DemoLease>(
    leases
      .map((lease) => [safeString(lease.id), lease] as const)
      .filter(([id]) => Boolean(id))
  )

  const grouped = seeds.map((seed, index) => {
    const ownedProperties = properties.filter(
      (_, propertyIndex) => propertyIndex % seeds.length === index
    )
    const ownedPropertyIds = ownedProperties
      .map((property) => safeString(property.id))
      .filter(Boolean)
    const ownedUnits = units.filter((unit) =>
      ownedPropertyIds.includes(safeString(unit.property_id))
    )
    const ownedUnitIds = ownedUnits
      .map((unit) => safeString(unit.id))
      .filter(Boolean)
    const ownedTenants = tenants.filter((tenant) =>
      ownedPropertyIds.includes(safeString(tenant.property_id))
    )

    const monthlyRent = ownedTenants.reduce(
      (sum, tenant) => sum + Number(tenant.monthly_rent || 0),
      0
    )

    const hasArrears = ownedTenants.some(
      (tenant) => safeString(tenant.status) === 'arrears'
    )
    const hasEnding = ownedTenants.some(
      (tenant) => safeString(tenant.status) === 'ending'
    )
    const status: Client['status'] = hasArrears
      ? 'arrears'
      : hasEnding
        ? 'ending'
        : 'active'

    const leaseCandidates = ownedTenants
      .map((tenant) => {
        const lease = leaseById.get(safeString(tenant.lease_id))
        if (!lease) return null
        return {
          id: safeString(lease.id),
          end_date: safeString(lease.end_date),
        }
      })
      .filter(Boolean) as Array<{ id: string; end_date: string }>
    leaseCandidates.sort((a, b) => a.end_date.localeCompare(b.end_date))
    const earliestLease = leaseCandidates[0]

    const propertyLabel =
      ownedProperties.length <= 1
        ? safeString(ownedProperties[0]?.name) || portfolioName
        : `${ownedProperties.length} properties`

    return normalizeClient({
      id: `client-${portfolioId}-${seed.slug}`,
      portfolio_id: portfolioId,
      portfolio_ids: [portfolioId],
      property_id: safeString(ownedPropertyIds[0]),
      property_ids: ownedPropertyIds,
      property_label: propertyLabel,
      unit_id: '',
      unit_ids: ownedUnitIds,
      lease_id: earliestLease?.id || '',
      lease_end_date: earliestLease?.end_date || '',
      display_name: seed.trading_name,
      legal_name: seed.legal_name,
      trading_name: seed.trading_name,
      entity_kind: 'organization',
      entity_type: seed.entity_type,
      jurisdiction: seed.jurisdiction,
      relationship_status: 'active',
      risk_level:
        status === 'arrears' ? 'high' : status === 'ending' ? 'medium' : 'low',
      status,
      monthly_rent: roundToMoney(monthlyRent),
      currency,
      avatar_url: clientAvatarPlaceholder(seed.slug),
      website_url: seed.website_url,
      notes: `Read-only client entity assigned to ${propertyLabel}.`,
      tags: ['demo', 'entity-client', portfolioId],
    })
  })

  return grouped.filter((client) => Boolean(safeString(client.id)))
}

const roundToMoney = (value: number) => Math.round(Number(value || 0))

export function usePortfolioClientCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<
    Client[] | undefined
  > | null>
  const collectionPath = usePortfolioConsoleChildPath(runtimePortfolio, 'clients')

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath || runtimePortfolio.isDemo.value) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Client>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Client[]>(() => {
    if (runtimePortfolio.isDemo.value) {
      const scenario = runtimePortfolio.scenario.value
      if (!scenario) return []

      const scenarioClients = (scenario as any).clients
      if (Array.isArray(scenarioClients) && scenarioClients.length > 0) {
        return scenarioClients.map((entry: Partial<Client>) =>
          normalizeClient(entry)
        )
      }

      return buildDemoClients(scenario)
    }

    return (sourceRef.value?.value ?? []).map((entry) => normalizeClient(entry))
  })

  return {
    collectionPath,
    collection,
  }
}
