import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type {
  JobApplicationActionIntent,
  JobApplicationCreateIntent,
} from '../../../../models/job-application.model.ts'
import type {
  JobEngagementActionIntent,
} from '../../../../models/job-engagement.model.ts'
import type {
  JobApplicationListResponse,
  JobApplicationListScope,
  JobApplicationResponse,
} from '../../../../models/job-hiring.model.ts'

async function authorizationHeader(): Promise<Record<string, string>> {
  const user = await useRequireUser()
  const token = await user.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

export async function applyToJobRequest(
  jobId: string,
  input: JobApplicationCreateIntent = {}
): Promise<JobApplicationResponse> {
  return $fetch(
    `/api/internal/jobs/${encodeURIComponent(jobId)}/applications`,
    {
      method: 'POST',
      headers: await authorizationHeader(),
      body: input,
    }
  )
}

export async function fetchJobApplications(
  scope: JobApplicationListScope
): Promise<JobApplicationListResponse> {
  return $fetch('/api/internal/job-applications', {
    headers: await authorizationHeader(),
    query: { scope },
  })
}

export async function mutateJobApplicationRequest(
  applicationId: string,
  input: JobApplicationActionIntent
): Promise<JobApplicationResponse> {
  return $fetch(
    `/api/internal/job-applications/${encodeURIComponent(applicationId)}`,
    {
      method: 'PATCH',
      headers: await authorizationHeader(),
      body: input,
    }
  )
}

export async function mutateJobEngagementRequest(
  engagementId: string,
  input: JobEngagementActionIntent
): Promise<JobApplicationResponse> {
  return $fetch(
    `/api/internal/job-engagements/${encodeURIComponent(engagementId)}`,
    {
      method: 'PATCH',
      headers: await authorizationHeader(),
      body: input,
    }
  )
}

