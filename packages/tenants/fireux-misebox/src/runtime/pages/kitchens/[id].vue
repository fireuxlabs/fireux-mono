<!-- packages/tenants/fireux-misebox/src/runtime/pages/kitchens/[id].vue -->
<template>
  <UPage>
    <UPageHeader
      :title="headerTitle"
      :description="pageDescription"
      :badge="kitchenId"
    >
      <template #extra>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="primary"
            icon="i-lucide-map-pin"
            variant="soft"
            :to="`/places/${kitchenId}`"
          >
            View place
          </UButton>
          <UButton
            color="gray"
            icon="i-lucide-arrow-left"
            variant="ghost"
            to="/kitchens"
          >
            Back to kitchens
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UContainer class="max-w-5xl space-y-8 py-8">
      <section v-if="isLoading" class="space-y-4">
        <USkeleton class="h-40 w-full rounded-xl" />
        <div class="grid gap-4 md:grid-cols-2">
          <USkeleton class="h-48 rounded-xl" />
          <USkeleton class="h-48 rounded-xl" />
        </div>
      </section>

      <section
        v-else-if="!kitchen && !kitchenDocExists"
        class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700"
      >
        This kitchen does not exist or you no longer have access to it.
      </section>

      <section v-else-if="!kitchen" class="space-y-4">
        <UCard class="shadow-sm">
          <p class="text-sm text-gray-500">
            Kitchen data is still loading. Reload the page if this state
            persists.
          </p>
        </UCard>
      </section>

      <section v-else class="space-y-6">
        <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
          <div
            class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
          >
            <div class="space-y-2">
              <h2 class="text-2xl font-semibold">{{ kitchen.name }}</h2>
              <p v-if="kitchen.description" class="text-sm text-gray-500">
                {{ kitchen.description }}
              </p>
              <div
                v-if="appLabel"
                class="flex items-center gap-2 text-xs text-gray-500"
              >
                <UBadge size="xs" variant="soft" color="primary">
                  {{ appLabel }}
                </UBadge>
                <span
                  v-if="kitchen.app_id"
                  class="font-mono text-[11px] text-gray-400"
                >
                  {{ kitchen.app_id }}
                </span>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                color="primary"
                icon="i-lucide-navigation"
                variant="solid"
                size="sm"
                :to="`/places/${kitchenId}`"
              >
                Open place record
              </UButton>
              <UButton
                color="gray"
                icon="i-lucide-copy"
                variant="ghost"
                size="sm"
                @click="copyKitchenId"
              >
                Copy ID
              </UButton>
            </div>
          </div>

          <hr class="border-gray-200 dark:border-gray-800" />

          <dl class="grid gap-4 text-sm text-gray-500 md:grid-cols-3">
            <div>
              <dt class="font-medium text-gray-700">Kitchen ID</dt>
              <dd class="font-mono text-xs text-gray-500">{{ kitchenId }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-700">Linked app</dt>
              <dd>
                <span v-if="appLabel">{{ appLabel }}</span>
                <span v-else class="text-gray-400">Not linked</span>
              </dd>
            </div>
            <div>
              <dt class="font-medium text-gray-700">Place status</dt>
              <dd>
                <span v-if="place">Stored in places</span>
                <span v-else class="text-gray-400">No place record</span>
              </dd>
            </div>
          </dl>
        </UCard>

        <UCard class="shadow-sm" :ui="{ body: 'space-y-3' }">
          <template #header>
            <div class="flex items-center gap-2 font-semibold">
              <UIcon name="i-lucide-map" /> Linked place overview
            </div>
          </template>

          <div v-if="place" class="space-y-2">
            <h3 class="text-lg font-medium">{{ place.name }}</h3>
            <p v-if="place.formatted_address" class="text-sm text-gray-500">
              {{ place.formatted_address }}
            </p>
            <div class="flex flex-wrap gap-2 text-xs text-gray-500">
              <UBadge size="xs" variant="outline">{{ place.source }}</UBadge>
              <span v-if="place.lat && place.lng" class="font-mono">
                {{ place.lat.toFixed(5) }}, {{ place.lng.toFixed(5) }}
              </span>
            </div>
          </div>

          <p
            v-else
            class="rounded-lg border border-dashed border-gray-200 p-4 text-xs text-gray-500 dark:border-gray-800"
          >
            There is no matching place document. Save this kitchen through the
            Places workspace to populate richer details.
          </p>
        </UCard>

        <div class="grid gap-6 md:grid-cols-2">
          <UCard class="shadow-sm" :ui="{ body: 'space-y-3' }">
            <template #header>
              <div class="flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-code-2" /> Kitchen document
              </div>
            </template>
            <pre
              class="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
              >{{ kitchenJson }}
            </pre>
          </UCard>

          <UCard class="shadow-sm" :ui="{ body: 'space-y-3' }">
            <template #header>
              <div class="flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-database" /> Place document
              </div>
            </template>
            <pre
              class="max-h-80 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-gray-100"
              >{{ placeJson }}
            </pre>
          </UCard>
        </div>
      </section>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '#imports'
import { useKitchens } from '../../composables/firestore/objects/Kitchen/useKitchens'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'
import { usePlaces } from 'fireux-places/runtime/composables/usePlaces.ts'

const route = useRoute()
const rawId = route.params.id
const kitchenId = Array.isArray(rawId) ? rawId[0] : String(rawId ?? '')

const { useKitchen, useKitchenDoc } = useKitchens()
const fallbackDocRef = ref<any>(undefined)
const kitchenDocRef = kitchenId ? useKitchenDoc(kitchenId) : fallbackDocRef
const kitchenRef = kitchenId ? useKitchen(kitchenId) : computed(() => null)

const kitchen = computed(() => kitchenRef.value)
const kitchenDocExists = computed(
  () => kitchenDocRef.value !== null && kitchenDocRef.value !== undefined
)
const isLoading = computed(() => kitchenDocRef.value === undefined)

const { app: currentApp } = useApp()
const appLookup = computed(() => {
  const map = new Map<string, string>()
  const app = currentApp.value
  if (app?.id) {
    map.set(app.id, app.app_name ?? app.id)
  }
  return map
})

const appLabel = computed(() => {
  const current = kitchen.value?.app_id
  if (!current) return null
  return appLookup.value.get(current) ?? current
})

const headerTitle = computed(() => kitchen.value?.name ?? 'Kitchen details')
const pageDescription = computed(
  () =>
    kitchen.value?.description ??
    'Review linked place data and tenant metadata for this kitchen.'
)

const kitchenJson = computed(() =>
  JSON.stringify(kitchenDocRef.value ?? {}, null, 2)
)

const { place: resolvePlace } = usePlaces()
const placeFallback = ref<any>(undefined)
const placeRef = kitchenId ? resolvePlace(kitchenId) : placeFallback
const place = computed(() => placeRef.value)
const placeJson = computed(() => JSON.stringify(place.value ?? {}, null, 2))

useHead({
  title: computed(() =>
    kitchen.value?.name ? `${kitchen.value.name} · Kitchen` : 'Kitchen details'
  ),
})

async function copyKitchenId() {
  if (!kitchenId) return
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  await navigator.clipboard.writeText(kitchenId)
}
</script>
