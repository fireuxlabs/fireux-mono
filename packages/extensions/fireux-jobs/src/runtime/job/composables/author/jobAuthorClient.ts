import { useJobCommand } from '../useJobCommand'
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: send authenticated author intents without caller-selected scope.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { LiveFetch } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type {
  AuthorJobListResponse,
  AuthorJobResponse,
  CreateAuthorJobResponse,
  JobCreateIntent,
  JobPatchIntent,
  PatchAuthorJobResponse,
  PublishAuthorJobResponse,
} from '../../models/job-author.model.ts'

async function authorizationHeader(): Promise<Record<string, string>> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export async function fetchAuthorJobs(
  fetcher: LiveFetch = $fetch
): Promise<AuthorJobListResponse> {
  return fetcher('/api/internal/jobs', {
    headers: await authorizationHeader(),
  })
}

export async function fetchAuthorJob(
  id: string,
  fetcher: LiveFetch = $fetch
): Promise<AuthorJobResponse> {
  return fetcher(`/api/internal/jobs/${encodeURIComponent(id)}`, {
    headers: await authorizationHeader(),
  })
}

export function useJobAuthorCommands() {
  const { command, captureIntent, scopeEpoch } = useJobCommand()
  const verify = <T extends AuthorJobResponse & { id: string }>(result: T, id?: string) => {
    if (!result?.id || result.job?.id !== result.id || (id && result.id !== id)) throw new Error('Job response did not match the requested Job.')
    return result
  }
  async function createAuthorJobRequest(input: JobCreateIntent): Promise<CreateAuthorJobResponse> {
    const result = await command<CreateAuthorJobResponse>('/api/internal/jobs', 'POST', input)
    if (result?.created !== true) throw new Error('Job creation was not confirmed.')
    return verify(result)
  }
  async function patchAuthorJobRequest(id: string, patch: JobPatchIntent): Promise<PatchAuthorJobResponse> {
    const result = await command<PatchAuthorJobResponse>(`/api/internal/jobs/${encodeURIComponent(id)}`, 'PATCH', { patch })
    if (result?.updated !== true) throw new Error('Job update was not confirmed.')
    return verify(result, id)
  }
  async function publishAuthorJobRequest(id: string): Promise<PublishAuthorJobResponse> {
    const result = await command<PublishAuthorJobResponse>(`/api/internal/jobs/${encodeURIComponent(id)}/publish`, 'POST')
    if (result?.published !== true) throw new Error('Job publication was not confirmed.')
    return verify(result, id)
  }
  return { createAuthorJobRequest, patchAuthorJobRequest, publishAuthorJobRequest, captureIntent, scopeEpoch }
}
