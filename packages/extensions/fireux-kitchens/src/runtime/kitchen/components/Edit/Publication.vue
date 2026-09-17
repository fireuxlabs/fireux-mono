<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: put Kitchen directory publication in Kitchen identity onboarding. -->
<template>
  <UPageCard
    title="Directory visibility"
    :description="statusDescription"
    variant="subtle"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UBadge :color="isVisible ? 'success' : 'neutral'" variant="soft">{{
        statusTitle
      }}</UBadge>
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
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'
import { readKitchenVisibility } from '../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { publishKitchen, unpublishKitchen } = useKitchenUpdate()
const saving = ref(false)
const slug = computed(() => String(props.kitchen?.slug ?? '').trim())
const isVisible = computed(() => readKitchenVisibility(props.kitchen))
const statusTitle = computed(() =>
  isVisible.value ? 'Visible in directory' : 'Hidden from directory'
)
const statusDescription = computed(() => {
  if (isVisible.value) {
    return 'This Kitchen is listed in the Kitchen directory.'
  }
  if (!slug.value) return 'Set a Kitchen slug before showing it.'
  return 'This Kitchen is not listed in the Kitchen directory.'
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
        kitchenId: props.kitchenId,
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
