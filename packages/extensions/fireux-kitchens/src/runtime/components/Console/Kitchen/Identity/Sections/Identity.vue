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
          <span class="truncate">Identity</span>
          <span class="truncate text-xs font-normal text-dimmed">
            Manage guest-facing credentials, theme, and more.
          </span>
        </span>
      </span>
    </UButton>

    <template #content>
      <div class="mt-4 space-y-4">
        <UCard>
          <template #header>
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-store"
                class="mt-1 size-5 shrink-0 text-muted"
              />
              <div>
                <div class="text-base font-semibold text-highlighted">
                  Public Identity
                </div>
                <p class="text-sm text-dimmed">
                  What guests and operators see when this kitchen appears.
                </p>
              </div>
            </div>
          </template>

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

            <div class="md:col-span-2 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div class="flex flex-col items-center gap-2">
                <MoleculesFormsFirestoreImagePicker
                  v-if="canWrite"
                  :src="logoImageUrl"
                  :alt="name || 'Kitchen logo'"
                  :initials="logoInitials"
                  :update-function="handleLogoUpload"
                />
                <UAvatar
                  v-else
                  :src="logoImageUrl || undefined"
                  :alt="name || 'Kitchen logo'"
                  :text="logoInitials"
                  icon="i-lucide-image"
                  size="3xl"
                  :class="logoShadeClass"
                />

                <p
                  v-if="logoUploading"
                  class="text-xs text-dimmed"
                >
                  Uploading logo...
                </p>
              </div>

              <div class="space-y-4">
                <div>
                  <p class="text-sm font-medium text-highlighted">
                    Logo
                  </p>
                  <p class="text-xs text-dimmed">
                    {{ logoHelpText }}
                  </p>
                </div>

                <UButton
                  v-if="placeId"
                  size="sm"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-map-pin"
                  :to="`/console/kitchen/identity/place`"
                >
                  Open linked Place
                </UButton>
              </div>
            </div>

            <div class="md:col-span-2 space-y-2">
              <div>
                <p class="text-sm font-medium text-highlighted">
                  Logo tone
                </p>
                <p class="text-xs text-dimmed">
                  Adds the opposite backing behind transparent logos when needed.
                </p>
              </div>

              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="option in imageShadeOptions"
                  :key="option.value"
                  size="sm"
                  color="neutral"
                  :variant="imageShade === option.value ? 'solid' : 'soft'"
                  :disabled="!canWrite"
                  @click="handleImageShade(option.value)"
                >
                  {{ option.label }}
                </UButton>
              </div>
            </div>

            <p class="md:col-span-2 text-sm text-dimmed">
              Address, map, and contact live on the linked Place.
            </p>
          </div>
        </UCard>

        <ConsoleKitchenIdentitySectionsPlaceTheme />
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch'
import type {
  KitchenImageShade,
  KitchenUpdateInput,
} from '../../../../../models/kitchen.model'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const { updateKitchen } = useKitchenUpdate()
const { uploadImage } = useImageStorage()
const { updateDocument } = useFirestoreUpdate()
const toast = useToastify()

const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const tagline = computed(() => readKitchenIdentity(props.kitchen).tagline)
const imageShade = computed(() => readKitchenIdentity(props.kitchen).imageShade)
const slug = computed(() => String(props.kitchen?.slug ?? ''))
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
const { place } = usePlaceFetch(placeId)
const logoImageUrl = computed(() =>
  String(
    place.value?.image_url ||
      place.value?.cover_image ||
      readKitchenIdentity(props.kitchen).imageUrl ||
      ''
  ).trim()
)
const logoInitials = computed(() => {
  const parts = name.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const logoShadeClass = computed(() => {
  if (imageShade.value === 'light') return 'fx-avatar-shade--light'
  if (imageShade.value === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
const logoHelpText = computed(() =>
  placeId.value
    ? 'Logo is owned by the linked Place and synced back to kitchen menus and cards.'
    : 'Standalone kitchen logo used by menus and cards.'
)
const logoUploading = ref(false)
const imageShadeOptions: Array<{
  value: KitchenImageShade
  label: string
}> = [
  { value: 'none', label: 'No backing' },
  { value: 'light', label: 'Light logo' },
  { value: 'dark', label: 'Dark logo' },
]

const updateIdentityField = async (
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
  updateIdentityField(
    { 'identity.display_name': value },
    'Display name updated',
    'Failed to update display name'
  )

const handleTagline = async (value: string) =>
  updateIdentityField(
    { 'identity.tagline': value },
    'Tagline updated',
    'Failed to update tagline'
  )

const handleImageShade = async (value: KitchenImageShade) => {
  if (placeId.value) {
    await updateDocument<Place>(PlaceStorage.collection, placeId.value, {
      image_shade: value,
    } as Partial<Place>)
  }

  return updateIdentityField(
    {
      'identity.image_shade': value,
      image_shade: value,
    },
    'Logo tone updated',
    'Failed to update logo tone'
  )
}

const handleLogoUpload = async (file: File) => {
  if (!props.canWrite || !props.kitchenId || logoUploading.value) return

  logoUploading.value = true
  try {
    const storagePath = placeId.value
      ? `places/${placeId.value}/avatar`
      : `kitchens/${props.kitchenId}/identity/logo/current`
    const url = await uploadImage(storagePath, file)

    if (placeId.value) {
      await updateDocument<Place>(PlaceStorage.collection, placeId.value, {
        image_url: url,
      } as Partial<Place>)
    }

    await updateIdentityField(
      {
        'identity.image_url': url,
        display_image_url: url,
        image_url: url,
      },
      'Logo updated',
      'Failed to update logo'
    )
  } finally {
    logoUploading.value = false
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
  updateIdentityField(
    { slug: formatSlugField(value) },
    'Slug updated',
    'Failed to update slug'
  )
</script>
