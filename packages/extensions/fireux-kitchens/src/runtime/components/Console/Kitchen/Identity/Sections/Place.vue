<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: write Place-owned logo truth through explicit linked-Kitchen authority. -->
  <MoleculesDisclosurePanel
    title="Place"
    description="Logo, location, and public details."
    icon="i-lucide-map-pin"
  >
    <div class="mt-4 space-y-4">
        <UCard>
          <UAlert
            v-if="!placeId"
            color="warning"
            variant="soft"
            title="No linked Place"
            description="This kitchen does not have a linked Place yet."
          />

          <MoleculesStateCard
            v-else-if="pending"
            entity="linked place"
            kind="document"
            surface="bare"
            loading
          />

          <UAlert
            v-else-if="!place"
            color="warning"
            variant="soft"
            title="Linked Place not found"
            :description="`Kitchen points to Place ${placeId}, but that record is not available.`"
          />

          <div v-else class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div class="flex flex-col items-center gap-2">
              <MoleculesFormsFirestoreImagePicker
                v-if="canWrite"
                :src="logoImageUrl"
                :alt="place.name || name || 'Kitchen logo'"
                :initials="logoInitials"
                :avatar-class="logoShadeClass"
                :update-function="handleLogoUpload"
              />
              <UAvatar
                v-else
                :src="logoImageUrl || undefined"
                :alt="place.name || name || 'Kitchen logo'"
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
                  Logo is owned by the linked Place and inherited by Kitchen menus and cards.
                </p>
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium text-highlighted">
                  Logo tone
                </p>
                <p class="text-xs text-dimmed">
                  Adds the opposite backing behind transparent logos when needed.
                </p>

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

              <div class="flex flex-wrap gap-2">
                <UButton
                  size="sm"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-map-pin"
                  to="/console/kitchen/identity/place"
                >
                  Open linked Place
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { usePlaceUpdate } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceUpdate'
import { computed, ref } from 'vue'
import { useKitchenConsolePlace } from '../../../../../composables/fireux/console/kitchen/identity/useKitchenConsolePlace'
import type { KitchenImageShade } from '../../../../../models/kitchen.model'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const { uploadImage } = useImageStorage()
const toast = useToastify()

const name = computed(() => readKitchenIdentity(props.kitchen).displayName)
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
const {
  appId,
  kitchenId: selectedKitchenId,
  place,
  pending,
} = useKitchenConsolePlace()
const mutationAuthority = computed(() => ({
  appId: appId.value,
  kitchenId: selectedKitchenId.value,
}))
const { updateImageShade, updatePlaceImage } = usePlaceUpdate({
  authority: mutationAuthority,
})
const imageShade = computed(() => {
  const placeShade = String(place.value?.image_shade ?? '').trim()
  return (placeShade || readKitchenIdentity(props.kitchen).imageShade) as KitchenImageShade
})
const logoImageUrl = computed(() =>
  String(
    place.value?.image_url ||
      place.value?.cover_image ||
      readKitchenIdentity(props.kitchen).imageUrl ||
      ''
  ).trim()
)
const logoInitials = computed(() => {
  const label = place.value?.name || name.value || 'Kitchen'
  const parts = label.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const logoShadeClass = computed(() => {
  if (imageShade.value === 'light') return 'fx-avatar-shade--light'
  if (imageShade.value === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
const logoUploading = ref(false)
const imageShadeOptions: Array<{
  value: KitchenImageShade
  label: string
}> = [
  { value: 'none', label: 'No backing' },
  { value: 'light', label: 'Light logo' },
  { value: 'dark', label: 'Dark logo' },
]

const updatePlace = async (
  action: () => Promise<void>,
  successTitle: string,
  failTitle: string
) => {
  if (!props.canWrite) {
    throw new Error('This kitchen is read-only.')
  }

  if (!placeId.value) {
    throw new Error('This kitchen has no linked Place.')
  }

  try {
    await action()
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

const handleImageShade = async (value: KitchenImageShade) => {
  if (!props.canWrite) return
  return updatePlace(
    () => updateImageShade(value, { id: placeId.value }),
    'Logo tone updated',
    'Failed to update logo tone'
  )
}

const handleLogoUpload = async (file: File) => {
  if (!props.canWrite || !placeId.value || logoUploading.value) return

  logoUploading.value = true
  try {
    const storagePath = `places/${placeId.value}/avatar`
    const url = await uploadImage(storagePath, file)
    await updatePlace(
      () => updatePlaceImage(url, { id: placeId.value }),
      'Logo updated',
      'Failed to update logo'
    )
  } finally {
    logoUploading.value = false
  }
}
</script>
