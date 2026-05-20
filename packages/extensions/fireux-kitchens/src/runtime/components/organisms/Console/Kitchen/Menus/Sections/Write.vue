<template>
  <UCard v-if="menu">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Menu details</h2>
        <p class="text-sm text-dimmed">Edit guest-facing menu copy and sections.</p>
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-3 md:grid-cols-3">
        <UFormField label="Name">
          <UInput v-model="name" :disabled="saving || !canWrite" />
        </UFormField>
        <UFormField label="Description">
          <UInput v-model="description" :disabled="saving || !canWrite" />
        </UFormField>
        <UFormField label="Design">
          <select
            v-model="colorMode"
            class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
            :disabled="Boolean(saving) || !canWrite"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </UFormField>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-save"
          :loading="saving === 'menu'"
          :disabled="!canSaveMenu"
          @click="saveMenu"
        >
          Save details
        </UButton>
      </div>

      <div class="rounded-lg border border-default p-3">
        <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <UFormField label="Section">
            <UInput
              v-model="sectionLabel"
              placeholder="Starters"
              :disabled="Boolean(saving) || !canWrite"
            />
          </UFormField>
          <UFormField label="Description">
            <UInput
              v-model="sectionDescription"
              placeholder="Optional"
              :disabled="Boolean(saving) || !canWrite"
            />
          </UFormField>
          <div class="flex items-end">
            <UButton
              icon="i-lucide-plus"
              :loading="saving === 'section'"
              :disabled="!canCreateSection"
              @click="addSection"
            >
              Add section
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'

const {
  menu,
  menuId,
  kitchenId,
  canWrite,
  sections,
  updateMenu,
  createSection,
} = useKitchenConsoleMenu()
const toast = useToastify()
const saving = ref<'' | 'menu' | 'section'>('')
const name = ref('')
const description = ref('')
const colorMode = ref<'light' | 'dark'>('light')
const sectionLabel = ref('')
const sectionDescription = ref('')

watch(
  menu,
  (next) => {
    name.value = next?.name ?? ''
    description.value = next?.description ?? ''
    colorMode.value = next?.design?.color_mode === 'dark' ? 'dark' : 'light'
  },
  { immediate: true }
)

const canSaveMenu = computed(
  () => canWrite.value && Boolean(kitchenId.value && menuId.value && name.value.trim()) && !saving.value
)
const canCreateSection = computed(
  () => canWrite.value && Boolean(kitchenId.value && menuId.value && sectionLabel.value.trim()) && !saving.value
)

async function saveMenu() {
  if (!canSaveMenu.value) return
  saving.value = 'menu'
  try {
    await updateMenu(kitchenId.value, menuId.value, {
      name: name.value.trim(),
      description: description.value.trim(),
      design: { color_mode: colorMode.value },
    })
    toast.add({ title: 'Menu details saved', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Could not save menu',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = ''
  }
}

async function addSection() {
  if (!canCreateSection.value) return
  saving.value = 'section'
  try {
    await createSection({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      label: sectionLabel.value,
      description: sectionDescription.value,
      sort_order: sections.value.length + 1,
    })
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
    saving.value = ''
  }
}
</script>
