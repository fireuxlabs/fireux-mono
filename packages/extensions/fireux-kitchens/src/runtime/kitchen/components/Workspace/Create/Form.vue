<template>
  <form class="grid max-w-md gap-3" @submit.prevent="submit">
    <WorkspaceKitchenActiveCard
      v-if="manifestComplete && manifestKitchen"
      :kitchen="manifestKitchen"
      draft
    />

    <div
      class="kitchen-identity-widget grid items-center gap-3 rounded-xl border border-default bg-elevated/40 p-3"
    >
      <MoleculesFormsEditableImagePicker
        :src="imagePreview"
        :alt="searchName || 'Kitchen'"
        :initials="initials"
        size="3xl"
        icon="i-lucide-camera"
        button-label="Choose Kitchen image"
        :disabled="working"
        :update="selectImage"
        class="kitchen-image-picker"
      />

      <div class="grid min-w-0 gap-2">
        <UInput
          v-model="query"
          placeholder="Kitchen name"
          autofocus
          :disabled="working"
        />
        <UInput v-model="tagline" placeholder="Tagline" :disabled="working" />
      </div>
    </div>

    <div v-if="results.length" class="grid gap-2">
      <button
        v-for="result in results"
        :key="result.id"
        type="button"
        :disabled="working"
        class="flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition"
        :class="
          selection?.placeId === result.id
            ? 'border-primary bg-primary/5'
            : 'border-default hover:bg-elevated'
        "
        @click="selectPlace(result)"
      >
        <UAvatar
          :src="result.imageUrl || undefined"
          icon="i-lucide-store"
          size="md"
        />
        <span class="min-w-0 flex-1">
          <span class="block truncate font-medium text-highlighted">
            {{ result.name }}
          </span>
          <span
            v-if="resultAddress(result)"
            class="block truncate text-sm text-muted"
          >
            {{ resultAddress(result) }}
          </span>
        </span>
        <UIcon
          v-if="selection?.placeId === result.id"
          name="i-lucide-check"
          class="size-4 text-primary"
        />
      </button>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      title="Kitchen could not be created"
      :description="error"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { usePlaceUpdate } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceUpdate'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import {
  usePlaceSearch,
  type PlaceSearchCell,
} from 'fireux-places/runtime/place/composables/usePlaceSearch'
import { useKitchenCreate } from '../../../composables/firestore/mutations/useKitchenCreate'
import { useKitchenInterface } from '../../../composables/firestore/utils/view/useKitchenInterface'
import type { Kitchen } from '../../../models/kitchen.model'
import { readKitchenPresentationIdentity } from '../../../utils/kitchen-presentation'

const emit = defineEmits<{
  (event: 'created', id: string): void
  (event: 'manifested', id: string): void
}>()
const { createKitchen } = useKitchenCreate()
const { currentUser } = useAuth()
const { appId } = useFireUXConfig()
const { uploadImage } = useImageStorage()
const { query, results } = usePlaceSearch({
  debugLabel: 'kitchens',
  type: 'kitchen',
})
const selection = ref<{ placeId: string; name: string } | null>(null)
const tagline = ref('')
const manifestId = ref('')
const firestoreRead = useFirestoreRead()
const manifestRoot = firestoreRead.firestoreFetchDoc<Partial<Kitchen>>(
  'kitchens',
  manifestId
)
const manifestPlace = firestoreRead.firestoreFetchDoc<Partial<Place>>(
  'places',
  manifestId
)
const { surface: kitchenSurface } = useKitchenInterface()
const manifestKitchen = computed(() =>
  kitchenSurface({
    kitchen: manifestRoot.value,
    place: manifestPlace.value,
  })
)
const manifestComplete = computed(() => {
  const presentation = readKitchenPresentationIdentity(manifestKitchen.value)
  return Boolean(
    presentation.displayName &&
      presentation.tagline &&
      (presentation.cardImageUrl ||
        presentation.imageUrl ||
        presentation.logoImageUrl)
  )
})
const image = ref<File | null>(null)
const imagePreview = ref('')
const error = ref('')
const working = ref(false)
const searchName = computed(() => query.value.trim())
const canSubmit = computed(() => Boolean(selection.value || searchName.value))
const initials = computed(() =>
  (searchName.value || 'K')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
)
let writeQueue = Promise.resolve()

function enqueue(write: () => Promise<void>) {
  writeQueue = writeQueue.then(write, write)
  return writeQueue
}

watch(query, (value) => {
  selection.value = null
  error.value = ''
  const name = value.trim()
  if (!name) return
  void enqueue(async () => {
    const firstManifest = !manifestId.value
    const result = await createKitchen({
      name,
      ...(manifestId.value
        ? { kitchen_id: manifestId.value }
        : currentUser.value?.uid
          ? { kitchen_id: currentUser.value.uid }
          : {}),
    })
    manifestId.value = result.id
    if (firstManifest) emit('manifested', result.id)
    if (tagline.value.trim()) {
      const placeUpdate = usePlaceUpdate({
        authority: { appId, kitchenId: result.id },
      })
      await placeUpdate.updateTagline(tagline.value, { id: result.id })
    }
  }).catch(showError)
})

watch(tagline, (value) => {
  const kitchenId = manifestId.value
  if (!kitchenId) return
  void enqueue(async () => {
    const placeUpdate = usePlaceUpdate({
      authority: { appId, kitchenId },
    })
    await placeUpdate.updateTagline(value, { id: kitchenId })
  }).catch(showError)
})

function resultAddress(value: PlaceSearchCell) {
  return String(value.shortAddress || value.formattedAddress || '').trim()
}

async function selectImage(file: File) {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
  image.value = file
  imagePreview.value = URL.createObjectURL(file)
  const kitchenId = manifestId.value
  if (!kitchenId) return
  await enqueue(async () => {
    const url = await uploadImage(`places/${kitchenId}/avatar`, file)
    const placeUpdate = usePlaceUpdate({
      authority: { appId, kitchenId },
    })
    await placeUpdate.updatePlaceImage(url, { id: kitchenId })
  })
}

onBeforeUnmount(() => {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
})

async function selectPlace(value: PlaceSearchCell) {
  selection.value = {
    placeId: String(value.id || '').trim(),
    name: String(value.name || '').trim(),
  }
  error.value = ''
  await submit()
}

async function submit() {
  if (!canSubmit.value || working.value) return
  working.value = true
  error.value = ''
  try {
    const result = manifestId.value
      ? { id: manifestId.value }
      : await createKitchen(
          selection.value
            ? { place_id: selection.value.placeId }
            : { name: searchName.value }
        )
    const placeId = result.id
    const placeUpdate = usePlaceUpdate({
      authority: { appId, kitchenId: result.id },
    })
    if (tagline.value.trim()) {
      await placeUpdate.updateTagline(tagline.value, { id: placeId })
    }
    if (image.value) {
      const url = await uploadImage(`places/${placeId}/avatar`, image.value)
      await placeUpdate.updatePlaceImage(url, { id: placeId })
    }
    emit('created', result.id)
    query.value = ''
    tagline.value = ''
    image.value = null
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = ''
    selection.value = null
  } catch (cause) {
    showError(cause)
  } finally {
    working.value = false
  }
}

function showError(cause: unknown) {
  const failure = cause as {
    data?: {
      statusMessage?: unknown
      message?: unknown
    }
    statusMessage?: unknown
    message?: unknown
  }
  const message = String(
    failure.data?.statusMessage ||
      failure.statusMessage ||
      failure.data?.message ||
      failure.message ||
      'Try again.'
  )
  error.value = message
}
</script>

<style scoped>
.kitchen-image-picker {
  margin-bottom: 0;
}

.kitchen-identity-widget {
  grid-template-columns: auto minmax(0, 1fr);
}
</style>
