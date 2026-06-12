import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { ClientStorage } from '../../../../../../../models/client.model'
import {
  useActivePortfolio,
  usePortfolioConsoleChildPath,
} from '../../useActivePortfolio'
import type { Client } from '../../../../../../../models/client.model'

const safeString = (value: unknown) => String(value ?? '').trim()
const isArray = (value: unknown): value is unknown[] => Array.isArray(value)

const uniqueStrings = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => safeString(value)).filter(Boolean)))

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
      safeString(value.logo_url),
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

export function usePortfolioClientCollection(
  runtimePortfolio = useActivePortfolio()
) {
  const { firestoreFetchCollection } = useFirestoreRead()
  const sourceRef = shallowRef(null) as ShallowRef<Ref<
    Client[] | undefined
  > | null>
  const collectionPath = usePortfolioConsoleChildPath(
    runtimePortfolio,
    ClientStorage.collection
  )

  watch(
    collectionPath,
    (nextPath) => {
      if (!nextPath) {
        sourceRef.value = null
        return
      }
      sourceRef.value = firestoreFetchCollection<Client>(nextPath)
    },
    { immediate: true }
  )

  const collection = computed<Client[]>(() => {
    return (sourceRef.value?.value ?? []).map((entry) => normalizeClient(entry))
  })
  const { byId: client } = useCollectionById(collection)

  return {
    collectionPath,
    collection,
    client,
  }
}
