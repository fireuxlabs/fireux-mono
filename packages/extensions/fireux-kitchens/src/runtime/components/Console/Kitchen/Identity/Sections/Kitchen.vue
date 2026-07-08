<template>
  <UCollapsible>
    <UButton
      class="group"
      color="neutral"
      variant="soft"
      block
      trailing-icon="i-lucide-chevron-down"
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    >
      <span class="flex min-w-0 items-start gap-3 text-left">
        <UIcon
          name="i-lucide-store"
          class="mt-0.5 size-4 shrink-0 text-muted"
        />
        <span class="grid min-w-0">
          <span class="truncate">Kitchen</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Name, slug, tagline, and menu theme.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <div class="mt-4 space-y-4">
        <UCard>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Name"
                :firebase-value="name"
                placeholder="Kitchen display name"
                :maxlength="120"
                :update-function="handleName"
              />
            </div>

            <MoleculesFormsFirestoreSimpleField
              label="Slug"
              :firebase-value="slug"
              placeholder="luna-piccante"
              :maxlength="80"
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
                :update-function="handleTagline"
              />
            </div>

            <MoleculesFormsFirestoreSimpleField
              label="Currency"
              :firebase-value="currencyCode"
              placeholder="ISO code"
              :maxlength="3"
              :validation-function="validateCurrencyCode"
              :formatting-function="formatCurrencyCode"
              :update-function="handleCurrencyCode"
            />

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
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import {
  readKitchenCurrencyCode,
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

const collectionPath = computed(() => props.collectionPath)
const { updateKitchen } = useKitchenUpdate({ collectionPath })
const toast = useToastify()

const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const tagline = computed(() => readKitchenIdentity(props.kitchen).tagline)
const slug = computed(() => String(props.kitchen?.slug ?? ''))
const currencyCode = computed(() => readKitchenCurrencyCode(props.kitchen))
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
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateKitchenField(
    { 'identity.display_name': value },
    'Display name updated',
    'Failed to update display name'
  )

const handleTagline = async (value: string) =>
  updateKitchenField(
    { 'identity.tagline': value },
    'Tagline updated',
    'Failed to update tagline'
  )

const formatCurrencyCode = (value: string) =>
  String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)

const validateCurrencyCode = (value: string) => {
  const next = formatCurrencyCode(value)

  return {
    isValid: /^[A-Z]{3}$/.test(next),
    message: next.length === 3 ? '' : 'Use a 3-letter ISO currency code.',
  }
}

const handleCurrencyCode = async (value: string) =>
  updateKitchenField(
    { currency_code: formatCurrencyCode(value) },
    'Currency updated',
    'Failed to update currency'
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
    const coverBlob = await resizeImageToCover(file)
    const url = await uploadImage(`kitchens/${props.kitchenId}/cover`, coverBlob)
    await updateKitchenField(
      { cover_image: url },
      'Cover image updated',
      'Failed to update cover image'
    )
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
    namespace: KitchenStorage.rootCollection,
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
