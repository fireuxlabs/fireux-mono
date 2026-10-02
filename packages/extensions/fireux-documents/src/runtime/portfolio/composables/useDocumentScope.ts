import { watch, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ActivePortfolioRuntime } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'

export function useDocumentScope(portfolio: ActivePortfolioRuntime, reset: () => void = () => {}) {
  const { currentUser } = useAuth(), route = useRoute()
  let epoch = 0
  const invalidate = () => { epoch += 1; reset() }
  watch([() => currentUser.value?.uid, portfolio.id, portfolio.appId, () => route.fullPath], invalidate, { flush: 'sync' })
  onBeforeUnmount(invalidate)
  return () => { const expected = epoch; return () => expected === epoch }
}
