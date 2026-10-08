import { useRoute } from '#imports'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import type { FireuxEntityCreateResult } from 'fireux-core/runtime/models/utils/entity-create.model'
import type { PortfolioCreateInput } from '../../../models/portfolio.model.ts'

export function usePortfolioCreate() {
  const { currentUser } = useAuth(), session = useAppSession(), config = useFireUXConfig()
  const route = useRoute()
  const captureCommand = useCommandScope([currentUser, session.appUser, () => config.appId, () => route.fullPath])
  async function createPortfolio(
    input: PortfolioCreateInput,
    options: { existingRootId?: string; isCurrent?: () => boolean } = {}
  ): Promise<FireuxEntityCreateResult> {
    const isCurrent = captureCommand(), uid = currentUser.value?.uid
    const isOwnerCurrent = options.isCurrent ?? (() => true)
    const existingRootId = options.existingRootId?.trim()
    const body = existingRootId
      ? { existing_root_id: existingRootId }
      : { input: JSON.parse(JSON.stringify(input)) as PortfolioCreateInput }
    const expectedId = existingRootId || normalizeSlug(input?.identity?.slug?.trim() || input?.identity?.name || '')
    const user = await useRequireUser()
    if (!uid || !isCurrent() || !isOwnerCurrent() || user.uid !== uid) throw new Error('Creation context changed. Try again.')
    const token = await user.getIdToken()
    if (!isCurrent() || !isOwnerCurrent() || currentUser.value?.uid !== uid) throw new Error('Creation context changed. Try again.')
    const result = await $fetch<{ok:true; portfolio_id:string; created_root:boolean; created_team_member:boolean}>(
      '/api/portfolios/onboarding/complete',
      { method:'POST', headers:{Authorization:`Bearer ${token}`}, body }
    )
    if (result?.ok !== true || typeof result.portfolio_id !== 'string' ||
        !isFirestoreDocumentId(result.portfolio_id) || result.portfolio_id !== expectedId ||
        typeof result.created_root !== 'boolean' || typeof result.created_team_member !== 'boolean')
      throw new Error('Portfolio onboarding completion was invalid.')
    return { id:result.portfolio_id, createdRoot:result.created_root, createdTeamMember:result.created_team_member }
  }
  return { createPortfolio }
}
