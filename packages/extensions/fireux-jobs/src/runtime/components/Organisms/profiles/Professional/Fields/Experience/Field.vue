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
        <div class="flex items-center gap-2">
          <UBadge color="primary" variant="soft" size="xs">Editing</UBadge>
          <div class="font-medium">Edit experience details</div>
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
      </template>

      <UForm :state="item" class="space-y-6" @submit.prevent="emit('save')">
        <section class="space-y-3">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <MoleculesPill
              :avatar="displayAvatar || ''"
              :title="organizationLabel"
              :subtitle="locationLabel || '—'"
            />
          </div>
          <p class="text-xs text-neutral-500">
            Place link is fixed. Contact support if the wrong place was chosen.
          </p>
        </section>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormGroup label="Role" name="role">
            <UInput
              v-model="item.role"
              placeholder="Role (e.g. Sous Chef)"
              autocomplete="off"
            />
          </UFormGroup>

          <UFormGroup
            label="Responsibilities"
            name="responsibilities"
            class="md:col-span-2"
          >
            <UTextarea
              v-model="item.responsibilities"
              :rows="3"
              placeholder="Key responsibilities or accomplishments"
            />
          </UFormGroup>
        </div>

        <div class="space-y-4">
          <div class="text-sm font-medium text-neutral-700">Timeline</div>

          <div class="grid gap-4 md:grid-cols-2">
            <UFormGroup label="Start month" name="from_month">
              <USelect
                v-model="item.from_month"
                :items="monthOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select month"
              />
            </UFormGroup>

            <UFormGroup label="Start year" name="from_year">
              <USelect
                v-model="item.from_year"
                :items="yearOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select year"
                searchable
              />
            </UFormGroup>
          </div>

          <div
            class="flex items-center gap-3 text-sm font-medium text-neutral-900"
          >
            <USwitch v-model="item.ongoing" />
            <span>Ongoing</span>
          </div>

          <div v-if="!item.ongoing" class="grid gap-4 md:grid-cols-2">
            <UFormGroup label="End month" name="to_month">
              <USelect
                v-model="item.to_month"
                :items="monthOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select month"
              />
            </UFormGroup>

            <UFormGroup label="End year" name="to_year">
              <USelect
                v-model="item.to_year"
                :items="yearOptions"
                option-attribute="label"
                value-attribute="value"
                placeholder="Select year"
                searchable
              />
            </UFormGroup>
          </div>
        </div>
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
import { computed, ref, watch } from 'vue'
import type { Place } from 'fireux-places/runtime/models/place.model.ts'
import { usePlaces } from 'fireux-places/runtime/composables/usePlaces.ts'

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

const hydratedPlace = ref<Place | null>(null)

let stopWatchingPlace: (() => void) | null = null

watch(
  () => canonicalPlaceId(props.item?.place_id),
  (id) => {
    stopWatchingPlace?.()
    stopWatchingPlace = null

    if (!id) {
      hydratedPlace.value = null
      return
    }

    const placeDoc = fetchPlaceDoc(id)
    stopWatchingPlace = watch(
      placeDoc,
      (next) => {
        hydratedPlace.value = next ?? null
      },
      { immediate: true }
    )
  },
  { immediate: true }
)

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

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const span = 50
  return Array.from({ length: span + 6 }, (_, index) => {
    const year = currentYear + 1 - index
    return { label: year.toString(), value: year.toString() }
  })
})

watch(
  () => props.item?.ongoing,
  (ongoing) => {
    if (ongoing && props.item) {
      props.item.to_month = null
      props.item.to_year = null
    }
  }
)
</script>
