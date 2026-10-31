<template>
  <form
    class="workspace-surface workspace-surface--compact"
    @submit.prevent="save"
  >
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
    /></UFormField>
    <UFormField label="Description (optional)"
      ><UTextarea
        v-model="description"
        :maxlength="800"
        :disabled="busy || !canCreateMenu"
    /></UFormField>
    <p v-if="menuCreateBlockedMessage" class="fx-type-caption">
      {{ menuCreateBlockedMessage }}
    </p>
    <div v-if="error" class="menu-editor-error">
      <p>{{ error }}</p>
      <FireCopyError :message="error" />
    </div>
    <UButton
      type="submit"
      icon="i-lucide-plus"
      :loading="busy"
      :disabled="!canCreateMenu || !name.trim()"
      >Create menu</UButton
    >
  </form>
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
const name = defineModel<string>('name', { default: '' })
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
  [kitchenId, name, description, () => route.fullPath],
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
      format: 'interactive',
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
