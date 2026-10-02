<template>
  <UCard v-if="menu && canWrite" id="delete-menu">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Delete menu</h2>
        <p class="text-sm text-dimmed">Permanently remove this Menu record.</p>
      </div>
    </template>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      size="sm"
      :loading="deleting"
      @click="deleteSelectedMenu"
    >
      Delete menu
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenMenuRecordContext } from '../../../composables/workspace/menus/useKitchenMenuRecordContext'

const { menu, menuId, kitchenId, canWrite, deleteMenu } =
  useKitchenMenuRecordContext()

const toast = useToastify()
const deleting = ref(false)
const captureScope = useMenuEditorScope([kitchenId, menuId], () => { deleting.value = false })
const text = (value: unknown) => String(value ?? '').trim()

const deleteSelectedMenu = async () => {
  if (!canWrite.value || !menu.value || deleting.value) return

  const title = text(menu.value.name) || text(menuId.value) || 'this menu'
  const ok = window.confirm(
    `Delete menu "${title}"?\n\nThis permanently deletes the Menu record and cannot be undone.`
  )
  if (!ok) return

  const isCurrent = captureScope()
  deleting.value = true

  try {
    await deleteMenu(kitchenId.value, menuId.value)
    if (!isCurrent()) return

  } catch (error) {
    if (!isCurrent()) return
    const message = String(
      (error as any)?.message || error || 'Failed to delete menu'
    )
    toast.add({
      title: 'Menu delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
</script>
