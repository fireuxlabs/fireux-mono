<template>
  <UCard>
    <template #header><h2 class="font-semibold">Brand</h2></template>
    <div class="space-y-6">
      <section v-for="asset in assets" :key="asset.key" class="brand-asset">
        <div
          class="brand-asset__preview"
          :class="{ 'brand-asset__preview--photo': asset.key === 'image_url' }"
          :style="
            asset.key !== 'image_url'
              ? { background: place.media_backdrop_color || undefined }
              : undefined
          "
        >
          <img
            v-if="place[asset.key]"
            :src="place[asset.key]"
            :alt="asset.label"
          />
          <UIcon v-else :name="asset.icon" class="size-7 text-muted" />
        </div>
        <div class="min-w-0 space-y-2">
          <div>
            <h3 class="text-sm font-medium text-highlighted">
              {{ asset.label }}
            </h3>
            <p class="mt-1 text-xs text-muted">{{ asset.description }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UButton
              :label="place[asset.key] ? 'Change' : 'Add image'"
              icon="i-lucide-image-up"
              size="sm"
              color="neutral"
              variant="soft"
              :loading="busy === asset.key"
              :disabled="Boolean(busy)"
              @click="inputs[asset.key]?.click()"
            />
            <UButton
              v-if="place[asset.key]"
              label="Remove"
              size="sm"
              color="neutral"
              variant="ghost"
              :disabled="Boolean(busy)"
              @click="remove(asset)"
            />
          </div>
          <input
            :ref="
              (element) => {
                inputs[asset.key] = element as HTMLInputElement | null
              }
            "
            type="file"
            accept="image/*"
            class="sr-only"
            :aria-label="`Upload ${asset.label.toLowerCase()}`"
            :disabled="Boolean(busy)"
            @change="upload(asset, $event)"
          />
        </div>
      </section>
      <PlaceEditBackdrop
        :place="place"
        :mutation-authority="mutationAuthority"
        :can-write="!busy"
      />
      <div v-if="error" role="alert" class="text-sm text-error">
        {{ error }}
        <FireCopyError :message="error" />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Place } from '../../models/place.model'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import {
  usePlaceUpdate,
  type PlaceMutationAuthority,
} from '../../composables/firestore/mutations/usePlaceUpdate'
const props = defineProps<{
  place: Place
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const { uploadImage } = useImageStorage()
const {
  updatePlaceImage,
  updateLogoImage,
  updateWordmarkImage,
  captureIntent,
} = usePlaceUpdate({ authority: () => props.mutationAuthority })
const assets = [
  {
    key: 'image_url',
    path: 'image',
    label: 'Profile image',
    description: 'Used when no logo is set. Square images work best.',
    icon: 'i-lucide-image',
    update: updatePlaceImage,
  },
  {
    key: 'logo_image',
    path: 'logo',
    label: 'Logo',
    description: 'Your main brand mark. A transparent square works best.',
    icon: 'i-lucide-shapes',
    update: updateLogoImage,
  },
  {
    key: 'wordmark_image',
    path: 'wordmark',
    label: 'Wordmark',
    description: 'A wide version of your name or logo.',
    icon: 'i-lucide-type',
    update: updateWordmarkImage,
  },
] as const
type Asset = (typeof assets)[number]
const inputs: Partial<Record<Asset['key'], HTMLInputElement | null>> = {}
const busy = ref<Asset['key'] | null>(null)
const error = ref('')
async function upload(asset: Asset, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || busy.value) return
  busy.value = asset.key
  error.value = ''
  const id = props.place.id
  const isCurrent = captureIntent()
  try {
    if (!file.type.startsWith('image/'))
      throw new Error('Choose an image file.')
    if (file.size > 10 * 1024 * 1024)
      throw new Error('Choose an image smaller than 10 MB.')
    const url = await uploadImage(
      `places/${id}/${asset.path}/revisions/${crypto.randomUUID()}`,
      file
    )
    if (!isCurrent()) return
    await asset.update(url, { id })
  } catch (cause) {
    if (!isCurrent()) return
    error.value =
      cause instanceof Error ? cause.message : 'Image could not be saved.'
  } finally {
    busy.value = null
  }
}
async function remove(asset: Asset) {
  if (busy.value) return
  busy.value = asset.key
  error.value = ''
  try {
    await asset.update('', { id: props.place.id })
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : 'Image could not be removed.'
  } finally {
    busy.value = null
  }
}
</script>

<style scoped>
.brand-asset {
  display: grid;
  grid-template-columns: 6rem minmax(0, 1fr);
  gap: 1rem;
  align-items: center;
}
.brand-asset__preview {
  display: grid;
  place-items: center;
  padding: 0.75rem;
  aspect-ratio: 1;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: 1rem;
  overflow: hidden;
}
.brand-asset__preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.brand-asset__preview--photo {
  padding: 0;
}
.brand-asset__preview--photo img {
  object-fit: cover;
}
</style>
