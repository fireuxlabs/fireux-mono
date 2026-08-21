<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: put Kitchen directory publication in Kitchen identity onboarding. -->
<template>
  <MoleculesDisclosurePanel
    title="Directory"
    description="Choose whether this Kitchen appears in the Kitchen directory."
    icon="i-lucide-map"
  >
    <UPageCard
      :title="statusTitle"
      :description="statusDescription"
      variant="subtle"
    >
      <UButton
        :color="isVisible ? 'neutral' : 'primary'"
        :variant="isVisible ? 'soft' : 'solid'"
        :icon="isVisible ? 'i-lucide-eye-off' : 'i-lucide-eye'"
        :loading="saving"
        :disabled="!canWrite || saving || (!isVisible && !slug)"
        @click="togglePublication"
      >
        {{ isVisible ? 'Hide from directory' : 'Show in directory' }}
      </UButton>
    </UPageCard>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenPublish } from '../../composables/firestore/mutations/useKitchenPublish'
import { readKitchenVisibility } from '../../utils/kitchen-spine'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { publishKitchen, unpublishKitchen } = useKitchenPublish()
const saving = ref(false)
const slug = computed(() => String(props.kitchen?.slug ?? '').trim())
const isVisible = computed(() => readKitchenVisibility(props.kitchen))
const statusTitle = computed(() =>
  isVisible.value ? 'Visible in directory' : 'Hidden from directory'
)
const statusDescription = computed(() => {
  if (isVisible.value) {
    return 'This Kitchen appears in /kitchens and discovery surfaces.'
  }
  if (!slug.value) return 'Set a Kitchen slug before showing it.'
  return 'Show the Kitchen when its linked Place and identity are ready.'
})

async function togglePublication() {
  if (!props.canWrite || !props.kitchenId || saving.value) return

  saving.value = true
  try {
    if (isVisible.value) {
      await unpublishKitchen(props.kitchenId)
      toast.success('Kitchen hidden from the directory')
    } else {
      await publishKitchen({
        id: props.kitchenId,
        slug: slug.value,
      })
      toast.success('Kitchen shown in the directory')
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
