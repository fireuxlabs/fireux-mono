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
