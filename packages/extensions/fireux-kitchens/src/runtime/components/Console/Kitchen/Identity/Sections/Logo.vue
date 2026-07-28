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
                :avatar-class="logoShadeClass"
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
                  This Kitchen identity is the single source for its logo.
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
                  v-if="placeId"
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
import { computed } from 'vue'
import { useKitchenLogoUpdate } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenLogoUpdate'
import type { KitchenImageShade } from '../../../../../models/kitchen.model'
import { readKitchenIdentity } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  collectionPath: string
  canWrite: boolean
}>()

const toast = useToastify()

const identity = computed(() => readKitchenIdentity(props.kitchen))
const name = computed(() => identity.value.displayName)
const placeId = computed(() => String(props.kitchen?.place_id ?? '').trim())
const {
  pending: logoUploading,
  uploadKitchenLogo,
  updateKitchenLogoShade,
} = useKitchenLogoUpdate({
  collectionPath: computed(() => props.collectionPath),
})
const imageShade = computed(
  () => identity.value.imageShade as KitchenImageShade
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
const logoShadeClass = computed(() => {
  if (imageShade.value === 'light') return 'fx-avatar-shade--light'
  if (imageShade.value === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
const imageShadeOptions: Array<{
  value: KitchenImageShade
  label: string
}> = [
  { value: 'none', label: 'No backing' },
  { value: 'light', label: 'Light logo' },
  { value: 'dark', label: 'Dark logo' },
]

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

const handleImageShade = async (value: KitchenImageShade) => {
  if (!props.canWrite) return
  return updateLogo(
    () => updateKitchenLogoShade(props.kitchenId, value),
    'Logo tone updated',
    'Failed to update logo tone'
  )
}

const handleLogoUpload = async (file: File) => {
  if (!props.canWrite || logoUploading.value) return

  return updateLogo(
    async () => {
      await uploadKitchenLogo(props.kitchenId, file)
    },
    'Logo updated',
    'Failed to update logo'
  )
}
</script>
