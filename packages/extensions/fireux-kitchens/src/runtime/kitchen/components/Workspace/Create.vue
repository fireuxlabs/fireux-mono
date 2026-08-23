<template>
  <div v-if="canCreate">
    <UButton
      label="Create Kitchen"
      icon="i-lucide-plus"
      color="primary"
      @click="open = true"
    />

    <UModal
      :open="open"
      title="Create your Kitchen"
      :ui="{ content: 'sm:max-w-2xl', body: 'p-0 sm:p-0' }"
      @update:open="open = $event"
    >
      <template #body>
        <form
          class="flex min-h-0 flex-col"
          style="height: min(34rem, 72vh)"
          @submit.prevent="submit"
        >
          <div class="shrink-0 border-b border-default px-6 py-4">
            <PlaceSearchBar v-model="query" placeholder="Search Kitchens" />
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-6 py-4">
            <div
              v-if="isSearching && !results.length"
              class="flex h-full items-center justify-center"
            >
              <div class="flex items-center gap-2 text-sm text-muted">
                <UIcon
                  name="i-lucide-loader-circle"
                  class="size-4 animate-spin"
                />
                Searching
              </div>
            </div>

            <div
              v-else-if="!query.trim()"
              class="flex h-full items-center justify-center text-muted"
            >
              <UIcon name="i-lucide-search" class="size-8" />
            </div>

            <div
              v-else-if="results.length"
              class="space-y-2"
              aria-label="Kitchen search results"
            >
              <button
                v-for="result in results"
                :key="result.id"
                type="button"
                class="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition"
                :class="
                  selection?.placeId === result.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-default bg-default hover:border-accented hover:bg-elevated'
                "
                @click="selectPlace(result)"
              >
                <img
                  v-if="result.imageUrl"
                  :src="result.imageUrl"
                  :alt="result.name"
                  class="size-11 shrink-0 rounded-lg object-cover"
                />
                <span
                  v-else
                  class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"
                >
                  <UIcon name="i-lucide-store" class="size-5" />
                </span>

                <span class="min-w-0 flex-1">
                  <span class="block truncate font-medium text-highlighted">
                    {{ result.name }}
                  </span>
                  <span class="mt-0.5 block truncate text-sm text-muted">
                    {{ resultAddress(result) || 'Address unavailable' }}
                  </span>
                </span>

                <span class="flex shrink-0 items-center gap-2">
                  <UIcon
                    v-if="selection?.placeId === result.id"
                    name="i-lucide-circle-check"
                    class="size-5 text-primary"
                  />
                  <UIcon
                    v-else
                    name="i-lucide-chevron-right"
                    class="size-4 text-dimmed"
                  />
                </span>
              </button>
            </div>

            <div v-else class="flex h-full items-center justify-center">
              <div class="space-y-3 text-center">
                <UButton
                  v-if="needsLocation"
                  label="Search near me"
                  icon="i-lucide-locate-fixed"
                  color="neutral"
                  variant="soft"
                  type="button"
                  :loading="locating"
                  @click="searchNearby"
                />
                <p v-else class="text-sm text-muted">No matching Kitchens</p>
                <p v-if="locationError" class="text-xs text-error">
                  {{ locationError }}
                </p>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-default px-6 py-4">
            <div class="mb-4 space-y-3">
              <USeparator label="or" />
              <UInput
                v-model="manualName"
                placeholder="Kitchen name"
                icon="i-lucide-chef-hat"
                size="lg"
              />
            </div>

            <UAlert
              v-if="error"
              class="mb-4"
              color="error"
              variant="soft"
              icon="i-lucide-triangle-alert"
              title="Kitchen could not be created"
              :description="error"
            />

            <div class="flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p
                  v-if="selection || manualName.trim()"
                  class="truncate text-sm font-medium text-highlighted"
                >
                  {{ selection?.name || manualName.trim() }}
                </p>
                <p class="text-xs text-muted">
                  {{
                    selection
                      ? 'Selected Kitchen'
                      : manualName.trim()
                        ? 'New Kitchen'
                        : 'Choose a Kitchen'
                  }}
                </p>
              </div>
              <UButton
                label="Create Kitchen"
                icon="i-lucide-plus"
                type="submit"
                :loading="working"
                :disabled="(!selection && !manualName.trim()) || working"
              />
            </div>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import {
  usePlaceSearch,
  type PlaceSearchLocation,
  type PlaceSearchCell,
} from 'fireux-places/runtime/place/composables/usePlaceSearch'
import { useKitchenCreate } from '../../composables/firestore/mutations/useKitchenCreate'
import { useKitchenWorkspaceTools } from '../../composables/workspace/index/useKitchenWorkspaceTools'

type SelectedPlace = {
  placeId: string
  name: string
  address: string
  source: 'google' | 'fireux' | 'manual'
}

const canCreate = computed(() => true)
const { createKitchenOpen: open } = useKitchenWorkspaceTools()
const { createKitchen } = useKitchenCreate()
const toast = useToast()
const emit = defineEmits<{
  (event: 'created', id: string): void
}>()
const nearbyLocation = ref<PlaceSearchLocation | null>(null)
const { query, results, isSearching, refresh } = usePlaceSearch({
  debugLabel: 'kitchens',
  location: nearbyLocation,
  type: 'kitchen',
})
const selection = ref<SelectedPlace | null>(null)
const manualName = ref('')
const error = ref('')
const locating = ref(false)
const locationError = ref('')
const working = ref(false)
const needsLocation = computed(
  () => !nearbyLocation.value && query.value.trim().split(/\s+/).length === 1
)

onMounted(() => {
  void useGrantedBrowserLocation()
})

watch(query, () => {
  selection.value = null
  error.value = ''
  locationError.value = ''
})

watch(manualName, (name) => {
  if (name.trim()) selection.value = null
  error.value = ''
})

async function searchNearby() {
  await resolveBrowserLocation(true)
}

async function useGrantedBrowserLocation() {
  if (!window.navigator.geolocation || !window.navigator.permissions) return
  try {
    const permission = await window.navigator.permissions.query({
      name: 'geolocation',
    })
    if (permission.state === 'granted') {
      await resolveBrowserLocation(true)
    }
  } catch {
    // Permission inspection is not supported consistently across browsers.
  }
}

async function resolveBrowserLocation(refreshResults: boolean) {
  if (locating.value) return
  locationError.value = ''
  if (!window.navigator.geolocation) {
    locationError.value = 'Location is not available in this browser.'
    return
  }

  locating.value = true
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      window.navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        maximumAge: 300_000,
        timeout: 8_000,
      })
    )
    nearbyLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      radiusMeters: 25_000,
    }
    if (refreshResults && query.value.trim()) await refresh()
  } catch {
    locationError.value = 'Allow location access to search nearby.'
  } finally {
    locating.value = false
  }
}

function resultAddress(value: PlaceSearchCell) {
  return String(value.shortAddress || value.formattedAddress || '').trim()
}

function selectPlace(value: PlaceSearchCell) {
  manualName.value = ''
  selection.value = {
    placeId: String(value.id || '').trim(),
    name: String(value.name || '').trim(),
    address: resultAddress(value),
    source:
      value.source === 'google' || value.source === 'manual'
        ? value.source
        : 'fireux',
  }
  error.value = ''
}

function clearDraft() {
  open.value = false
  selection.value = null
  manualName.value = ''
}

function errorMessage(cause: unknown) {
  const value = cause as {
    data?: { statusMessage?: unknown; message?: unknown }
    statusMessage?: unknown
    message?: unknown
  }
  return String(
    value?.data?.statusMessage ||
      value?.statusMessage ||
      value?.data?.message ||
      value?.message ||
      'Try again.'
  )
}

async function submit() {
  const name = manualName.value.trim()
  if ((!selection.value && !name) || working.value) return
  error.value = ''

  working.value = true
  try {
    const result = await createKitchen(
      selection.value ? { place_id: selection.value.placeId } : { name }
    )
    emit('created', result.id)
    const createdName = selection.value?.name || name || 'Kitchen'
    clearDraft()
    toast.add({ title: `${createdName} created`, color: 'success' })
  } catch (cause) {
    error.value = errorMessage(cause)
  } finally {
    working.value = false
  }
}
</script>
