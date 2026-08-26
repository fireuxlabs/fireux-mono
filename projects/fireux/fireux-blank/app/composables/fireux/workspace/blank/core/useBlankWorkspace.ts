import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import {
  BlankStorage,
  type BlankSurface,
} from '../../../../../models/blank.model'
import { useBlankCollection } from '../../../firestore/blank/useBlank'

function createBlankWorkspace() {
  const workspace = useWorkspace('blank')
  const fireux = useFireUXConfig()
  const collection = useBlankCollection()
  const blank = computed<BlankSurface | null>(
    () =>
      collection.blanks.value.find(
        (item) => normalizeString(item.id) === workspace.activeId.value
      ) ?? null
  )

  return {
    blanks: {
      targets: collection.blanks,
      count: collection.count,
      pending: collection.pending,
      error: collection.error,
      outcome: collection.outcome,
      hasTargets: computed(() => collection.count.value > 0),
    },
    selection: {
      blank,
      blankId: workspace.activeId,
      hasSelection: computed(() => Boolean(blank.value)),
    },
    runtime: {
      appId: computed(() => fireux.appId),
      ecosystem: computed(() => fireux.ecosystem),
      rootCollection: computed(() => BlankStorage.rootCollection),
      appCollectionPath: collection.appCollectionPath,
      dataType: computed(() => 'live' as const),
      isDemo: computed(() => false),
      readOnly: computed(() => true),
      canWrite: computed(() => false),
    },
    actions: {
      selectBlank: workspace.activate,
      clearSelectedBlank: workspace.clearActive,
    },
  }
}

export function useBlankWorkspace() {
  return createBlankWorkspace()
}
