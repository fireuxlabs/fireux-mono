<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">Create a blank menu</h2></template
    >
    <form class="space-y-3" @submit.prevent="save">
      <UFormField label="Menu name"
        ><UInput
          v-model="name"
          placeholder="Lunch, terrace, tasting…"
          :maxlength="160"
          :disabled="busy || !canCreateMenu"
          class="w-full"
      /></UFormField>
      <UFormField label="Description (optional)"
        ><UTextarea
          v-model="description"
          :maxlength="800"
          :disabled="busy || !canCreateMenu"
          class="w-full"
      /></UFormField>
      <p v-if="menuCreateBlockedMessage" class="text-sm text-muted">
        {{ menuCreateBlockedMessage }}
      </p>
      <div v-if="error" class="text-sm text-error">
        <p>{{ error }}</p>
        <MoleculesCopyError :message="error" />
      </div>
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :loading="busy"
        :disabled="!canCreateMenu || !name.trim()"
        >Create menu</UButton
      >
    </form>
  </UCard>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#imports'
import { useKitchenMenusContextSource } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const { createMenu, canCreateMenu, menuCreateBlockedMessage } =
  useKitchenMenusContextSource()
const name = ref('')
const description = ref('')
const busy = ref(false)
const error = ref('')
async function save() {
  if (!canCreateMenu.value || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const menu = await createMenu({
      name: name.value.trim(),
      description: description.value.trim(),
    })
    await navigateTo(
      `/workspace/kitchen/menus/${encodeURIComponent(menu.id)}/content`
    )
  } catch (caught) {
    error.value =
      caught instanceof Error ? caught.message : 'Could not create menu.'
  } finally {
    busy.value = false
  }
}
</script>
