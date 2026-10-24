import { computed } from 'vue'
import { useKitchenWorkspace } from '../useKitchenWorkspace'
import { useKitchenChildCollection } from '../../useKitchenChildCollection'
import {
  MenuSourceUploadStorage,
  type MenuSourceUpload,
} from '../../../../menu/utils/menu-source-upload'
const text = (value: unknown) => String(value ?? '').trim()
const timestampSeconds = (value: unknown) => {
  if (!value || typeof value !== 'object') return 0
  const seconds = Number((value as Record<string, unknown>).seconds)
  return Number.isFinite(seconds) ? seconds : 0
}

const sortMenuSources = (sources: MenuSourceUpload[]) =>
  [...sources].sort((a, b) => {
    const left = timestampSeconds(a.created?.at)
    const right = timestampSeconds(b.created?.at)
    if (left || right) return right - left
    return text(a.id).localeCompare(text(b.id))
  })

export function useKitchenWorkspaceMenuSources() {
  const workspace = useKitchenWorkspace()
  const kitchenId = computed(() =>
    workspace.outcome.value === 'ready' ? workspace.id.value : ''
  )
  const sources = useKitchenChildCollection<MenuSourceUpload>(
    MenuSourceUploadStorage.collection,
    kitchenId
  )
  const outcome = computed(() =>
    workspace.outcome.value === 'ready'
      ? sources.outcome.value
      : workspace.outcome.value
  )
  return {
    menuSources: computed(() =>
      outcome.value === 'ready' ? sortMenuSources(sources.items.value) : []
    ),
    menuSourcesPending: computed(() => outcome.value === 'pending'),
    menuSourcesError: sources.error,
    outcome,
  }
}
