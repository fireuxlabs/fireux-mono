<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">
        {{
          format === 'document'
            ? 'Create document Menu'
            : 'Create interactive Menu'
        }}
      </h2></template
    >
    <form class="space-y-3" @submit.prevent="save">
      <UFormField label="Menu name"
        ><USelect
          v-if="subscription === 'free'"
          v-model="name"
          :items="['Main', 'Drinks']"
          :disabled="busy || !canCreateMenu" />
        <UInput
          v-else
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
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useMenuRecordNavigation } from '../../../../composables/workspace/menus/useMenuRecordNavigation'
const { openView } = useMenuRecordNavigation()
import { useKitchenMenusContextSource } from '../../../../composables/workspace/menus/useKitchenMenusContext'
const {
  createMenu,
  kitchenId,
  canCreateMenu,
  menuCreateBlockedMessage,
  subscription,
} = useKitchenMenusContextSource()
const name = ref('')
const { format = 'interactive' } = defineProps<{
  format?: 'interactive' | 'document'
}>()
watch(
  subscription,
  (tier) => {
    if (tier === 'free' && !['Main', 'Drinks'].includes(name.value))
      name.value = 'Main'
  },
  { immediate: true }
)
const description = ref('')
const busy = ref(false)
const error = ref('')
const route = useRoute()
const captureScope = useMenuEditorScope(
  [kitchenId, name, description, () => format, () => route.fullPath],
  () => {
    busy.value = false
    error.value = ''
  }
)
async function save() {
  if (!canCreateMenu.value || busy.value) return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  try {
    const menu = await createMenu({
      name: name.value.trim(),
      description: description.value.trim(),
      format,
    })
    if (!isCurrent()) return
    await openView(menu.slug, 'content')
  } catch (caught) {
    if (!isCurrent()) return
    error.value =
      caught instanceof Error ? caught.message : 'Could not create menu.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
