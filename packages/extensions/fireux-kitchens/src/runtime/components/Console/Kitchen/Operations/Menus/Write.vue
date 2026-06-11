<template>
  <UCard>
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Create menu</h2>
        <p class="text-sm text-dimmed">Start with a draft, then add sections and dishes.</p>
      </div>
    </template>

    <div class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
      <UFormField label="Name">
        <UInput v-model="name" placeholder="Lunch menu" :disabled="saving || !canWrite" />
      </UFormField>

      <UFormField label="Description">
        <UInput
          v-model="description"
          placeholder="Short guest-facing description"
          :disabled="saving || !canWrite"
        />
      </UFormField>

      <div class="flex items-end">
        <UButton
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canCreate"
          @click="create"
        >
          Create draft
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { kitchenId, canWrite, createMenu } = useKitchenConsoleMenus()
const toast = useToastify()
const name = ref('')
const description = ref('')
const saving = ref(false)

const canCreate = computed(
  () => canWrite.value && Boolean(kitchenId.value) && Boolean(name.value.trim()) && !saving.value
)

async function create() {
  if (!canCreate.value) return
  saving.value = true
  try {
    const created = await createMenu({
      kitchenId: kitchenId.value,
      name: name.value,
      description: description.value,
    })
    const id = String((created as any)?.id || '').trim()
    name.value = ''
    description.value = ''
    toast.add({ title: 'Draft menu created', color: 'success', icon: 'i-lucide-check' })
    if (id) await navigateTo(`/console/kitchen/menus/${encodeURIComponent(id)}`)
  } catch (error) {
    toast.add({
      title: 'Could not create menu',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
