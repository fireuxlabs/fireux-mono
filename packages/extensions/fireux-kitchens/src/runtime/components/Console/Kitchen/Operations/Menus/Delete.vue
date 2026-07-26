<template>
  <UCard v-if="menu && canWrite">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">
          Delete menu
        </h2>
        <p class="text-sm text-dimmed">
          Permanently remove this Menu record.
        </p>
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
import { navigateTo } from '#imports'
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenu'
import { useMenuDelete } from '../../../../../composables/fireux/firestore/menu/mutations/useMenuDelete'

const {
  menu,
  menuId,
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleMenu()

const toast = useToastify()
const { deleteMenu } = useMenuDelete({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const deleting = ref(false)
const text = (value: unknown) => String(value ?? '').trim()

const deleteSelectedMenu = async () => {
  if (!canWrite.value || !menu.value || deleting.value) return

  const title = text(menu.value.name) || text(menuId.value) || 'this menu'
  const ok = window.confirm(
    `Delete menu "${title}"?\n\nThis permanently deletes the Menu record and cannot be undone.`
  )
  if (!ok) return

  deleting.value = true

  try {
    await deleteMenu(kitchenId.value, menuId.value)
    toast.add({ title: 'Menu deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/console/kitchen/menus')
  } catch (error) {
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
    deleting.value = false
  }
}
</script>
