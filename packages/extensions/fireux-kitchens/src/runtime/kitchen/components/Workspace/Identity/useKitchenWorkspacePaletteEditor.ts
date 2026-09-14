import { computed, ref } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { readKitchenThemePalette } from '../../../utils/kitchen-readers'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'

const fallbackWorkspacePalette: WorkspacePalette = {
  canvas: '#f8fafc',
  text: '#0f172a',
  accent: '#0f766e',
  accent_contrast: '#f8fafc',
}

export function useKitchenWorkspacePaletteEditor() {
  const { selectedKitchen, kitchenId, canWrite, outcome } =
    useKitchenWorkspaceIdentity()
  const toast = useToastify()
  const saving = ref(false)
  const saveState = ref('')
  const palette = computed<WorkspacePalette>(() =>
    readKitchenThemePalette(selectedKitchen.value) || fallbackWorkspacePalette
  )
  const canSave = canWrite

  async function save(next: WorkspacePalette) {
    if (!kitchenId.value || !canSave.value || saving.value) return
    const targetId = kitchenId.value
    saving.value = true
    saveState.value = 'Saving...'
    try {
      const user = await useRequireUser()
      if (kitchenId.value !== targetId || !canSave.value) return
      await $fetch('/api/workspace/kitchen/theme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { kitchen_id: targetId, palette: next },
      })
      if (kitchenId.value === targetId) saveState.value = 'Saved'
    } catch (error) {
      saveState.value = 'Save failed'
      const message =
        error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to update Workspace palette: ${message}`)
    } finally {
      saving.value = false
    }
  }

  return { kitchenId, outcome, palette, canSave, saving, saveState, save }
}
