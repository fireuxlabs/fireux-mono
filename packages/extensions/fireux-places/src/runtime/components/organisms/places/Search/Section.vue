<template>
  <UCard>
    <div class="space-y-4">
      <p class="text-sm text-gray-500">
        Firestore-first search runs automatically while you type. Results are
        logged and rendered below.
      </p>

      <UInput
        v-model="query"
        icon="i-lucide-search"
        placeholder="Type a place name…"
      />

      <p v-if="message" class="text-xs text-gray-500">
        {{ message }}
      </p>

      <div
        v-if="firestoreResults.length || googleResults.length"
        class="space-y-5"
      >
        <div v-if="firestoreResults.length" class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>Firestore matches</span>
            <UBadge color="neutral" size="2xs">{{
              firestoreResults.length
            }}</UBadge>
          </div>

          <ul class="space-y-2">
            <li
              v-for="place in firestoreResults"
              :key="place.place_id"
              class="rounded border border-gray-100 px-3 py-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ place.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ place.formatted_address || '—' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    ID: {{ place.place_id }}
                  </div>
                </div>
                <UBadge color="green" size="2xs">Saved</UBadge>
              </div>
            </li>
          </ul>
        </div>

        <div v-if="googleResults.length" class="space-y-3">
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>Google suggestions</span>
            <UBadge color="primary" size="2xs">{{
              googleResults.length
            }}</UBadge>
          </div>

          <ul class="space-y-2">
            <li
              v-for="place in googleResults"
              :key="place.place_id"
              class="rounded border border-blue-50 bg-blue-50/30 px-3 py-2"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="font-medium">{{ place.name }}</div>
                  <div class="text-xs text-gray-500">
                    {{ place.formatted_address || '—' }}
                  </div>
                  <div class="text-[11px] text-gray-400">
                    ID: {{ place.place_id }}
                  </div>
                </div>
                <UBadge color="primary" size="2xs">Google</UBadge>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { PlaceCard } from '../../../../models/place.model'
import { usePlaces } from '../../../../composables/usePlaces'

const { searchPlaces } = usePlaces()

const query = ref('')
const message = ref('')
const results = ref<PlaceCard.Cell[]>([])
const debounceDelay = 250
const minLength = 3

const firestoreResults = computed(() =>
  results.value.filter((place) => place.meta_right === 'Firestore')
)
const googleResults = computed(() =>
  results.value.filter((place) => place.meta_right === 'Google')
)

function formatResultsMessage(
  value: string,
  firestoreCount: number,
  googleCount: number
): string {
  if (firestoreCount === 0 && googleCount === 0) {
    return `No matches for “${value}”.`
  }

  if (firestoreCount > 0 && googleCount === 0) {
    const suffix = firestoreCount === 1 ? '' : 'es'
    return `${firestoreCount} Firestore match${suffix} found for “${value}”.`
  }

  if (firestoreCount === 0 && googleCount > 0) {
    const suffix = googleCount === 1 ? '' : 's'
    return `No Firestore matches; showing ${googleCount} Google suggestion${suffix} for “${value}”.`
  }

  const firestoreSuffix = firestoreCount === 1 ? '' : 'es'
  const googleSuffix = googleCount === 1 ? '' : 's'
  return `${firestoreCount} Firestore match${firestoreSuffix} plus ${googleCount} Google suggestion${googleSuffix} for “${value}”.`
}

let debounceId: ReturnType<typeof setTimeout> | null = null

function clearDebounce() {
  if (debounceId) {
    clearTimeout(debounceId)
    debounceId = null
  }
}

watch(
  () => query.value,
  (raw) => {
    clearDebounce()

    const value = raw.trim()

    if (!value) {
      results.value = []
      message.value =
        'Type a place name to search your saved Firestore entries.'
      return
    }

    if (value.length < minLength) {
      results.value = []
      message.value = `Keep typing… minimum ${minLength} characters for Firestore search.`
      return
    }

    message.value = `Searching for “${value}”…`

    debounceId = setTimeout(async () => {
      try {
        const matches = await searchPlaces(value)

        if (import.meta.dev) {
          console.log('[places] Firestore search results', {
            query: value,
            matches,
          })
        }

        if (query.value.trim() !== value) {
          return
        }

        results.value = matches

        const firestoreCount = firestoreResults.value.length
        const googleCount = googleResults.value.length

        message.value = formatResultsMessage(value, firestoreCount, googleCount)
      } catch (error) {
        if (import.meta.dev) {
          console.error('[places] Firestore search error', error)
        }
        if (query.value.trim() === value) {
          results.value = []
          message.value = 'Search failed. Check console for details.'
        }
      }
    }, debounceDelay)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  clearDebounce()
})
</script>
