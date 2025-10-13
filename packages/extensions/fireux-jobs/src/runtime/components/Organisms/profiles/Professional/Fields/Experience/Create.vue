<template>
  <div class="space-y-4">
    <OrganismsPlacesSearchBar v-model="searchQuery" />

    <OrganismsPlacesSearchDropdown
      v-if="!selectedPlace && searchResults.length"
      :cells="searchResults"
      @select="handleResultSelect"
    />

    <p v-if="isSearching" class="text-xs text-neutral-500">Searching…</p>
    <p v-else-if="showEmpty" class="text-xs text-neutral-500">
      No matching places yet.
    </p>
    <p v-if="searchError" class="text-xs text-rose-600">{{ searchError }}</p>
    <p v-else-if="searchSuccess" class="text-xs text-emerald-600">
      Place saved to Firestore.
    </p>

    <div v-if="!selectedPlace" class="text-xs text-neutral-500">
      Choose the workplace first, then add your role, timeline, and
      responsibilities.
    </div>

    <UCard v-else class="shadow-sm">
      <template #header>
        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between gap-3">
            <MoleculesPill
              :avatar="pillAvatar"
              :title="pillTitle"
              :subtitle="pillSubtitle"
            />
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              :disabled="isBusy"
              @click="resetSelection"
            >
              Change place
            </UButton>
          </div>
          <div
            v-if="lastConfirmedPlace"
            class="flex items-center gap-2 text-xs text-emerald-600"
          >
            <UIcon name="i-lucide-check" class="h-3.5 w-3.5" />
            <span>Place details synced. Update role and timeline below.</span>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Role" name="role">
          <UInput
            v-model="form.role"
            placeholder="e.g., Executive Chef"
            :disabled="isBusy"
          />
        </UFormGroup>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormGroup label="Start month" name="from_month">
            <USelect
              v-model="form.fromMonth"
              :items="monthOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Select month"
              :disabled="isBusy"
            />
          </UFormGroup>
          <UFormGroup label="Start year" name="from_year">
            <USelect
              v-model="form.fromYear"
              :items="yearOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Select year"
              :disabled="isBusy"
            />
          </UFormGroup>
          <UFormGroup label="End month" name="to_month">
            <USelect
              v-model="form.toMonth"
              :items="monthOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Select month"
              :disabled="isBusy || form.ongoing"
            />
          </UFormGroup>
          <UFormGroup label="End year" name="to_year">
            <USelect
              v-model="form.toYear"
              :items="yearOptions"
              option-attribute="label"
              value-attribute="value"
              placeholder="Select year"
              :disabled="isBusy || form.ongoing"
            />
          </UFormGroup>
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
        >
          <div>
            <p class="text-sm font-medium text-neutral-800">
              Still working here
            </p>
            <p class="text-xs text-neutral-500">
              Leave the end date blank if this role is ongoing.
            </p>
          </div>
          <USwitch v-model="form.ongoing" :disabled="isBusy" />
        </div>

        <UFormGroup label="Responsibilities" name="responsibilities">
          <UTextarea
            v-model="form.responsibilities"
            placeholder="Add a short summary of what you do in this role."
            :rows="5"
            :disabled="isBusy"
          />
        </UFormGroup>
      </div>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          size="sm"
          variant="soft"
          color="neutral"
          :disabled="isBusy"
          @click="resetSelection"
        >
          Cancel
        </UButton>
        <UButton
          size="sm"
          color="primary"
          :loading="isBusy"
          :disabled="isBusy"
          @click="submitExperience"
        >
          Save experience
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'
import type {
  BasePlace,
  Place,
  PlaceCard,
} from 'fireux-places/runtime/models/place.model'
import { usePlacesSearchVm } from 'fireux-places/runtime/composables/usePlacesSearch'
import { usePlaceSave } from 'fireux-places/runtime/composables/usePlaceSave'
import {
  canonicalPlaceId,
  fetchPlaceDetails,
} from 'fireux-places/runtime/composables/usePlacesGoogle'
import { useAuth } from '#imports'

interface PlacesSearchConfirmEvent {
  place: BasePlace
  canonicalId: string
  source: BasePlace['source']
  saved: boolean
  storedPlace?: Place
}

const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<(event: 'save', payload: ExperienceItem) => void>()

const selectedPlace = ref<BasePlace | null>(null)
const lastConfirmedPlace = ref<PlacesSearchConfirmEvent | null>(null)
const form = reactive({
  role: '',
  fromMonth: '',
  fromYear: '',
  toMonth: '',
  toYear: '',
  ongoing: false,
  responsibilities: '',
})
const isConfirmingPlace = ref(false)
const searchError = ref<string | null>(null)
const searchSuccess = ref(false)
let successResetTimer: ReturnType<typeof setTimeout> | null = null

const {
  query: searchQuery,
  results: searchResults,
  selected: searchSelection,
  isSearching,
  showEmpty,
  select: selectSearchCell,
  clear: clearSearchSelection,
} = usePlacesSearchVm()

const { savePlace } = usePlaceSave()
const { currentUser } = useAuth()

const monthOptions = [
  { label: 'January', value: 'January' },
  { label: 'February', value: 'February' },
  { label: 'March', value: 'March' },
  { label: 'April', value: 'April' },
  { label: 'May', value: 'May' },
  { label: 'June', value: 'June' },
  { label: 'July', value: 'July' },
  { label: 'August', value: 'August' },
  { label: 'September', value: 'September' },
  { label: 'October', value: 'October' },
  { label: 'November', value: 'November' },
  { label: 'December', value: 'December' },
]
const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years: { label: string; value: string }[] = []
  const span = 60

  for (let year = currentYear + 1; year >= currentYear - span; year -= 1) {
    years.push({ label: year.toString(), value: year.toString() })
  }

  return years
})

const loading = computed(() => props.loading === true)
const isBusy = computed(() => loading.value || isConfirmingPlace.value)
const pillAvatar = computed(
  () =>
    sanitizeAvatar(
      lastConfirmedPlace.value?.storedPlace?.avatar ??
        selectedPlace.value?.avatar ??
        null
    ) || ''
)
const pillTitle = computed(
  () =>
    toCleanString(lastConfirmedPlace.value?.storedPlace?.name) ||
    toCleanString(selectedPlace.value?.name) ||
    'Selected place'
)
const pillSubtitle = computed(
  () =>
    toCleanString(lastConfirmedPlace.value?.storedPlace?.formatted_address) ||
    toCleanString(selectedPlace.value?.formatted_address) ||
    '—'
)

watch(searchSelection, (place) => {
  handleSelect(place)
})

function handleResultSelect(cell: PlaceCard.Cell) {
  searchError.value = null
  selectSearchCell(cell)
}

function handleSelect(place: BasePlace | null) {
  selectedPlace.value = place
  lastConfirmedPlace.value = null
  resetForm()
  searchError.value = null
  searchSuccess.value = false
  clearSuccessTimer()
}

function mapPlaceToExperience({
  place,
  storedPlace,
  canonicalId,
}: PlacesSearchConfirmEvent): ExperienceItem {
  const sourcePlace = storedPlace ?? null
  const formattedAddress =
    toCleanString(sourcePlace?.formatted_address) ||
    toCleanString(place.formatted_address) ||
    undefined
  const avatar = sanitizeAvatar(
    (sourcePlace?.avatar as string | null | undefined) ?? place.avatar ?? null
  )
  const displayName =
    toCleanString(sourcePlace?.name) || toCleanString(place.name) || undefined

  return {
    place_id: canonicalId,
    name: displayName,
    formatted_address: formattedAddress,
    short_address: toShortAddress(formattedAddress),
    image_url: avatar,
  }
}

async function submitExperience() {
  if (!selectedPlace.value || isBusy.value) return

  try {
    const confirmed = await confirmPlaceSelection()
    if (!confirmed) return

    const baseExperience = mapPlaceToExperience(confirmed)
    const experience: ExperienceItem = {
      ...baseExperience,
      role: cleanField(form.role),
      from_month: cleanField(form.fromMonth),
      from_year: cleanField(form.fromYear),
      to_month: form.ongoing ? null : cleanField(form.toMonth),
      to_year: form.ongoing ? null : cleanField(form.toYear),
      ongoing: form.ongoing ? true : undefined,
      responsibilities: cleanField(form.responsibilities),
    }

    emit('save', experience)
    resetSelection()
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.warn('[jobs][experience] save aborted:', error.message)
    }
  }
}

async function confirmPlaceSelection(): Promise<PlacesSearchConfirmEvent | null> {
  const place = selectedPlace.value
  if (!place) return null

  const canonicalId = canonicalPlaceId(place.place_id)
  if (!canonicalId) {
    searchError.value = 'Cannot save place without a valid identifier.'
    return null
  }

  if (
    lastConfirmedPlace.value &&
    lastConfirmedPlace.value.canonicalId === canonicalId
  ) {
    return lastConfirmedPlace.value
  }

  if (!currentUser.value) {
    searchError.value = 'Sign in to save places.'
    throw new Error('Sign in to save places.')
  }

  isConfirmingPlace.value = true
  searchError.value = null
  searchSuccess.value = false

  try {
    const details = await fetchPlaceDetails(canonicalId)
    const payload = details?.stored
      ? {
          ...details.stored,
          avatar: place.avatar ?? details.stored.avatar ?? null,
        }
      : buildFallbackPlace(place, canonicalId)

    await savePlace(payload)

    const event: PlacesSearchConfirmEvent = {
      place: {
        ...place,
        place_id: canonicalId,
        avatar: payload.avatar ?? place.avatar ?? null,
      },
      canonicalId,
      source: place.source,
      saved: true,
      storedPlace: payload,
    }

    lastConfirmedPlace.value = event
    searchSuccess.value = true
    scheduleSuccessReset()

    return event
  } catch (error) {
    searchError.value =
      error instanceof Error
        ? error.message
        : 'Failed to save place to Firestore.'
    throw error
  } finally {
    isConfirmingPlace.value = false
  }
}

function resetSelection() {
  selectedPlace.value = null
  lastConfirmedPlace.value = null
  resetForm()
  clearSearchSelection()
  searchQuery.value = ''
  searchError.value = null
  searchSuccess.value = false
  clearSuccessTimer()
}

function resetForm() {
  form.role = ''
  form.fromMonth = ''
  form.fromYear = ''
  form.toMonth = ''
  form.toYear = ''
  form.ongoing = false
  form.responsibilities = ''
}

function toCleanString(value: string | null | undefined) {
  const normalized = (value ?? '').toString().trim()
  return normalized.length ? normalized : undefined
}

function sanitizeAvatar(value: string | null | undefined) {
  const normalized = (value ?? '').toString().trim()
  return normalized.length ? normalized : undefined
}

function toShortAddress(formatted: string | undefined) {
  if (!formatted) return undefined
  const parts = formatted
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.length === 0) return undefined
  return parts.slice(0, 2).join(', ')
}

function cleanField(value: string) {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

watch(
  () => form.ongoing,
  (ongoing) => {
    if (ongoing) {
      form.toMonth = ''
      form.toYear = ''
    }
  }
)

function buildFallbackPlace(place: BasePlace, canonicalId: string): Place {
  const searchTerm = `${place.name} ${place.formatted_address}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

  return {
    place_id: canonicalId,
    name: place.name,
    formatted_address: place.formatted_address,
    lat: place.lat,
    lng: place.lng,
    source: 'firestore',
    avatar: place.avatar ?? null,
    search_term: searchTerm,
    created_at: new Date(),
  }
}

function scheduleSuccessReset() {
  clearSuccessTimer()
  successResetTimer = setTimeout(() => {
    searchSuccess.value = false
    successResetTimer = null
  }, 3000)
}

function clearSuccessTimer() {
  if (successResetTimer) {
    clearTimeout(successResetTimer)
    successResetTimer = null
  }
}

onBeforeUnmount(() => {
  clearSuccessTimer()
})
</script>
