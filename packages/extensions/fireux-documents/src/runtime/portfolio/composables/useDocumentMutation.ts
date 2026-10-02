import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { requirePortfolioWorkspaceWrite, type ActivePortfolioRuntime } from 'fireux-properties/runtime/portfolio/composables/workspace/useActivePortfolio'
import { useDocumentScope } from './useDocumentScope'

export function useDocumentMutation(portfolio: ActivePortfolioRuntime) {
  const { currentUser } = useAuth(), captureScope = useDocumentScope(portfolio)
  return async (operation: 'upload' | 'links', input: Record<string, unknown> | FormData) => {
    const portfolioId = requirePortfolioWorkspaceWrite(portfolio, 'fireux-documents')
    // Copy multipart entries too: callers may edit their form while credentials resolve.
    const body = input instanceof FormData ? new FormData() : JSON.parse(JSON.stringify({ ...input, portfolioId }))
    if (input instanceof FormData) { for (const [key, value] of input.entries()) body.append(key, value); body.set('portfolioId', portfolioId) }
    const uid = currentUser.value?.uid, isCurrent = captureScope()
    const assertScope = () => {
      if (!uid || currentUser.value?.uid !== uid || !isCurrent()) throw new Error('The account or Portfolio changed. Reopen Documents.')
      requirePortfolioWorkspaceWrite(portfolio, 'fireux-documents')
    }
    const user = await useRequireUser(); assertScope()
    if (user.uid !== uid) throw new Error('The account changed. Reopen Documents.')
    const token = await user.getIdToken(); assertScope()
    const result = await $fetch<{ id: string }>(`/api/workspace/portfolio/documents/${operation}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body })
    assertScope()
    return result.id
  }
}
