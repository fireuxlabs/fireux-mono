<template>
  <UCard v-if="menu">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Add section</h2>
        <p class="text-sm text-dimmed">Create a section before adding menu items.</p>
      </div>
    </template>

    <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <UFormField label="Section">
        <UInput
          v-model="sectionLabel"
          placeholder="Starters"
          :disabled="saving || !canWrite"
        />
      </UFormField>

      <UFormField label="Description">
        <UInput
          v-model="sectionDescription"
          placeholder="Optional"
          :disabled="saving || !canWrite"
        />
      </UFormField>

      <div class="flex items-end">
        <UButton
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canCreateSection"
          @click="addSection"
        >
          Add section
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'
import { useKitchenMenuSproochliSync } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenMenuSproochliSync'

const {
  menu,
  menuId,
  kitchenId,
  canWrite,
  sections,
  createSection,
} = useKitchenConsoleMenu()
const { markMenuNeedsTranslationRefresh } = useKitchenMenuSproochliSync()
const toast = useToastify()
const saving = ref(false)
const sectionLabel = ref('')
const sectionDescription = ref('')

const canCreateSection = computed(
  () => canWrite.value && Boolean(kitchenId.value && menuId.value && sectionLabel.value.trim()) && !saving.value
)

async function addSection() {
  if (!canCreateSection.value) return
  saving.value = true
  try {
    await createSection({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      label: sectionLabel.value,
      description: sectionDescription.value,
      sort_order: sections.value.length + 1,
    })
    await markMenuNeedsTranslationRefresh(menu.value)
    sectionLabel.value = ''
    sectionDescription.value = ''
    toast.add({ title: 'Section added', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Could not add section',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
