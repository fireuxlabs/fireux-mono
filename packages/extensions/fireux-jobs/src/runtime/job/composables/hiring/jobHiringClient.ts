import { type WatchSource } from 'vue'
import { useJobCommand } from '../useJobCommand'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { LiveFetch } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import type {
  JobApplicationActionIntent,
  JobApplicationCreateIntent,
} from '../../models/job-application.model.ts'
import type { JobEngagementActionIntent } from '../../models/job-engagement.model.ts'
import type {
  JobApplicationListResponse,
  JobApplicationListScope,
  JobApplicationResponse,
} from '../../models/job-hiring.model.ts'

async function authorizationHeader(): Promise<Record<string, string>> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export async function fetchJobApplications(
  scope: JobApplicationListScope,
  fetcher: LiveFetch = $fetch
): Promise<JobApplicationListResponse> {
  return fetcher('/api/internal/job-applications', {
    headers: await authorizationHeader(),
    query: { scope },
  })
}

export function useJobHiringCommands(ownerSources: WatchSource[] = []) {
  const { command, captureIntent, scopeEpoch } = useJobCommand(ownerSources)
  async function applyToJobRequest(jobId: string, input: JobApplicationCreateIntent = {}): Promise<JobApplicationResponse> {
    const result = await command<JobApplicationResponse>(`/api/internal/jobs/${encodeURIComponent(jobId)}/applications`, 'POST', input)
    if (result?.item?.application?.job_id !== jobId || result.item.job?.id !== jobId) throw new Error('Application response did not match the requested Job.')
    return result
  }
  async function mutateJobApplicationRequest(id: string, input: JobApplicationActionIntent): Promise<JobApplicationResponse> {
    const result = await command<JobApplicationResponse>(`/api/internal/job-applications/${encodeURIComponent(id)}`, 'PATCH', input)
    if (result?.item?.application?.id !== id) throw new Error('Application response did not match the requested application.')
    return result
  }
  async function mutateJobEngagementRequest(id: string, input: JobEngagementActionIntent): Promise<JobApplicationResponse> {
    const result = await command<JobApplicationResponse>(`/api/internal/job-engagements/${encodeURIComponent(id)}`, 'PATCH', input)
    if (result?.item?.engagement?.id !== id) throw new Error('Engagement response did not match the requested engagement.')
    return result
  }
  return { applyToJobRequest, mutateJobApplicationRequest, mutateJobEngagementRequest, captureIntent, scopeEpoch }
}
