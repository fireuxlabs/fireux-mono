# Professional Experience Stack

Current source for the professional experience flow under `packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Fields/Experience/`.

## Create.vue

```vue
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
```

````

## Field.vue
```vue
<template>
  <!-- Display Mode -->
  <div v-if="mode === 'display'" class="space-y-3">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <MoleculesPill
          :avatar="displayAvatar || ''"
          :title="organizationLabel"
          :subtitle="item.role || '—'"
        />
      </div>
      <UButton
        size="xs"
        variant="soft"
        icon="i-lucide-pencil"
        @click="emit('edit')"
      >
        Edit
      </UButton>
    </div>

    <div class="flex flex-wrap items-center gap-2 text-sm">
      <UBadge color="neutral" variant="soft">{{ dateRange }}</UBadge>
      <UBadge v-if="item.ongoing" color="primary" variant="soft"
        >Ongoing</UBadge
      >
      <div
        v-if="locationLabel"
        class="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-2 py-1 text-xs text-neutral-600"
      >
        <UIcon name="i-lucide-map-pin" class="h-3 w-3" />
        <span class="truncate max-w-[12rem] sm:max-w-xs">{{
          locationLabel
        }}</span>
      </div>
    </div>

    <div
      v-if="item.responsibilities"
      class="text-sm text-gray-700 whitespace-pre-line"
    >
      {{ item.responsibilities }}
    </div>
  </div>

  <!-- Edit Mode -->
  <div
    v-else
    class="rounded-xl bg-gradient-to-r from-primary-500/70 via-primary-400/50 to-neutral-200/50 p-[1.5px] shadow-lg"
  >
    <UCard class="h-full rounded-[inherit] bg-white/95">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="soft" size="xs">Editing</UBadge>
            <div class="font-medium">Edit experience place</div>
          </div>
          <UButton
            v-if="hasRemoveAction"
            icon="i-lucide-trash-2"
            color="error"
            variant="soft"
            size="xs"
            @click="emit('remove')"
          >
            Remove
          </UButton>
        </div>
      </template>

      <UForm :state="item" class="space-y-4" @submit.prevent="emit('save')">
        <UFormGroup label="Place ID" name="place_id">
          <UInput
            v-model="item.place_id"
            placeholder="e.g., ChIJDx…"
            autocomplete="off"
          />
        </UFormGroup>

        <UAlert
          icon="i-lucide-info"
          color="primary"
          variant="soft"
          class="text-sm"
        >
          Only the canonical Google Place ID is required right now. Additional
          fields will be added once the place is set.
        </UAlert>
      </UForm>

      <div class="flex justify-end gap-2 pt-4">
        <UButton
          size="sm"
          variant="soft"
          color="neutral"
          @click="emit('cancel')"
        >
          Cancel
        </UButton>
        <UButton
          size="sm"
          variant="solid"
          color="primary"
          @click="emit('save')"
        >
          Save
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, type Ref } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { usePlaces } from 'fireux-places/runtime/composables/usePlaces'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'save'): void
  (e: 'cancel'): void
  (e: 'remove'): void
}>()

const props = defineProps<{
  item: any
  index: number
  mode: 'display' | 'edit'
  remove?: () => void
}>()

const { place: fetchPlaceDoc } = usePlaces()

const placeRef = shallowRef<Ref<Place | undefined> | null>(null)

watch(
  () => canonicalPlaceId(props.item?.place_id),
  (id) => {
    placeRef.value = id ? fetchPlaceDoc(id) : null
  },
  { immediate: true }
)

const hydratedPlace = computed(() => placeRef.value?.value ?? null)

const displayAvatar = computed(() => {
  const avatarFromPlace = hydratedPlace.value?.avatar
  if (avatarFromPlace) return avatarFromPlace
  const manual = (props.item?.image_url ?? '').toString().trim()
  return manual || undefined
})

const organizationLabel = computed(() => {
  const placeName = hydratedPlace.value?.name?.trim()
  if (placeName) return placeName
  const name = (props.item?.name ?? '').toString().trim()
  if (name) return name
  const placeId = canonicalPlaceId(props.item?.place_id)
  if (placeId) return `Linked place ${placeId}`
  return `Experience #${props.index + 1}`
})

const locationLabel = computed(() => {
  const placeFormatted = hydratedPlace.value?.formatted_address?.trim()
  if (placeFormatted) return placeFormatted
  const placeShort = hydratedPlace.value?.short_address?.trim()
  if (placeShort) return placeShort
  const formatted = (props.item?.formatted_address ?? '').toString().trim()
  if (formatted) return formatted
  const shortAddr = (props.item?.short_address ?? '').toString().trim()
  return shortAddr || null
})

const fromLabel = computed(() => {
  const month = (props.item?.from_month ?? '').toString().trim()
  const year = (props.item?.from_year ?? '').toString().trim()
  const label = [month, year].filter(Boolean).join(' ')
  return label || '—'
})

const toLabel = computed(() => {
  if (props.item?.ongoing) return 'Present'
  const month = (props.item?.to_month ?? '').toString().trim()
  const year = (props.item?.to_year ?? '').toString().trim()
  const label = [month, year].filter(Boolean).join(' ')
  return label || '—'
})

const dateRange = computed(() => `${fromLabel.value} — ${toLabel.value}`)

const hasRemoveAction = computed(() => typeof props.remove === 'function')

function canonicalPlaceId(id: string | null | undefined) {
  const normalized = (id ?? '').toString().trim()
  if (!normalized) return null
  return normalized.replace(/^places\//, '') || null
}
</script>
````

## Section.vue

```vue
<template>
  <section class="space-y-6">
    <h3 class="text-base font-semibold">{{ title }}</h3>

    <div class="space-y-6">
      <MoleculesFormsFirestoreObjectArray
        ref="listRef"
        :label="title"
        :firebase-value="items"
        :update-function="onSave"
      >
        <template #display="{ item, index, startEditing }">
          <OrganismsProfilesProfessionalFieldsExperienceField
            :item="item"
            :index="index"
            mode="display"
            @edit="startEditing?.()"
          />
        </template>

        <template #edit="{ item, index, remove }">
          <OrganismsProfilesProfessionalFieldsExperienceField
            :item="item"
            :index="index"
            mode="edit"
            :remove="remove"
            @save="listRef?.saveItemEditing?.()"
            @cancel="listRef?.cancelItemEditing?.()"
            @remove="() => handleRemove(index, remove)"
          />
        </template>

        <template #create="{ push }">
          <OrganismsProfilesProfessionalFieldsExperienceCreate
            :loading="isSavingNew"
            @save="(payload) => handleCreateSave(payload, push)"
          />
        </template>
      </MoleculesFormsFirestoreObjectArray>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue'
import type { ExperienceItem } from '../../../../../../models/profiles/Professional.model'

const props = defineProps<{
  title: string
  items: ExperienceItem[]
  onSave: (items: ExperienceItem[]) => Promise<void> | void
}>()

const { title, items, onSave } = toRefs(props)

const listRef = ref<any | null>(null)
const isSavingNew = ref(false)

function handleRemove(index: number, remove?: () => void) {
  if (typeof remove !== 'function') return

  const item = items.value?.[index]
  const primaryLabel =
    (item?.name as string | undefined)?.trim() ||
    (item?.role as string | undefined)?.trim() ||
    null
  const label = primaryLabel ? `“${primaryLabel}”` : `item #${index + 1}`

  if (typeof window !== 'undefined') {
    const confirmed = window.confirm(
      `Remove ${label}? This action can’t be undone.`
    )
    if (!confirmed) return
  }

  remove()
}

async function handleCreateSave(
  payload: ExperienceItem,
  push: (item: ExperienceItem) => void
) {
  if (isSavingNew.value) return
  const placeId = (payload?.place_id || '').trim()
  if (!placeId) return
  if (!listRef.value) return

  isSavingNew.value = true
  try {
    push({
      ...payload,
      place_id: placeId,
    })
    await listRef.value.saveItemEditing?.()
  } finally {
    isSavingNew.value = false
  }
}
</script>
```
