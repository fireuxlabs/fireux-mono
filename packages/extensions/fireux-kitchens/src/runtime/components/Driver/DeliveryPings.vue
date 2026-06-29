<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-1">
          <h2>Delivery beacons</h2>
          <p>Open delivery pings drivers can size up before tending.</p>
        </div>

        <UBadge color="neutral" variant="soft">
          {{ pings.length }} open
        </UBadge>
      </div>
    </template>

    <div v-if="pings.length" class="grid gap-3">
      <UPageCard
        v-for="ping in pings"
        :key="ping.id"
        variant="subtle"
      >
        <template #title>
          <span>{{ loadSummary(ping).title }}</span>
        </template>

        <template #description>
          <span>{{ loadSummary(ping).description }}</span>
        </template>

        <div class="driver-delivery-pings__kitchen-pill">
          <UIcon name="i-lucide-store" class="size-4" aria-hidden="true" />
          <span>{{ kitchenLabel(ping) }}</span>
        </div>

        <p class="driver-delivery-pings__destination">
          Destination: {{ destinationLabel(ping) }}
        </p>

        <pre class="driver-delivery-pings__debug">{{ debugPing(ping) }}</pre>
      </UPageCard>
    </div>

    <p v-else class="text-sm text-dimmed">
      No delivery beacons right now.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'

type DriverPing = {
  id: string
  status?: string
  kind?: string
  kitchen_slug?: string
  kitchen_id?: string
  kitchen_name?: string
  pickup?: {
    label?: string
    lat?: number
    lng?: number
  }
  destination?: {
    formatted?: string
    postal_code?: string
    lat?: number
    lng?: number
  }
  basket?: {
    quantity?: number
    items?: Array<{
      id?: string
      name?: string
      quantity?: number
    }>
  }
}

type KitchenBeaconHydration = {
  id?: string
  name?: string
  display_name?: string
  slug?: string
}

const { firestoreFetchCollection } = useFirestoreRead()
const allPings = firestoreFetchCollection<DriverPing>('driver-pings')
const kitchens = firestoreFetchCollection<KitchenBeaconHydration>('kitchens')
const pings = computed(() =>
  (allPings.value || [])
    .filter((ping) =>
      text(ping.kind) === 'weak_delivery_ping' &&
      text(ping.status || 'open') === 'open'
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

function loadSummary(ping: DriverPing) {
  const items = Array.isArray(ping.basket?.items) ? ping.basket.items : []
  const total = items.reduce((sum, item) => sum + quantity(item.quantity), 0)
  const pizzas = countBy(items, isPizza)
  const drinks = countBy(items, isDrink)
  const parts = [
    pizzas ? `${pizzas} pizza${pizzas === 1 ? '' : 's'}` : '',
    drinks ? `${drinks} drink${drinks === 1 ? '' : 's'}` : '',
  ].filter(Boolean)

  return {
    title: `${total || quantity(ping.basket?.quantity)} item${(total || quantity(ping.basket?.quantity)) === 1 ? '' : 's'}`,
    description: parts.length ? parts.join(' · ') : 'Mixed order',
  }
}

function countBy(
  items: NonNullable<DriverPing['basket']>['items'],
  predicate: (name: string) => boolean
) {
  return (items || []).reduce((sum, item) =>
    sum + (predicate(text(item.name)) ? quantity(item.quantity) : 0),
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

function kitchenLabel(ping: DriverPing) {
  const kitchen = kitchensById.value.get(text(ping.kitchen_id))

  return text(ping.pickup?.label) ||
    text(ping.kitchen_name) ||
    text(ping.kitchen_slug) ||
    text(kitchen?.display_name) ||
    text(kitchen?.name) ||
    prettySlug(kitchen?.slug) ||
    'Kitchen'
}

function destinationLabel(ping: DriverPing) {
  return text(ping.destination?.formatted) ||
    text(ping.destination?.postal_code) ||
    'missing destination'
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

function debugPing(ping: DriverPing) {
  return JSON.stringify(ping, null, 2)
}
</script>

<style scoped>
.driver-delivery-pings__debug {
  overflow: auto;
  max-height: 18rem;
  margin: 0;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--ui-bg-elevated) 92%, var(--ui-text));
  color: var(--ui-text);
  font-size: 0.75rem;
  line-height: 1.45;
  text-align: left;
}

.driver-delivery-pings__kitchen-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  padding: 0.35rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
  color: var(--ui-text);
  font-size: 0.8rem;
  font-weight: 800;
}

.driver-delivery-pings__destination {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: 0.9rem;
  font-weight: 700;
  text-align: left;
}
</style>
