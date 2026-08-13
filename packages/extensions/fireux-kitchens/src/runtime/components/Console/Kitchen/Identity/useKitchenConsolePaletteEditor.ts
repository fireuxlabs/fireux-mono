import { computed, ref } from 'vue'
import type { ConsolePalette } from 'fireux-core/types/theme'
import { useConsoleWriteGuard } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleWriteGuard'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/identity/useKitchenConsoleIdentity'

const fallbackConsolePalette: ConsolePalette = {
  canvas: '#f8fafc',
  text: '#0f172a',
  accent: '#0f766e',
  accent_contrast: '#f8fafc',
}

export function useKitchenConsolePaletteEditor() {
  const { selectedKitchen, kitchenId, canWrite, dataType, refreshTargets } =
    useKitchenConsoleIdentity()
  const { requireWritableData } = useConsoleWriteGuard('kitchen')
  const toast = useToastify()
  const saving = ref(false)
  const saveState = ref('')
  const palette = computed<ConsolePalette>(() => {
    const kitchen = selectedKitchen.value as
      | { console_theme?: { palette?: ConsolePalette } }
      | null
    return kitchen?.console_theme?.palette || fallbackConsolePalette
  })
  const canSave = computed(() => canWrite.value && dataType.value === 'live')

  async function save(next: ConsolePalette) {
    if (!kitchenId.value || !canSave.value || saving.value) return
    saving.value = true
    saveState.value = 'Saving...'
    try {
      const user = await useRequireUser()
      requireWritableData('live')
      await $fetch('/api/console/kitchen/theme', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
        body: { kitchen_id: kitchenId.value, palette: next },
      })
      await refreshTargets()
      saveState.value = 'Saved'
    } catch (error) {
      saveState.value = 'Save failed'
      const message = error instanceof Error ? error.message : 'Please try again.'
      toast.error(`Failed to update Console palette: ${message}`)
    } finally {
      saving.value = false
    }
  }

  return { palette, canSave, saving, saveState, save }
}
