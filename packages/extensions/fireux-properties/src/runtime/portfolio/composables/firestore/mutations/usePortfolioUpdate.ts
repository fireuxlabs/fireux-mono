import { watch, onBeforeUnmount } from 'vue'
import { useRoute } from '#imports'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { PortfolioUpdateInput } from '../../../models/portfolio.model'

export function usePortfolioUpdate() {
  const { currentUser } = useAuth(), { selectedId } = useWorkspace('portfolio')
  const config = useFireUXConfig(), route = useRoute()
  let epoch = 0
  const invalidate = () => { epoch += 1 }
  watch([() => currentUser.value?.uid, selectedId, () => config.appId, () => route.fullPath], invalidate, { flush: 'sync' })
  onBeforeUnmount(invalidate)
  const captureIntent = () => { const expected = epoch; return () => expected === epoch }
  async function updatePortfolio(input: { portfolioId: string; changes: PortfolioUpdateInput }) {
    const body = JSON.parse(JSON.stringify(input)), uid = currentUser.value?.uid, isCurrent = captureIntent()
    const assertCurrent = () => { if (!uid || !isCurrent() || currentUser.value?.uid !== uid) throw new Error('The account or Portfolio changed. Reopen Identity.') }
    const user = await useRequireUser(); assertCurrent()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Identity.')
    const token = await user.getIdToken(); assertCurrent()
    await $fetch('/api/workspace/portfolio/identity', { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body })
    assertCurrent()
  }
  return { updatePortfolio, captureIntent }
}
