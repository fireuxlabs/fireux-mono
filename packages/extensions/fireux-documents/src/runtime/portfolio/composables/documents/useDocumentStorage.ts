import { usePortfolioScope } from 'fireux-properties/runtime/portfolio/composables/usePortfolioScope'
import { useDocumentMutation } from '../useDocumentMutation'

/** Upload and metadata persistence share one retryable domain request. */
export function useDocumentStorage(
  portfolio: ReturnType<typeof usePortfolioScope>
) {
  const mutate = useDocumentMutation(portfolio)
  async function uploadFile(input: {
    file: File
    notes: string
    requestId: string
  }) {
    const body = new FormData()
    body.set('file', input.file, input.file.name)
    body.set('notes', input.notes)
    body.set('requestId', input.requestId)
    return mutate('upload', body)
  }
  return { uploadFile }
}
