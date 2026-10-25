import { resolveReadOutcome } from './read-outcome.ts'

export type HttpDocumentReadInput = {
  enabled: boolean
  pending: boolean
  error?: unknown
  present: boolean
}

/** Translate HTTP document absence before classifying the read. */
export function resolveHttpDocumentOutcome(input: HttpDocumentReadInput) {
  const error = input.error as
    | { statusCode?: number; status?: number }
    | undefined
  const notFound =
    Boolean(error) && Number(error?.statusCode ?? error?.status) === 404

  return resolveReadOutcome({
    enabled: input.enabled,
    pending: !notFound && input.pending,
    failed: Boolean(error) && !notFound,
    present: !notFound && input.present,
  })
}
