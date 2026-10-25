<template>
  <UButton
    label="Compare Google details"
    icon="i-lucide-map-pinned"
    color="neutral"
    variant="ghost"
    @click="show"
  />
  <UModal
    v-model:open="open"
    title="Compare Google details"
    description="Read-only comparison. Your saved details stay unchanged."
    :ui="{ content: 'sm:max-w-3xl' }"
  >
    <template #body>
      <div v-if="loading" class="space-y-4" aria-label="Loading Google details">
        <USkeleton v-for="row in 4" :key="row" class="h-20" />
      </div>
      <UAlert
        v-else-if="error"
        title="Could not check Google details"
        :description="error"
        color="error"
      >
        <template #actions><FireCopyError :message="error" /></template>
      </UAlert>
      <div v-else-if="review" class="space-y-5">
        <p class="text-sm text-muted">{{ place.name }}</p>
        <div class="google-review">
          <div class="google-review__head text-xs text-muted">
            <span>Detail</span><span>Saved</span
            ><span class="google-attribution" translate="no">Google Maps</span>
          </div>
          <div v-for="row in rows" :key="row.label" class="google-review__row">
            <div class="font-medium text-highlighted">
              {{ row.label
              }}<span
                v-if="row.same"
                class="mt-1 block text-xs font-normal text-muted"
                >Matches</span
              >
            </div>
            <p class="google-review__value">{{ row.saved || 'Not set' }}</p>
            <p class="google-review__value">
              {{ row.incoming || 'Not supplied' }}
            </p>
          </div>
        </div>
        <p class="text-xs text-muted">
          Times are local to the timezone shown in each column. Google’s regular
          weekly hours exclude holiday exceptions and separate service
          schedules.
        </p>
        <p
          v-if="review.hoursStatus === 'unsupported'"
          class="text-sm text-muted"
        >
          Google returned hours that cannot be represented by this weekly
          schedule. Check them on Google Maps.
        </p>
        <div v-if="attributions.length" class="text-xs text-muted">
          <template v-for="(attribution, index) in attributions" :key="index">
            <a
              v-if="attribution.url"
              :href="attribution.url"
              target="_blank"
              rel="noopener noreferrer"
              class="mr-2 underline"
              >{{ attribution.text }}</a
            >
            <span v-else class="mr-2">{{ attribution.text }}</span>
          </template>
        </div>
        <div class="flex justify-between gap-3">
          <UButton
            :to="mapsUrl"
            target="_blank"
            label="View on Google Maps"
            trailing-icon="i-lucide-arrow-up-right"
            color="neutral"
            variant="link"
          />
          <UButton
            label="Close"
            color="neutral"
            variant="outline"
            @click="open = false"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { Place, PlaceBusinessHours } from '../../models/place.model'
import type { GooglePlaceReview } from '../../models/google-review'
import { openingDays } from '../../utils/opening-hours-editor'

const props = defineProps<{ place: Place }>()
const open = ref(false),
  loading = ref(false),
  error = ref('')
const review = ref<GooglePlaceReview | null>(null)
let sequence = 0
watch(
  () => props.place.id,
  () => {
    sequence++
    open.value = false
    review.value = null
  }
)
watch(open, (value) => {
  if (!value) {
    sequence++
    review.value = null
    loading.value = false
  }
})
const mapsUrl = computed(
  () =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(props.place.name)}&query_place_id=${encodeURIComponent(props.place.id)}`
)
function formatHours(hours: PlaceBusinessHours | null | undefined) {
  if (!hours?.windows.length) return ''
  return openingDays
    .map((day) => {
      const ranges = hours.windows
        .filter((window) => window.days.includes(day))
        .map((window) =>
          window.open === '00:00' && window.close === '00:00'
            ? '24 hours'
            : `${window.open}–${window.close}${window.close <= window.open ? ' (next day)' : ''}`
        )
        .sort()
      return `${day.charAt(0).toUpperCase() + day.slice(1, 3)}: ${ranges.join(', ') || 'Closed'}`
    })
    .join('\n')
}
const rows = computed(() => {
  const incoming = review.value
  if (!incoming) return []
  return [
    { label: 'Name', saved: props.place.name, incoming: incoming.name },
    { label: 'Phone', saved: props.place.phone, incoming: incoming.phone },
    {
      label: 'Website',
      saved: props.place.website,
      incoming: incoming.website,
    },
    {
      label: 'Timezone',
      saved: props.place.timezone,
      incoming: incoming.timezone,
    },
    {
      label: 'Venue hours',
      saved: formatHours(props.place.business_hours),
      incoming: formatHours(incoming.business_hours),
    },
  ].map((row) => ({
    ...row,
    same: Boolean(row.incoming) && row.saved === row.incoming,
  }))
})
const attributions = computed(() =>
  (review.value?.attributions || []).map((html) => {
    const document = new DOMParser().parseFromString(html, 'text/html')
    const anchor = document.querySelector('a')
    let url = ''
    try {
      const candidate = new URL(anchor?.getAttribute('href') || '')
      if (
        candidate.protocol === 'https:' &&
        !candidate.username &&
        !candidate.password
      )
        url = candidate.toString()
    } catch {
      /* Display attribution text when its link is not safe. */
    }
    return { text: document.body.textContent || '', url }
  })
)
async function show() {
  const request = ++sequence
  const placeId = props.place.id
  open.value = true
  review.value = null
  error.value = ''
  loading.value = true
  try {
    const user = await useRequireUser()
    const token = await user.getIdToken()
    if (request !== sequence || props.place.id !== placeId) return
    const result = await $fetch<GooglePlaceReview>(
      `/api/places/${encodeURIComponent(placeId)}/google`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (request !== sequence || props.place.id !== placeId) return
    if (result.placeId !== placeId)
      throw new Error('Google returned a different venue.')
    review.value = result
  } catch (cause) {
    if (request === sequence) {
      const response = cause as { data?: { statusMessage?: string } }
      error.value =
        response.data?.statusMessage ||
        'Google details could not be loaded. This venue may not have a matching Google Place ID.'
    }
  } finally {
    if (request === sequence) loading.value = false
  }
}
</script>
<style scoped>
.google-review__head,
.google-review__row {
  display: grid;
  grid-template-columns: minmax(5rem, 0.65fr) repeat(2, minmax(0, 1fr));
  gap: 1rem;
}
.google-review__head {
  padding-bottom: 0.75rem;
}
.google-review__row {
  border-top: 1px solid var(--ui-border);
  padding-block: 1rem;
  font-size: 0.875rem;
}
.google-review__value {
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.google-attribution {
  font-family: Roboto, sans-serif;
  font-style: normal;
  font-weight: 400;
  font-size: 0.75rem;
  letter-spacing: normal;
  white-space: nowrap;
  color: var(--ui-text-highlighted);
}
@media (max-width: 30rem) {
  .google-review__head,
  .google-review__row {
    grid-template-columns: minmax(4rem, 0.6fr) repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
}
</style>
