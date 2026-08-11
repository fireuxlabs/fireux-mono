<template>
  <!-- Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: make Kitchen identity fields explicit optional overrides of Place. -->
  <MoleculesDisclosurePanel
    title="Kitchen"
    description="Name, slug, tagline, and menu theme."
    icon="i-lucide-store"
  >
    <div class="mt-4 space-y-4">
        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Kitchen name override"
                :firebase-value="name"
                placeholder="Inherit the Place name"
                :maxlength="120"
                :disabled="!canWrite"
                disabled-message="This kitchen is read-only."
                :update-function="handleName"
              />
            </div>

            <MoleculesFormsFirestoreSimpleField
              label="Slug"
              :firebase-value="slug"
              placeholder="luna-piccante"
              :maxlength="80"
              :disabled="!canWrite"
              disabled-message="This kitchen is read-only."
              :validation-function="validateSlugField"
              :formatting-function="formatSlugField"
              :update-function="handleSlug"
            />

            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Tagline"
                :firebase-value="tagline"
                placeholder="Short service tagline"
                :maxlength="120"
                :disabled="!canWrite"
                disabled-message="This kitchen is read-only."
                :update-function="handleTagline"
              />
            </div>

            <div class="md:col-span-2 rounded-lg border border-default bg-muted/30 p-3">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-highlighted">
                    Cover image
                  </p>
                  <p class="text-xs text-dimmed">
                    1280 x 720 public kitchen hero.
                  </p>
                </div>

                <UButton
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-image-up"
                  :disabled="!canWrite || coverUploading"
                  :loading="coverUploading"
                  @click="triggerCoverInput"
                >
                  {{ coverImage ? 'Change cover' : 'Add cover' }}
                </UButton>

                <input
                  ref="coverInputRef"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleCoverFile"
                >
              </div>

              <div class="mt-3 aspect-video overflow-hidden rounded-lg bg-elevated">
                <img
                  v-if="coverImage"
                  :src="coverImage"
                  :alt="`${name || 'Kitchen'} cover image`"
                  class="size-full object-cover"
                >
                <div
                  v-else
                  class="flex size-full items-center justify-center text-xs text-dimmed"
                >
                  1280 x 720
                </div>
              </div>
            </div>

            <div class="md:col-span-2">
              <UButton
                color="neutral"
                variant="soft"
                icon="i-lucide-palette"
                to="/console/kitchen/identity/theme"
              >
                Open theme
              </UButton>
            </div>
          </div>
        </UCard>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { usePlaceUpdate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import {
  readKitchenIdentity,
} from '../../../../../utils/kitchen-spine'

const COVER_WIDTH = 1280
const COVER_HEIGHT = 720

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const { appId } = useFireUXConfig()
const { updateCoverImage } = usePlaceUpdate({
  authority: () => ({ appId, kitchenId: props.kitchenId }),
})
const { requireWritableData } = useConsoleWriteGuard('kitchen')
const toast = useToastify()

const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const tagline = computed(() => readKitchenIdentity(props.kitchen).tagline)
const slug = computed(() => String(props.kitchen?.slug ?? ''))
const coverImage = computed(() => String(props.kitchen?.cover_image ?? '').trim())
const { uploadImage } = useImageStorage()
const coverInputRef = ref<HTMLInputElement | null>(null)
const coverUploading = ref(false)

const updateKitchenField = async (
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) => {
  if (!props.canWrite) {
    throw new Error('This kitchen is read-only.')
  }

  if (!props.kitchenId) {
    throw new Error('No kitchen selected.')
  }

  try {
    await updateKitchen(props.kitchenId, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateKitchenField(
    { 'identity.name': value },
    'Display name updated',
    'Failed to update display name'
  )

const handleTagline = async (value: string) =>
  updateKitchenField(
    { 'identity.tagline': value },
    'Tagline updated',
    'Failed to update tagline'
  )

function triggerCoverInput() {
  if (!props.canWrite || coverUploading.value) return
  coverInputRef.value?.click()
}

async function handleCoverFile(event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return
  if (!props.canWrite) {
    toast.error('This kitchen is read-only.')
    if (input) input.value = ''
    return
  }
  if (!props.kitchenId) {
    toast.error('No kitchen selected.')
    if (input) input.value = ''
    return
  }

  coverUploading.value = true
  try {
    const kitchenId = props.kitchenId
    const placeId = String(props.kitchen?.place_id ?? '').trim()
    if (!placeId) throw new Error('The linked Place is required.')
    const coverBlob = await resizeImageToCover(file)
    requireWritableData()
    if (!props.canWrite || props.kitchenId !== kitchenId) {
      throw new Error('The selected Kitchen changed before the cover upload.')
    }
    const url = await uploadImage(`places/${placeId}/cover`, coverBlob)
    requireWritableData()
    if (!props.canWrite || props.kitchenId !== kitchenId) {
      throw new Error('The selected Kitchen changed before the cover could be saved.')
    }
    await updateCoverImage(url, { id: placeId })
    toast.add({ title: 'Cover image updated', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const description =
      error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to prepare cover image: ${description}`)
    throw error
  } finally {
    coverUploading.value = false
    if (input) input.value = ''
  }
}

const formatSlugField = (value: string) =>
  normalizeSlug(value, { maxLength: 80 })

const validateSlugField = (value: string) => {
  const validation = validateSlug(formatSlugField(value), {
    label: 'Kitchen slug',
    namespace: KitchenStorage.collection,
    reservedScope: 'root',
    maxLength: 80,
  })

  return {
    isValid: validation.isValid,
    message: validation.message,
  }
}

const handleSlug = async (value: string) =>
  updateKitchenField(
    { slug: formatSlugField(value) },
    'Slug updated',
    'Failed to update slug'
  )

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read image file.'))
    }
    image.src = objectUrl
  })
}

async function resizeImageToCover(file: File): Promise<Blob> {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare image.')

  canvas.width = COVER_WIDTH
  canvas.height = COVER_HEIGHT

  const sourceRatio = image.width / image.height
  const targetRatio = COVER_WIDTH / COVER_HEIGHT
  const sourceWidth = sourceRatio > targetRatio
    ? image.height * targetRatio
    : image.width
  const sourceHeight = sourceRatio > targetRatio
    ? image.height
    : image.width / targetRatio
  const sourceX = (image.width - sourceWidth) / 2
  const sourceY = (image.height - sourceHeight) / 2

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    COVER_WIDTH,
    COVER_HEIGHT
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Could not export image.'))
      },
      'image/jpeg',
      0.88
    )
  })
}
</script>
