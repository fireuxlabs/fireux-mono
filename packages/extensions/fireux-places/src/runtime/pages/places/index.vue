<!-- packages/extensions/fireux-places/src/runtime/pages/places/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Places"
      description="Search places and manage typed overlays (kitchen, company, supplier shell)."
    />

    <UContainer class="max-w-6xl py-8">
      <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
        <!-- Search + overlay actions -->
        <section class="w-full max-w-xl space-y-6" aria-label="Place search">
          <OrganismsObjectsPlaceSearchSection @confirmed="onPlaceConfirmed" />

          <UCard
            v-if="confirmedPlace"
            class="shadow-sm"
            :ui="{ body: 'space-y-4' }"
          >
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-map-pin" /> Selected place
                </div>
                <UBadge size="xs" variant="soft" color="gray">
                  {{ confirmedPlaceId }}
                </UBadge>
              </div>
            </template>

            <div class="flex items-start gap-3">
              <UAvatar
                :src="confirmedPlace.avatar || undefined"
                :alt="confirmedPlace.name"
                size="lg"
                icon="i-lucide-map-pin"
              />

              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-gray-900">
                  {{ confirmedPlace.name }}
                </p>
                <p class="truncate text-sm text-gray-500">
                  {{ confirmedPlace.formatted_address || '—' }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                :disabled="busy"
                @click="createOverlay('kitchen')"
              >
                {{ overlaysById.kitchen.has(confirmedPlaceId) ? 'Kitchen exists' : 'Create kitchen' }}
              </UButton>
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                :disabled="busy"
                @click="createOverlay('company')"
              >
                {{ overlaysById.company.has(confirmedPlaceId) ? 'Company exists' : 'Create company' }}
              </UButton>
              <UButton
                size="sm"
                color="primary"
                variant="soft"
                :disabled="busy"
                @click="createOverlay('supplier')"
              >
                {{ overlaysById.supplier.has(confirmedPlaceId) ? 'Supplier shell exists' : 'Create supplier shell' }}
              </UButton>

              <UButton
                size="sm"
                color="gray"
                variant="ghost"
                :to="`/places/${confirmedPlaceId}`"
              >
                View place
              </UButton>
            </div>
          </UCard>

          <UAlert
            color="primary"
            icon="i-lucide-info"
            title="How typing works"
            description="Places are neutral. Type is derived by overlay docs: kitchens/{place_id}, companies/{place_id}, supplier_shells/{place_id}."
          />
        </section>

        <!-- Managed places list -->
        <aside class="w-full flex-1 space-y-4" aria-label="Managed places">
          <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm font-semibold">
                  <UIcon name="i-lucide-layers" /> Managed places
                </div>
                <UBadge size="xs" variant="soft" color="gray">
                  {{ managedCount }}
                </UBadge>
              </div>
            </template>

            <UTabs v-model="tab" :items="tabs" />

            <section v-if="isLoading" class="space-y-2">
              <USkeleton class="h-14 w-full rounded-lg" />
              <USkeleton class="h-14 w-full rounded-lg" />
              <USkeleton class="h-14 w-full rounded-lg" />
            </section>

            <section
              v-else-if="filteredManaged.length === 0"
              class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700"
            >
              No places match this filter yet.
            </section>

            <section v-else class="space-y-2">
              <UCard
                v-for="entry in filteredManaged"
                :key="entry.id"
                class="shadow-none"
                :ui="{ body: 'flex items-start gap-3' }"
              >
                <UAvatar
                  :src="entry.place?.avatar || undefined"
                  :alt="entry.place?.name || entry.id"
                  size="md"
                  icon="i-lucide-map-pin"
                />
                <div class="min-w-0 flex-1">
                  <NuxtLink
                    :to="`/places/${entry.id}`"
                    class="block truncate text-sm font-semibold text-gray-900 hover:text-primary-600 dark:text-white"
                  >
                    {{ entry.place?.name || '(unknown place)' }}
                  </NuxtLink>
                  <p class="truncate text-sm text-gray-500">
                    {{ entry.place?.formatted_address || '—' }}
                  </p>

                  <div class="mt-2 flex flex-wrap items-center gap-2">
                    <UBadge
                      v-if="entry.primaryType !== 'other'"
                      size="xs"
                      variant="soft"
                      color="primary"
                    >
                      {{ entry.primaryType }}
                    </UBadge>
                    <UBadge v-else size="xs" variant="soft" color="gray">
                      other
                    </UBadge>

                    <UBadge v-if="entry.overlays.kitchen" size="xs" variant="outline">
                      kitchen
                    </UBadge>
                    <UBadge v-if="entry.overlays.company" size="xs" variant="outline">
                      company
                    </UBadge>
                    <UBadge v-if="entry.overlays.supplier" size="xs" variant="outline">
                      supplier
                    </UBadge>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-1">
                  <UButton
                    size="xs"
                    color="gray"
                    variant="ghost"
                    :to="`/places/${entry.id}`"
                  >
                    View
                  </UButton>
                </div>
              </UCard>
            </section>
          </UCard>
        </aside>
      </div>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToast } from '#imports'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'
import { useApp } from 'fireux-core/runtime/composables/fireux/firestore/core/app/useApp.ts'
import { usePlaces } from '../../composables/usePlaces'
import type { Place } from '../../models/place.model'

type OverlayKind = 'kitchen' | 'company' | 'supplier'
type FilterTab = 'all' | 'kitchens' | 'companies' | 'suppliers' | 'other'
type PrimaryType = 'kitchen' | 'company' | 'supplier' | 'other'

const tab = ref<FilterTab>('all')
const tabs = computed(() => [
  { label: 'All', value: 'all' },
  { label: 'Kitchens', value: 'kitchens' },
  { label: 'Companies', value: 'companies' },
  { label: 'Suppliers', value: 'suppliers' },
  { label: 'Other', value: 'other' },
])

const toast = typeof useToast === 'function' ? useToast() : undefined

const busy = ref(false)

const { setDocument, firestoreFetchCollection } = useFirestoreManager()
const { app } = useApp()
const { collection: placesCollection } = usePlaces()

// Overlays are derived from presence of overlay docs.
const kitchensOverlay = firestoreFetchCollection<{ id?: string; place_id?: string }>('kitchens')
const companiesOverlay = firestoreFetchCollection<{ id?: string; place_id?: string }>('companies')
const supplierShellsOverlay = firestoreFetchCollection<{ id?: string; place_id?: string }>('supplier_shells')

function idsFromOverlay(list: Array<{ id?: string; place_id?: string }> | undefined) {
  const out = new Set<string>()
  for (const row of list ?? []) {
    const id = (row?.id ?? row?.place_id ?? '').trim()
    if (id) out.add(id)
  }
  return out
}

const overlaysById = computed(() => ({
  kitchen: idsFromOverlay(kitchensOverlay.value),
  company: idsFromOverlay(companiesOverlay.value),
  supplier: idsFromOverlay(supplierShellsOverlay.value),
}))

const managedIds = computed(() => {
  const all = new Set<string>()
  for (const id of overlaysById.value.kitchen) all.add(id)
  for (const id of overlaysById.value.company) all.add(id)
  for (const id of overlaysById.value.supplier) all.add(id)
  return all
})

function resolvePrimaryType(id: string): PrimaryType {
  if (overlaysById.value.kitchen.has(id)) return 'kitchen'
  if (overlaysById.value.company.has(id)) return 'company'
  if (overlaysById.value.supplier.has(id)) return 'supplier'
  return 'other'
}

const placesById = computed(() => {
  const map = new Map<string, Place>()
  for (const row of placesCollection.value ?? []) {
    if (!row?.place_id) continue
    map.set(String(row.place_id), row)
  }
  return map
})

const managedEntries = computed(() => {
  const ids = [...managedIds.value]
  ids.sort((a, b) => a.localeCompare(b))

  return ids.map((id) => {
    const place = placesById.value.get(id) ?? null
    const primaryType = resolvePrimaryType(id)
    return {
      id,
      place,
      primaryType,
      overlays: {
        kitchen: overlaysById.value.kitchen.has(id),
        company: overlaysById.value.company.has(id),
        supplier: overlaysById.value.supplier.has(id),
      },
    }
  })
})

const isLoading = computed(() =>
  placesCollection.value === undefined ||
  kitchensOverlay.value === undefined ||
  companiesOverlay.value === undefined ||
  supplierShellsOverlay.value === undefined
)

const managedCount = computed(() => managedEntries.value.length)

const filteredManaged = computed(() => {
  if (tab.value === 'all') return managedEntries.value
  if (tab.value === 'kitchens') return managedEntries.value.filter((e) => e.primaryType === 'kitchen')
  if (tab.value === 'companies') return managedEntries.value.filter((e) => e.primaryType === 'company')
  if (tab.value === 'suppliers') return managedEntries.value.filter((e) => e.primaryType === 'supplier')
  return managedEntries.value.filter((e) => e.primaryType === 'other')
})

const confirmedPlaceId = ref<string>('')
const confirmedPlace = ref<Place | null>(null)

function onPlaceConfirmed(payload: { placeId: string; place: Place }) {
  confirmedPlaceId.value = payload.placeId
  confirmedPlace.value = payload.place
}

async function createOverlay(kind: OverlayKind) {
  const placeId = confirmedPlaceId.value
  const place = confirmedPlace.value
  if (!placeId || !place) return

  const exists =
    (kind === 'kitchen' && overlaysById.value.kitchen.has(placeId)) ||
    (kind === 'company' && overlaysById.value.company.has(placeId)) ||
    (kind === 'supplier' && overlaysById.value.supplier.has(placeId))

  if (exists) {
    toast?.add({
      title: 'Overlay already exists',
      description: 'This place already has that overlay.',
      color: 'gray',
    })
    return
  }

  const collectionName =
    kind === 'kitchen'
      ? 'kitchens'
      : kind === 'company'
        ? 'companies'
        : 'supplier_shells'

  busy.value = true
  try {
    await setDocument(collectionName, placeId, {
      name: place.name,
      description: null,
      app_id: app.value?.id ?? null,
    })

    toast?.add({
      title: 'Overlay created',
      description: `${collectionName}/${placeId}`,
      color: 'green',
    })
  } catch (error: any) {
    toast?.add({
      title: 'Overlay create failed',
      description: error?.message ?? 'Unable to create the overlay document.',
      color: 'red',
    })
  } finally {
    busy.value = false
  }
}
</script>
