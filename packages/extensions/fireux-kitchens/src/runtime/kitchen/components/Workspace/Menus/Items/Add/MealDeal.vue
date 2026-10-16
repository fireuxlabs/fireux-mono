<template>
  <UCard v-if="section && menu?.schedule !== 'daily'">
    <template #header
      ><h2 class="text-base font-semibold">Add a meal deal</h2></template
    >
    <MoleculesCopyError
      v-if="promotions.error.value"
      :message="String(promotions.error.value)"
    />
    <p v-else-if="promotions.pending.value" role="status">
      Loading meal deals…
    </p>
    <div v-else class="flex flex-wrap items-end gap-3">
      <UFormField label="Meal deal">
        <select
          v-model="promotionId"
          aria-label="Choose meal deal"
          :disabled="saving || !canWrite"
          class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm"
        >
          <option value="">Select a meal deal</option>
          <option v-for="deal in available" :key="deal.id" :value="deal.id">
            {{ deal.name }}{{ deal.status === 'paused' ? ' (paused)' : '' }}
          </option>
        </select>
      </UFormField>
      <UButton
        icon="i-lucide-plus"
        :loading="saving"
        :disabled="!canWrite || !promotionId || saving"
        @click="add"
        >Add meal deal</UButton
      >
      <UButton to="/workspace/kitchen/promotions" color="neutral" variant="link"
        >Manage promotions</UButton
      >
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenWorkspaceMenuSection } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import { useMenuEditorScope } from '../../../../../../menu/composables/useMenuEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
const {
  kitchenId,
  menuId,
  sectionId,
  section,
  menu,
  promotions,
  itemRows,
  canWrite,
  createItem,
} = useKitchenWorkspaceMenuSection()
const promotionId = ref('')
const saving = ref(false)
const toast = useToastify()
const available = computed(() =>
  promotions.items.value.filter(
    (deal) =>
      'groups' in deal &&
      !itemRows.value.some((row) => row.promotionId === deal.id)
  )
)
watch(available, (deals) => {
  if (!deals.some((deal) => deal.id === promotionId.value))
    promotionId.value = ''
})
const captureScope = useMenuEditorScope([kitchenId, menuId, sectionId], () => {
  saving.value = false
  promotionId.value = ''
})
async function add() {
  if (!canWrite.value || !promotionId.value || saving.value) return
  const current = captureScope()
  saving.value = true
  try {
    await createItem({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      sectionId: sectionId.value,
      promotionId: promotionId.value,
    })
    if (!current()) return
    promotionId.value = ''
    toast.add({ title: 'Meal deal added to Menu', color: 'success' })
  } catch (error) {
    if (current())
      toast.add({
        title: 'Could not add meal deal',
        description:
          error instanceof Error ? error.message : 'Please try again.',
        color: 'error',
      })
  } finally {
    if (current()) saving.value = false
  }
}
</script>
