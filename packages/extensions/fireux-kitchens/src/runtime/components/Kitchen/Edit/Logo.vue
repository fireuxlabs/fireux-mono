<template>
  <MoleculesDisclosurePanel
    title="Kitchen logo"
    description="The logo used across this Kitchen's Console, menus, and cards."
    icon="i-lucide-image"
  >
    <div class="mt-4 space-y-4">
      <UCard>
        <div class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <div class="flex flex-col items-center gap-2">
            <MoleculesFormsFirestoreImagePicker
              v-if="canWrite"
              :src="logoImageUrl"
              :alt="name || 'Kitchen logo'"
              :initials="logoInitials"
              avatar-class="!rounded-xl"
              :style="{ backgroundColor: effectiveBackdropColor || undefined }"
              :update-function="handleLogoUpload"
            />
            <UAvatar
              v-else
              :src="logoImageUrl || undefined"
              :alt="name || 'Kitchen logo'"
              :text="logoInitials"
              icon="i-lucide-image"
              size="3xl"
              class="!rounded-xl"
              :style="{ backgroundColor: effectiveBackdropColor || undefined }"
            />

            <p v-if="logoUploading" class="text-xs text-dimmed">
              Uploading logo...
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-highlighted">Logo</p>
              <p class="text-xs text-dimmed">
                Current Kitchen logo. Recommended: 1024 × 1024 px, transparent
                PNG.
              </p>
            </div>

            <div class="space-y-2">
              <p class="text-sm font-medium text-highlighted">
                Transparent-media backdrop
              </p>
              <p class="text-xs text-dimmed">
                Applied behind transparent Kitchen logos and wordmarks. The
                Kitchen inherits the linked Place colour until overridden.
              </p>

              <div class="flex flex-wrap items-center gap-2">
                <input
                  v-model="backdropDraft"
                  type="color"
                  class="h-9 w-12 rounded border border-default bg-transparent p-1"
                  :disabled="!canWrite"
                  aria-label="Kitchen media backdrop colour"
                />
                <UInput
                  v-model="backdropDraft"
                  class="w-36"
                  placeholder="#ffffff"
                  :disabled="!canWrite"
                  @blur="saveBackdrop"
                  @keyup.enter="saveBackdrop"
                />
                <UButton
                  size="sm"
                  color="neutral"
                  variant="ghost"
                  :disabled="!canWrite || !identity.mediaBackdropColor"
                  @click="clearBackdrop"
                >
                  Inherit Place
                </UButton>
              </div>
              <p class="text-xs text-dimmed">
                Effective colour: {{ effectiveBackdropColor || 'not set' }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="placeId"
                size="sm"
                color="neutral"
                variant="soft"
                icon="i-lucide-map-pin"
                :to="`/places/${encodeURIComponent(placeId)}/edit`"
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
import { computed, ref, watch } from 'vue'
import { useKitchenAssetUpdate } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenAssetUpdate'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'
import type { KitchenMediaBackdropColor } from '../../../models/kitchen.model'
import { readKitchenIdentity } from '../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()

const identity = computed(() => readKitchenIdentity(props.kitchen))
const name = computed(() => identity.value.displayName)
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
const {
  pending: logoUploading,
  uploadKitchenAsset,
  updateKitchenBackdrop,
} = useKitchenAssetUpdate()
const placeBackdropColor = computed(() =>
  String((props.kitchen as any)?.media_backdrop_color || '').trim()
)
const effectiveBackdropColor = computed(
  () => identity.value.mediaBackdropColor || placeBackdropColor.value
)
const backdropDraft = ref(identity.value.mediaBackdropColor || '')
watch(
  () => identity.value.mediaBackdropColor,
  (value: string) => {
    backdropDraft.value = value || ''
  }
)
const logoImageUrl = computed(() =>
  String(identity.value.logoImageUrl || '').trim()
)
const logoInitials = computed(() => {
  const label = name.value || 'Kitchen'
  const parts = label.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const updateLogo = async (
  action: () => Promise<void>,
  successTitle: string,
  failTitle: string
) => {
  if (!props.canWrite) {
    throw new Error('This kitchen is read-only.')
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

const saveBackdrop = async () => {
  if (!props.canWrite) return
  const color = normalizeHexColor(backdropDraft.value)
  if (color === null) {
    toast.error('Use a 6-digit hex colour.')
    return
  }
  return updateLogo(
    () =>
      updateKitchenBackdrop(
        props.kitchenId,
        color as KitchenMediaBackdropColor | ''
      ),
    'Media backdrop updated',
    'Failed to update media backdrop'
  )
}

const clearBackdrop = async () => {
  backdropDraft.value = ''
  await saveBackdrop()
}

const handleLogoUpload = async (file: File) => {
  if (!props.canWrite || logoUploading.value) return

  return updateLogo(
    async () => {
      await uploadKitchenAsset(props.kitchenId, 'logo', file)
    },
    'Logo updated',
    'Failed to update logo'
  )
}
</script>
