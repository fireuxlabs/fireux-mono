<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: put Kitchen directory publication in Kitchen identity onboarding. -->
<template>
  <MoleculesDisclosurePanel
    title="Directory"
    description="Choose whether this Kitchen appears in the public Kitchen directory."
    icon="i-lucide-map"
  >
    <UPageCard
      :title="statusTitle"
      :description="statusDescription"
      variant="subtle"
    >
      <UButton
        :color="isPublished ? 'neutral' : 'primary'"
        :variant="isPublished ? 'soft' : 'solid'"
        :icon="isPublished ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :loading="saving"
        :disabled="!canWrite || saving || (!isPublished && !slug)"
        @click="togglePublication"
      >
        {{ isPublished ? 'Hide from directory' : 'Publish to directory' }}
      </UButton>
    </UPageCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenPublish } from '../../../../../composables/fireux/firestore/kitchen/mutations/useKitchenPublish'
import { readKitchenIdentity, readKitchenVisibility } from '../../../../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { publishKitchen, unpublishKitchen } = useKitchenPublish()
const saving = ref(false)
const slug = computed(() => String(props.kitchen?.slug ?? '').trim())
const displayName = computed(() => readKitchenIdentity(props.kitchen).displayName)
const isPublished = computed(() => readKitchenVisibility(props.kitchen).show)
const statusTitle = computed(() =>
  isPublished.value ? 'Listed publicly' : 'Not listed'
)
const statusDescription = computed(() => {
  if (isPublished.value) {
    return 'This Kitchen can appear in /kitchens and public discovery surfaces.'
  }
  if (!slug.value) return 'Set a Kitchen slug before publishing it.'
  return 'Publish when the linked Place and Kitchen identity are ready.'
})

async function togglePublication() {
  if (!props.canWrite || !props.kitchenId || saving.value) return

  saving.value = true
  try {
    if (isPublished.value) {
      await unpublishKitchen(props.kitchenId)
      toast.success('Kitchen hidden from the directory')
    } else {
      await publishKitchen({
        id: props.kitchenId,
        slug: slug.value,
        ...(displayName.value ? { displayName: displayName.value } : {}),
      })
      toast.success('Kitchen published to the directory')
    }
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Kitchen publication failed.'
    )
  } finally {
    saving.value = false
  }
}
</script>
