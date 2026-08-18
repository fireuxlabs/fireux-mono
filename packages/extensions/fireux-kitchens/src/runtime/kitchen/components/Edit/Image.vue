<template>
  <MoleculesDisclosurePanel
    title="Kitchen image"
    description="Optional Kitchen-owned image used before falling back to linked Place photography."
    icon="i-lucide-image"
  >
    <UCard class="mt-4">
      <div class="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <MoleculesFormsFirestoreImagePicker
          v-if="canWrite"
          :src="imageUrl"
          :alt="name || 'Kitchen image'"
          :initials="initials"
          avatar-class="!rounded-xl"
          :update-function="handleUpload"
        />
        <UAvatar
          v-else
          :src="imageUrl || undefined"
          :alt="name || 'Kitchen image'"
          :text="initials"
          size="3xl"
          class="!rounded-xl"
        />
        <div>
          <p class="text-sm font-medium text-highlighted">Primary image</p>
          <p class="text-xs text-dimmed">
            Recommended: 1200 × 1200 px. Leave blank to inherit the linked Place image.
          </p>
          <p v-if="pending" class="mt-2 text-xs text-dimmed">Uploading image…</p>
        </div>
      </div>
    </UCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useKitchenAssetUpdate } from '../../composables/firestore/mutations/useKitchenAssetUpdate'
import { readKitchenIdentity } from '../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const identity = computed(() => readKitchenIdentity(props.kitchen))
const imageUrl = computed(() => identity.value.imageUrl)
const name = computed(() => identity.value.displayName)
const initials = computed(() => {
  const parts = (name.value || 'Kitchen').split(/\s+/).filter(Boolean)
  return parts.length > 1
    ? `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
    : (parts[0] || 'K').slice(0, 2).toUpperCase()
})
const toast = useToastify()
const { pending, uploadKitchenAsset } = useKitchenAssetUpdate()

async function handleUpload(file: File) {
  if (!props.canWrite || pending.value) return
  try {
    await uploadKitchenAsset(props.kitchenId, 'image', file)
    toast.success('Kitchen image updated')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update Kitchen image: ${message}`)
    throw error
  }
}
</script>
