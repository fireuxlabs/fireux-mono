<template>
  <div v-if="menu && menu.schedule !== 'daily' && canManage" class="space-y-3">
    <UButton
      label="Remove Menu"
      color="error"
      variant="outline"
      @click="open = true"
    />
    <MoleculesCopyError v-if="error" :message="error" />
    <UModal
      v-model:open="open"
      :title="`Remove ${menu.name}?`"
      description="This removes the Menu and withdraws its public link. Catalogue items stay saved. The Menu will not be recreated automatically. This cannot be undone."
    >
      <template #body>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="open = false"
          />
          <UButton
            label="Remove Menu"
            color="error"
            :loading="busy"
            :disabled="busy"
            @click="remove"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { navigateTo } from '#imports'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuDelete } from '../../../../../menu/composables/firestore/mutations/useMenuDelete'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
const { menu, menuId, menuSlug, kitchenId, canManage } =
  useKitchenMenuRecordContext()
const { deleteMenu } = useMenuDelete()
const open = ref(false),
  busy = ref(false),
  error = ref('')
const captureScope = useMenuEditorScope([kitchenId, menuSlug], () => {
  open.value = false
  busy.value = false
  error.value = ''
})
async function remove() {
  if (!canManage.value || !menuId.value || busy.value) return
  const isCurrent = captureScope()
  busy.value = true
  error.value = ''
  try {
    await deleteMenu(kitchenId.value, menuId.value)
    if (isCurrent()) await navigateTo('/workspace/kitchen/menus')
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Could not remove Menu.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
