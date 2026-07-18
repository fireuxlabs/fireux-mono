<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2>Delivery orders</h2>
          <p>Open delivery orders drivers can size up before tending.</p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ orders.length }} open
        </UBadge>
      </div>
    </template>

    <div v-if="orders.length" class="grid gap-3">
      <UPageCard
        v-for="order in orders"
        :key="order.id"
        variant="subtle"
      >
        <template #title>
          <span>{{ loadSummary(order).title }}</span>
        </template>

        <template #description>
          <span>{{ loadSummary(order).description }}</span>
        </template>

        <KitchenCardsPill
          :title="kitchenLabel(order)"
          subtitle="Collection"
          :image-url="kitchenImageUrl(order)"
          :image-shade="kitchenImageShade(order)"
          :show-badges="false"
        />

        <div class="pill">
          <div class="flex min-w-0 items-start gap-2">
            <UAvatar
              :src="destinationAvatarUrl(order) || undefined"
              :icon="destinationAvatarUrl(order) ? undefined : 'i-lucide-map-pin'"
              :alt="destinationLabel(order)"
              size="sm"
            />

            <div class="min-w-0 flex-1 space-y-1">
              <p class="truncate text-sm font-medium text-highlighted">
                {{ destinationTitle(order) }}
              </p>
              <p class="truncate text-xs text-toned">
                {{ destinationSubtitle(order) }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <UButton
            size="sm"
            color="neutral"
            :variant="isWatching(order) ? 'solid' : 'soft'"
            :icon="isWatching(order) ? 'i-lucide-eye' : 'i-lucide-eye'"
            :loading="watchingPendingId === order.id"
            :disabled="!currentDriverId || isWatching(order)"
            @click="watchOrder(order)"
          >
            {{ isWatching(order) ? 'Watching' : 'Watch' }}
          </UButton>

          <span
            v-if="watcherCount(order)"
            class="text-xs font-medium text-dimmed"
          >
            {{ watcherCount(order) }} watching
          </span>
          <span v-else-if="!currentDriverId" class="text-xs text-dimmed">
            Create a driver profile to watch orders.
          </span>
        </div>

        <pre class="driver-delivery-pings__debug">{{ debugOrder(order) }}</pre>
      </UPageCard>
    </div>

    <p v-else class="text-sm text-dimmed">
      No delivery orders right now.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import type { PlaceImageShade } from 'fireux-places/runtime/models/place.model'
import { useKitchenChildCollection } from '../../composables/fireux/firestore/kitchen/utils/paths/useKitchenChildCollection'
import { useDriver } from '../../composables/fireux/firestore/profiles/Driver/useDriver'

type DriverOrder = {
  id: string
  status?: string
  order_type?: string
  kitchen_slug?: string
  kitchen_id?: string
  kitchen_name?: string
  pickup?: {
    label?: string
    lat?: number
    lng?: number
  }
  fulfilment_match?: Record<string, unknown>
  customer?: {
    name?: string
    address?: string
    avatar?: string
    avatar_url?: string
    image_url?: string
  }
  user?: {
    display_name?: string
    avatar?: string
    avatar_url?: string
    image_url?: string
  }
  items?: Array<{
    id?: string
    label?: string
    name?: string
    quantity?: number
  }>
  driver_responses?: Record<string, DriverOrderDriverResponse>
}

type DriverOrderDriverResponse = {
  status?: 'watching' | 'rejected' | 'tendered'
  driver_id?: string
  driver_name?: string
  avatar_url?: string
  updated_at?: string
}

type KitchenBeaconHydration = {
  id?: string
  name?: string
  display_name?: string
  slug?: string
  identity?: {
    image_url?: string
    image_shade?: PlaceImageShade
  }
  image_url?: string
  display_image_url?: string
  cover_image?: string
  image_shade?: PlaceImageShade
}

type DriverKitchenLink = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  active?: boolean
}

const { firestoreFetchCollection } = useFirestoreRead()
const { updateDocument } = useFirestoreUpdate()
const { coreProfile, coreUser } = useDriver()
const kitchens = firestoreFetchCollection<KitchenBeaconHydration>('kitchens')
const watchingPendingId = ref('')
const currentDriverId = computed(() =>
  text(coreProfile.value?.id)
)
const activeKitchenLink = computed(() =>
  driverKitchenLinks.value.find((link) => link.active !== false) ||
    driverKitchenLinks.value[0] ||
    null
)
const driverKitchenLinks = computed<DriverKitchenLink[]>(() =>
  Array.isArray((coreProfile.value as any)?.kitchen_links)
    ? (coreProfile.value as any).kitchen_links
    : []
)
const driverKitchenId = computed(() =>
  text(activeKitchenLink.value?.kitchen_id)
)
const driverKitchenCollectionPath = computed(() => {
  const appId = text(activeKitchenLink.value?.app_id)

  return appId ? `apps/${appId}/kitchens` : ''
})
const orderState = useKitchenChildCollection<DriverOrder>(
  'orders',
  driverKitchenId,
  { kitchenCollectionPath: driverKitchenCollectionPath }
)
const currentDriverName = computed(() =>
  text(coreProfile.value?.driver_name) ||
    text(coreUser.value?.display_name) ||
    'Driver'
)
const currentDriverAvatar = computed(() =>
  text((coreProfile.value as { avatar?: string } | null)?.avatar) ||
    text(coreUser.value?.avatar)
)
const orders = computed(() =>
  (orderState.items.value || [])
    .filter((order) =>
      text(order.order_type) === 'delivery' &&
      ['pending_acceptance', 'pending_payment', 'incoming', 'new', 'open']
        .includes(text(order.status || 'open'))
    )
)
const kitchensById = computed(() => {
  const map = new Map<string, KitchenBeaconHydration>()
  for (const kitchen of kitchens.value || []) {
    const id = text(kitchen.id)
    if (id) map.set(id, kitchen)
  }

  return map
})

function loadSummary(order: DriverOrder) {
  const items = Array.isArray(order.items) ? order.items : []
  const total = items.reduce((sum, item) => sum + quantity(item.quantity), 0)
  const pizzas = countBy(items, isPizza)
  const drinks = countBy(items, isDrink)
  const parts = [
    pizzas ? `${pizzas} pizza${pizzas === 1 ? '' : 's'}` : '',
    drinks ? `${drinks} drink${drinks === 1 ? '' : 's'}` : '',
  ].filter(Boolean)
  const totalItems = total || items.length

  return {
    title: `${totalItems} item${totalItems === 1 ? '' : 's'}`,
    description: parts.length ? parts.join(' · ') : 'Mixed order',
  }
}

function countBy(
  items: NonNullable<DriverOrder['items']>,
  predicate: (name: string) => boolean
) {
  return (items || []).reduce((sum, item) =>
    sum + (predicate(text(item.label || item.name)) ? quantity(item.quantity) : 0),
  0)
}

function isPizza(name: string) {
  return name.toLowerCase().includes('pizza')
}

function isDrink(name: string) {
  const value = name.toLowerCase()
  return [
    'cola',
    'red bull',
    'mineral',
    'dose',
    'liter',
    'litre',
    'drink',
    'beer',
    'bier',
    'cocktail',
    'colada',
    'mamma',
  ].some((word) => value.includes(word))
}

function quantity(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0
}

function text(value: unknown) {
  return String(value ?? '').trim()
}

function driverResponseId() {
  return currentDriverId.value.replace(/[^A-Za-z0-9_-]/g, '_')
}

function currentOrderResponse(order: DriverOrder) {
  const id = driverResponseId()

  return id ? order.driver_responses?.[id] : undefined
}

function isWatching(order: DriverOrder) {
  return currentOrderResponse(order)?.status === 'watching'
}

function watcherCount(order: DriverOrder) {
  return Object.values(order.driver_responses || {})
    .filter((response) => response?.status === 'watching')
    .length
}

async function watchOrder(order: DriverOrder) {
  const id = driverResponseId()
  if (
    !id ||
    !order.id ||
    !orderState.collectionPath.value ||
    isWatching(order) ||
    watchingPendingId.value
  ) {
    return
  }

  watchingPendingId.value = order.id
  try {
    await updateDocument<DriverOrder>(orderState.collectionPath.value, order.id, {
      [`driver_responses.${id}`]: {
        status: 'watching',
        driver_id: currentDriverId.value,
        driver_name: currentDriverName.value,
        avatar_url: currentDriverAvatar.value,
        updated_at: new Date().toISOString(),
      },
    } as Partial<DriverOrder>)
  } finally {
    watchingPendingId.value = ''
  }
}

function hydratedKitchen(order: DriverOrder) {
  return kitchensById.value.get(text(order.kitchen_id || driverKitchenId.value))
}

function kitchenLabel(order: DriverOrder) {
  const kitchen = hydratedKitchen(order)

  return text(order.pickup?.label) ||
    text(order.kitchen_name) ||
    text(activeKitchenLink.value?.kitchen_name) ||
    text(order.kitchen_slug) ||
    text(kitchen?.display_name) ||
    text(kitchen?.name) ||
    prettySlug(kitchen?.slug) ||
    'Kitchen'
}

function kitchenImageUrl(order: DriverOrder) {
  const kitchen = hydratedKitchen(order)

  return text(kitchen?.identity?.image_url) ||
    text(kitchen?.display_image_url) ||
    text(kitchen?.image_url) ||
    text(kitchen?.cover_image)
}

function kitchenImageShade(order: DriverOrder): PlaceImageShade | undefined {
  const kitchen = hydratedKitchen(order)

  return kitchen?.identity?.image_shade || kitchen?.image_shade
}

function destination(order: DriverOrder) {
  return record(order.fulfilment_match?.delivery_address)
}

function destinationLabel(order: DriverOrder) {
  const address = destination(order)

  return text(address.formatted) ||
    text(order.customer?.address) ||
    text(address.postal_code) ||
    'missing destination'
}

function customerName(order: DriverOrder) {
  return text(order.customer?.name)
}

function destinationTitle(order: DriverOrder) {
  return customerName(order) || destinationLabel(order)
}

function destinationSubtitle(order: DriverOrder) {
  return customerName(order) ? destinationLabel(order) : 'Destination'
}

function destinationAvatarUrl(order: DriverOrder) {
  return text(order.customer?.avatar_url) ||
    text(order.customer?.avatar) ||
    text(order.customer?.image_url)
}

function prettySlug(value: unknown) {
  const slug = text(value)
  if (!slug) return ''

  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function debugOrder(order: DriverOrder) {
  return JSON.stringify(order, null, 2)
}
</script>

<style scoped>
.driver-delivery-pings__debug {
  overflow: auto;
  max-height: 18rem;
  margin: 0;
  padding: 0.75rem;
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg-elevated) 92%, var(--ui-text));
  color: var(--ui-text);
  font-size: 0.75rem;
  line-height: 1.45;
  text-align: left;
}

</style>
