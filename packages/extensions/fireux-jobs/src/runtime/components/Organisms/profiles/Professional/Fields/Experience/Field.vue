<template>
  <!-- Display Mode -->
  <div class="space-y-3" v-if="mode === 'display'">
    <div class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <MoleculesPill
          :avatar="placeAvatar || ''"
          :title="placeTitle"
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

    <div class="flex items-center gap-2">
      <UBadge color="neutral" variant="soft">{{ dateRange }}</UBadge>
      <UBadge v-if="item.ongoing" color="primary" variant="soft"
        >Ongoing</UBadge
      >
    </div>

    <UBadge
      v-if="placeAddress"
      color="neutral"
      variant="soft"
      class="max-w-full overflow-hidden"
    >
      <UIcon name="i-lucide-map-pin" class="shrink-0" />
      <span class="truncate">{{ placeAddress }}</span>
    </UBadge>

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
            <UBadge color="primary" variant="soft" size="xs"> Editing </UBadge>
            <div class="font-medium">Edit {{ placeTitle }}</div>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormGroup label="Linked place" name="place_id">
            <div class="space-y-3">
              <UCard v-if="hasLinkedPlaceDetails" :ui="{ body: 'space-y-3' }">
                <div class="flex items-start gap-3">
                  <UAvatar
                    :src="placeAvatar || undefined"
                    :alt="placeTitle"
                    size="md"
                    icon="i-lucide-map-pin"
                  />
                  <div class="flex-1 space-y-1">
                    <p class="font-medium">{{ placeTitle }}</p>
                    <p class="text-sm text-gray-500">
                      {{ placeAddress || '—' }}
                    </p>
                    <UBadge
                      v-if="item.place_id"
                      color="neutral"
                      variant="soft"
                      size="xs"
                      class="font-mono"
                    >
                      {{ item.place_id }}
                    </UBadge>
                  </div>
                </div>

                <div class="flex flex-wrap items-center justify-end gap-2">
                  <UButton
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-map-pin"
                    @click="openPlacePicker"
                  >
                    Change place
                  </UButton>
                  <UButton
                    size="xs"
                    variant="soft"
                    color="error"
                    icon="i-lucide-x"
                    @click="clearLinkedPlace"
                  >
                    Remove link
                  </UButton>
                </div>
              </UCard>

              <div
                v-else
                class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <UButton
                  color="primary"
                  variant="soft"
                  icon="i-lucide-map-pin"
                  @click="openPlacePicker"
                >
                  Link a place
                </UButton>
                <p class="text-xs text-gray-500 sm:text-right">
                  Linking a place pre-fills the organization and address in the
                  dashboard. You can still tweak the details afterward.
                </p>
              </div>
            </div>
          </UFormGroup>
          <UFormGroup label="Role / Title" name="role">
            <UInput v-model="item.role" placeholder="e.g., Sous Chef" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <UFormGroup label="From" name="from">
            <div class="grid grid-cols-2 gap-2">
              <USelect
                v-model="item.from_month"
                :options="months"
                placeholder="Month"
              />
              <USelect
                v-model="item.from_year"
                :options="years"
                placeholder="Year"
              />
            </div>
          </UFormGroup>

          <UFormGroup label="To" name="to">
            <div class="grid grid-cols-2 gap-2">
              <USelect
                v-model="item.to_month"
                :options="months"
                placeholder="Month"
                :disabled="item.ongoing"
              />
              <USelect
                v-model="item.to_year"
                :options="years"
                placeholder="Year"
                :disabled="item.ongoing"
              />
            </div>
          </UFormGroup>
        </div>

        <div class="flex items-center justify-between">
          <UCheckbox v-model="item.ongoing" label="Ongoing / Present" />
        </div>

        <UFormGroup label="Responsibilities" name="responsibilities">
          <UTextarea
            v-model="item.responsibilities"
            :rows="4"
            placeholder="What did you do?"
          />
        </UFormGroup>
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

  <USlideover
    v-if="mode === 'edit'"
    v-model:open="isPlacePickerOpen"
    side="right"
    :ui="{ body: 'p-0', width: 'w-full sm:max-w-xl' }"
  >
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-base font-semibold text-gray-900">Select a place</p>
          <p class="text-sm text-gray-500">
            Search Google Places and link it to this experience entry.
          </p>
        </div>
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          icon="i-lucide-x"
          @click="isPlacePickerOpen = false"
        />
      </div>
    </template>

    <OrganismsPlacesSearchSection
      :key="placePickerKey"
      mode="select"
      :initial-query="initialPlaceQuery"
      @place:selected="handlePlaceSelected"
    />

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="soft"
          color="neutral"
          @click="isPlacePickerOpen = false"
        >
          Close
        </UButton>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
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

type PlaceSelectionPayload = {
  place: Place
  cell: PlaceCard.Cell
}

const { place: fetchPlaceDoc, savePlace } = usePlaces()

const placeRef = shallowRef<Ref<Place | undefined> | null>(null)
const previewPlace = ref<Place | null>(null)

const hydratedPlace = computed(() => placeRef.value?.value ?? null)
const activePlace = computed(() => previewPlace.value ?? hydratedPlace.value)

const manualName = computed(() => {
  const raw = (props.item?.name ?? '').toString().trim()
  return raw.length ? raw : null
})

const placeTitle = computed(
  () => activePlace.value?.name ?? manualName.value ?? 'Linked place'
)
const placeAvatar = computed(() => activePlace.value?.avatar ?? undefined)

const placeAddress = computed(() => {
  if (activePlace.value?.formatted_address) {
    return activePlace.value.formatted_address
  }
  const formatted = (props.item?.formatted_address ?? '').toString().trim()
  if (formatted) return formatted
  const shortAddr = (props.item?.short_address ?? '').toString().trim()
  return shortAddr
})

const months = [
  { label: 'Jan', value: 'Jan' },
  { label: 'Feb', value: 'Feb' },
  { label: 'Mar', value: 'Mar' },
  { label: 'Apr', value: 'Apr' },
  { label: 'May', value: 'May' },
  { label: 'Jun', value: 'Jun' },
  { label: 'Jul', value: 'Jul' },
  { label: 'Aug', value: 'Aug' },
  { label: 'Sep', value: 'Sep' },
  { label: 'Oct', value: 'Oct' },
  { label: 'Nov', value: 'Nov' },
  { label: 'Dec', value: 'Dec' },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 60 }, (_, i) => currentYear - i).map(
  (y) => ({ label: String(y), value: String(y) })
)

const fromLabel = computed(() => {
  const m = props.item?.from_month || '—'
  const y = props.item?.from_year || '—'
  return `${m} ${y}`.trim()
})

const toLabel = computed(() => {
  if (props.item?.ongoing) return 'Present'
  const m = props.item?.to_month
  const y = props.item?.to_year
  const val = [m, y].filter(Boolean).join(' ')
  return val || '—'
})

const dateRange = computed(() => `${fromLabel.value} — ${toLabel.value}`)

const hasRemoveAction = computed(() => typeof props.remove === 'function')

const isPlacePickerOpen = ref(false)
const placePickerKey = ref(0)

watch(
  () => canonicalPlaceId(props.item?.place_id),
  (id) => {
    if (!id) {
      placeRef.value = null
      return
    }
    placeRef.value = fetchPlaceDoc(id)
  },
  { immediate: true }
)

const initialPlaceQuery = computed(() => {
  const name = placeTitle.value.trim()
  if (name && name !== 'Linked place') return name
  const addressValue = placeAddress.value.trim()
  if (addressValue) return addressValue
  return ''
})

const hasLinkedPlace = computed(() => !!props.item?.place_id)
const hasLinkedPlaceDetails = computed(
  () =>
    hasLinkedPlace.value &&
    !!(placeTitle.value && placeTitle.value !== 'Linked place')
)

function openPlacePicker() {
  placePickerKey.value += 1
  isPlacePickerOpen.value = true
}

function clearLinkedPlace() {
  if (props.item) {
    delete props.item.place_id
    delete props.item.short_address
    delete props.item.formatted_address
    delete props.item.image_url
    delete props.item.name
  }
  previewPlace.value = null
}

function handlePlaceSelected({ place, cell }: PlaceSelectionPayload) {
  const canonicalId = canonicalPlaceId(place.place_id)

  if (props.item) {
    props.item.place_id = canonicalId
    previewPlace.value = {
      ...place,
      avatar: sanitizeAvatar(cell.avatar ?? place.avatar ?? null) ?? null,
    }
  }

  savePlace(place).catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[experience][place] failed to save place', error)
  })

  isPlacePickerOpen.value = false
}

function canonicalPlaceId(id?: string | null) {
  return (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')
}

function sanitizeAvatar(value?: string | null) {
  if (!value) return undefined
  const normalized = value.toLowerCase()
  if (normalized.includes('mapfiles/place_api/icons')) return undefined
  return value
}
</script>
