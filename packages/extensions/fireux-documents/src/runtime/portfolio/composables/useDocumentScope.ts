import { watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'
import { useRoute } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { ActivePortfolioRuntime } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'

export function useDocumentScope(portfolio: ActivePortfolioRuntime, reset: () => void = () => {}) {
  const { currentUser } = useAuth(), route = useRoute()
  const { appUser } = useUserSession()
  const sources = [() => currentUser.value?.uid, () => JSON.stringify(appUser.value), portfolio.id, portfolio.appId, portfolio.canWrite, () => route.fullPath]
  watch(sources, reset, { flush: 'sync' })
  return useCommandScope(sources)
}
