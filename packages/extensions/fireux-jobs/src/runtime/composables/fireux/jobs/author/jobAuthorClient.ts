// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: send authenticated author intents without caller-selected scope.
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  AuthorJobListResponse,
  AuthorJobResponse,
  CreateAuthorJobResponse,
  JobCreateIntent,
  JobPatchIntent,
  PatchAuthorJobResponse,
  PublishAuthorJobResponse,
} from '../../../../models/job-author.model'

async function authorizationHeader(): Promise<Record<string, string>> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export async function fetchAuthorJobs(): Promise<AuthorJobListResponse> {
  return $fetch('/api/internal/jobs', {
    headers: await authorizationHeader(),
  })
}

export async function fetchAuthorJob(id: string): Promise<AuthorJobResponse> {
  return $fetch(`/api/internal/jobs/${encodeURIComponent(id)}`, {
    headers: await authorizationHeader(),
  })
}

export async function createAuthorJobRequest(
  input: JobCreateIntent
): Promise<CreateAuthorJobResponse> {
  return $fetch('/api/internal/jobs', {
    method: 'POST',
    headers: await authorizationHeader(),
    body: input,
  })
}

export async function patchAuthorJobRequest(
  id: string,
  patch: JobPatchIntent
): Promise<PatchAuthorJobResponse> {
  return $fetch(`/api/internal/jobs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: await authorizationHeader(),
    body: { patch },
  })
}

export async function publishAuthorJobRequest(
  id: string
): Promise<PublishAuthorJobResponse> {
  return $fetch(`/api/internal/jobs/${encodeURIComponent(id)}/publish`, {
    method: 'POST',
    headers: await authorizationHeader(),
  })
}
