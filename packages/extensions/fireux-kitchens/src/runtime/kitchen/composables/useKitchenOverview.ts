import { useOverview } from 'fireux-core/runtime/composables/fireux/useOverview'
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenInterface } from './firestore/utils/view/useKitchenInterface'
import { useKitchenWorkspace } from './workspace/core/useKitchenWorkspace'
import { useKitchenWorkspacePlace } from './workspace/identity/useKitchenWorkspacePlace'
import { kitchenCapabilities } from '../models/capabilities'

type DetailItem = {
  key: string
  label: string
  value: string
  icon: string
}

type IdentityField = {
  key: string
  label: string
  complete: boolean
  to?: string
}

export type KitchenOverviewOperationCard = {
  key: string
  label: string
  detail: string
  icon: string
  to: string
  group: string
}

export type KitchenOverviewOperationGroup = {
  label: string
  operations: KitchenOverviewOperationCard[]
}

export type KitchenOverviewQuestion = {
  question: string
  to: string
  icon: string
}

const identityTo = '/workspace/kitchen/identity'

export function useKitchenOverview() {
  // Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: resolve shared overview fields from the linked Place.
  const workspace = useKitchenWorkspace()
  const { pill, surface } = useKitchenInterface()
  const { place, currencyCode, placeOutcome } = useKitchenWorkspacePlace()
  const { focus } = useOverview({
    entity: workspace.data,
    id: workspace.id,
    outcome: workspace.outcome,
  })
  const selectedKitchen = computed(() => focus.value.entity)
  const kitchenId = workspace.id
  const kitchenSource = computed(
    () => (selectedKitchen.value || {}) as Record<string, any>
  )
  const kitchenTitle = computed(
    () =>
      normalizeString(
        kitchenSource.value.identity?.display_name ||
          kitchenSource.value.display_name ||
          kitchenSource.value.name ||
          place.value?.name ||
          place.value?.short_name
      ) || 'Kitchen'
  )
  const kitchenSubtitle = computed(
    () =>
      normalizeString(
        kitchenSource.value.identity?.tagline || kitchenSource.value.tagline
      ) ||
      normalizeString(place.value?.tagline) ||
      normalizeString(place.value?.short_address) ||
      normalizeString(place.value?.formatted_address) ||
      normalizeString(kitchenSource.value.short_address) ||
      normalizeString(kitchenSource.value.formatted_address)
  )
  const identityImage = computed(() => normalizeString(place.value?.image_url))
  const coverImage = computed(() =>
    normalizeString(kitchenSource.value.cover_image)
  )
  const address = computed(
    () =>
      normalizeString(place.value?.formatted_address) ||
      normalizeString(place.value?.short_address) ||
      normalizeString(kitchenSource.value.formatted_address) ||
      normalizeString(kitchenSource.value.short_address)
  )
  const phone = computed(
    () =>
      normalizeString(place.value?.phone) ||
      normalizeString(kitchenSource.value.phone)
  )
  const website = computed(
    () =>
      normalizeString(place.value?.website) ||
      normalizeString(kitchenSource.value.website)
  )
  const placeId = computed(() => normalizeString(place.value?.id))
  const visibilityBadgeLabel = computed(() =>
    kitchenSource.value.visibility === true ? 'Visible' : 'Hidden'
  )
  const visibilityBadgeColor = computed(() =>
    kitchenSource.value.visibility === true
      ? ('success' as const)
      : ('neutral' as const)
  )
  const kitchenPill = computed(() =>
    pill(
      surface({
        kitchen: selectedKitchen.value,
        place: place.value,
      })
    )
  )
  const imageInitials = computed(() => {
    const parts = kitchenTitle.value.split(/\s+/).filter(Boolean)
    if (!parts.length) return 'K'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase()
  })
  const detailItems = computed<DetailItem[]>(() =>
    [
      address.value
        ? {
            key: 'address',
            label: 'Address',
            value: address.value,
            icon: 'i-lucide-map-pin',
          }
        : null,
      phone.value
        ? {
            key: 'phone',
            label: 'Phone',
            value: phone.value,
            icon: 'i-lucide-phone',
          }
        : null,
      website.value
        ? {
            key: 'website',
            label: 'Website',
            value: website.value.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            icon: 'i-lucide-globe',
          }
        : null,
      currencyCode.value
        ? {
            key: 'currency',
            label: 'Currency',
            value: currencyCode.value,
            icon: 'i-lucide-coins',
          }
        : null,
    ].filter((item): item is DetailItem => Boolean(item))
  )
  const identityFields = computed<IdentityField[]>(() => [
    {
      key: 'name',
      label: 'Name',
      complete: Boolean(kitchenTitle.value && kitchenTitle.value !== 'Kitchen'),
      to: identityTo,
    },
    {
      key: 'slug',
      label: 'Slug',
      complete: Boolean(normalizeString(kitchenSource.value.slug)),
      to: identityTo,
    },
    {
      key: 'address',
      label: 'Address',
      complete: Boolean(address.value),
      to: identityTo,
    },
    {
      key: 'place',
      label: 'Linked place',
      complete: Boolean(placeId.value),
      to: identityTo,
    },
    {
      key: 'phone',
      label: 'Phone',
      complete: Boolean(phone.value),
      to: identityTo,
    },
    {
      key: 'website',
      label: 'Website',
      complete: Boolean(website.value),
      to: identityTo,
    },
    {
      key: 'currency',
      label: 'Currency',
      complete: Boolean(currencyCode.value),
      to: identityTo,
    },
    {
      key: 'image',
      label: 'Profile image',
      complete: Boolean(identityImage.value),
      to: identityTo,
    },
    {
      key: 'cover',
      label: 'Cover image',
      complete: Boolean(coverImage.value),
      to: identityTo,
    },
    {
      key: 'tagline',
      label: 'Tagline',
      complete: Boolean(normalizeString(place.value?.tagline)),
      to: identityTo,
    },
  ])
  const completeIdentityCount = computed(
    () => identityFields.value.filter((field) => field.complete).length
  )
  const identityPercent = computed(() =>
    identityFields.value.length
      ? Math.round(
          (completeIdentityCount.value / identityFields.value.length) * 100
        )
      : 0
  )
  const missingIdentityFields = computed(() =>
    placeOutcome.value === 'missing'
      ? [
          {
            key: 'place',
            label: 'Linked place',
            complete: false,
            to: identityTo,
          },
        ]
      : placeOutcome.value === 'ready'
        ? identityFields.value.filter(
            (field) =>
              ['name', 'address', 'phone', 'image', 'tagline'].includes(
                field.key
              ) && !field.complete
          )
        : []
  )
  const priorityIdentityFields = computed(() =>
    identityFields.value.filter((field) =>
      ['currency', 'cover', 'tagline'].includes(field.key)
    )
  )
  const operationCards = computed<KitchenOverviewOperationCard[]>(() =>
    kitchenCapabilities
      .filter((operation) => operation.landing !== false)
      .map((operation) => ({
        key: operation.slug,
        label: operation.title,
        detail: operation.description,
        icon: operation.icon,
        to: operation.to,
        group: operation.group,
      }))
  )
  const operationGroups = computed<KitchenOverviewOperationGroup[]>(() =>
    ['Food & Drink', 'Operations', 'Kitchen Setup', 'Reports'].flatMap(
      (label) => {
        const operations = operationCards.value.filter(
          (operation) => operation.group === label
        )
        return operations.length ? [{ label, operations }] : []
      }
    )
  )
  const hotQuestions = computed<KitchenOverviewQuestion[]>(() => {
    const priority = ['food-safety', 'mise', 'inventory', 'menus']
    return priority.flatMap((slug) => {
      const operation = kitchenCapabilities.find((entry) => entry.slug === slug)
      return operation
        ? [
            {
              question: operation.landingQuestion,
              to: operation.to,
              icon: operation.icon,
            },
          ]
        : []
    })
  })
  const pageState = computed(() => ({
    kitchen: kitchenId.value
      ? {
          id: kitchenId.value,
          name: kitchenTitle.value,
          description: kitchenSubtitle.value,
          image: identityImage.value,
        }
      : null,
    details: detailItems.value,
    missingIdentityFields: missingIdentityFields.value.map(
      ({ key, label, to }) => ({ key, label, to })
    ),
    derived: {
      status: workspace.outcome.value,
      placeStatus: placeOutcome.value,
    },
  }))
  return {
    pageState,
    placeOutcome,
    selectedKitchen,
    kitchenId,
    targetOutcome: workspace.outcome,
    kitchenTitle,
    kitchenSubtitle,
    identityImage,
    imageInitials,
    kitchenPill,
    detailItems,
    visibilityBadgeLabel,
    visibilityBadgeColor,
    identityFields,
    completeIdentityCount,
    missingIdentityFields,
    priorityIdentityFields,
    identityPercent,
    operationCards,
    operationGroups,
    hotQuestions,
  }
}
