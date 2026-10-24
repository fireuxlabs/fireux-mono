import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useRoute } from '#imports'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { PortfolioUpdateInput } from '../../../models/portfolio.model'

export function usePortfolioUpdate() {
  const { currentUser } = useAuth(),
    { selectedId } = useWorkspace('portfolio')
  const session = useAppSession()
  const config = useFireUXConfig(),
    route = useRoute()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    selectedId,
    session.appUser,
    () => config.appId,
    () => route.fullPath,
  ])
  async function updatePortfolio(input: {
    portfolioId: string
    changes: PortfolioUpdateInput
  }) {
    const body = JSON.parse(JSON.stringify(input)),
      uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    const assertCurrent = () => {
      if (!uid || !isCurrent() || currentUser.value?.uid !== uid)
        throw new Error('The account or Portfolio changed. Reopen Identity.')
    }
    const user = await useRequireUser()
    assertCurrent()
    if (user.uid !== uid)
      throw new Error('The account changed. Reopen Identity.')
    const token = await user.getIdToken()
    assertCurrent()
    const result = await $fetch<{ ok: true; portfolioId: string }>(
      '/api/workspace/portfolio/identity',
      { method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body }
    )
    if (result?.ok !== true || result.portfolioId !== body.portfolioId)
      throw new Error(
        'Portfolio update response did not match the requested Portfolio.'
      )
  }
  return { updatePortfolio, captureIntent }
}
