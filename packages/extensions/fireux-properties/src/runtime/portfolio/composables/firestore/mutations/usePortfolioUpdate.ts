import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { PortfolioUpdateInput } from '../../../models/portfolio.model'

export function usePortfolioUpdate() {
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const captureIntent = useCommandScope([
    () => currentUser.value?.uid,
    session.appUser,
    () => config.appId,
  ])
  async function updatePortfolio(input: {
    portfolioId: string
    changes: PortfolioUpdateInput
  }) {
    const body = JSON.parse(JSON.stringify(input)),
      uid = currentUser.value?.uid,
      isCurrent = captureIntent()
    if (!String(body.portfolioId || '').trim())
      throw new Error('Portfolio id is required.')
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
