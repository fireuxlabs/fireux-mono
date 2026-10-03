import { computed } from 'vue'
import type { WorkspaceTargetOutcome } from 'fireux-core/runtime/composables/fireux/workspace/workspace-outcome'
import { usePortfolioAccess } from '../usePortfolioAccess'
import { useFirestoreDelete } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreDelete'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { PortfolioStorage } from '../../models/portfolio.model.ts'
import { usePortfolioCreate } from '../firestore/mutations/usePortfolioCreate'
import { usePortfolioUpdate } from '../firestore/mutations/usePortfolioUpdate'
import { usePortfolioFetch } from '../firestore/fetch/usePortfolioFetch'

export function usePortfolioWorkspace() {
  const { selectedId: id } = useWorkspace('portfolio')
  const creation = usePortfolioCreate()
  const update = usePortfolioUpdate()
  const { deleteDocument } = useFirestoreDelete()
  const access = usePortfolioAccess()
  const readId = computed(() => access.outcome.value === 'ready' && access.ids.value.includes(id.value) ? id.value : '')
  const source = usePortfolioFetch(readId)
  const outcome = computed<WorkspaceTargetOutcome>(() => {
    if (access.outcome.value !== 'ready') return access.outcome.value
    if (!id.value) return 'idle'
    if (!readId.value) return 'missing'
    if (source.outcome.value === 'ready' && source.portfolio.value?.id !== readId.value) return 'pending'
    return source.outcome.value
  })
  const data = computed(() => outcome.value === 'ready' && source.portfolio.value?.id === readId.value ? source.portfolio.value : null)
  return { data, id, outcome, crud: {
    create: creation.createPortfolioWorkspace,
    update: (changes: Parameters<typeof update.updatePortfolio>[0]['changes']) => update.updatePortfolio({ portfolioId: id.value, changes }),
    delete: () => deleteDocument(PortfolioStorage.rootCollection, id.value),
  } }
}
