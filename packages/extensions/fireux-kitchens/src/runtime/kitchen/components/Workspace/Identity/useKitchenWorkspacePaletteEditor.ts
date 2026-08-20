import { computed, ref } from 'vue'
import type { WorkspacePalette } from 'fireux-core/types/theme'
import { useWorkspaceWriteGuard } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceIdentity } from '../../../composables/workspace/identity/useKitchenWorkspaceIdentity'

const fallbackWorkspacePalette: WorkspacePalette = {
  canvas: '#f8fafc',
  text: '#0f172a',
  accent: '#0f766e',
  accent_contrast: '#f8fafc',
}

export function useKitchenWorkspacePaletteEditor() {
  const { selectedKitchen, kitchenId, canWrite, dataType, refreshTargets } =
    useKitchenWorkspaceIdentity()
  const { requireWritableData } = useWorkspaceWriteGuard('kitchen')
  const toast = useToastify()
  const saving = ref(false)
  const saveState = ref('')
  const palette = computed<WorkspacePalette>(() => {
    const kitchen = selectedKitchen.value as
      | { workspace_theme?: { palette?: WorkspacePalette } }
      | null
    return kitchen?.workspace_theme?.palette || fallbackWorkspacePalette
  })
  const canSave = computed(() => canWrite.value && dataType.value === 'live')

  async function save(next: WorkspacePalette) {
    if (!kitchenId.value || !canSave.value || saving.value) return
    saving.value = true
    saveState.value = 'Saving...'
    try {
      const user = await useRequireUser()
      requireWritableData('live')
      await $fetch('/api/workspace/kitchen/theme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { kitchen_id: kitchenId.value, palette: next },
      })
      await refreshTargets()
      saveState.value = 'Saved'
    } catch (error) {
      saveState.value = 'Save failed'
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to update Workspace palette: ${message}`)
    } finally {
      saving.value = false
    }
  }

  return { palette, canSave, saving, saveState, save }
}
