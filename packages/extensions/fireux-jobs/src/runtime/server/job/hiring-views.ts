import type { DocumentSnapshot } from 'firebase-admin/firestore'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { JobEngagementStorage } from '../../models/job-engagement.model.ts'
import type {
  JobApplicationResponse,
  JobApplicationView,
  JobHiringCandidateSummary,
} from '../../models/job-hiring.model.ts'
import { JobStorage } from '../../models/job.model.ts'
import { ProfessionalStorage } from '../../models/profiles/Professional/Professional.model.ts'
import type { JobApplication } from '../../models/job-application.model.ts'
import type { JobServerScope } from './runtime.ts'
import {
  canonicalEngagement,
  canonicalJob,
  fail,
  record,
  text,
} from './hiring-records.ts'

function publicCandidate(
  id: string,
  snapshot: DocumentSnapshot | undefined
): JobHiringCandidateSummary | null {
  if (!snapshot?.exists) return null
  const data = record(snapshot.data())
  const title = text(data.title).slice(0, 120)
  const subtitle = text(data.subtitle).slice(0, 240)
  const imageValue = text(data.image)
  let image = ''
  if (imageValue) {
    try {
      const parsed = new URL(imageValue)
      if (
        parsed.protocol === 'https:' &&
        !parsed.username &&
        !parsed.password
      ) {
        image = parsed.toString()
      }
    } catch {
      image = ''
    }
  }
  return { id, title, subtitle, image }
}

export async function hydrateViews(
  scope: JobServerScope,
  applications: JobApplication[],
  includeCandidates: boolean
): Promise<JobApplicationView[]> {
  if (!applications.length) return []
  const db = getRuntimeFirestore(scope.databaseId)
  const identityDb = getRuntimeIdentityFirestore(scope.identityDatabaseId)
  const jobIds = Array.from(new Set(applications.map((item) => item.job_id)))
  const candidateIds = includeCandidates
    ? Array.from(new Set(applications.map((item) => item.candidate_user_id)))
    : []
  const [jobSnapshots, engagementSnapshots, candidateSnapshots] =
    await Promise.all([
      db.getAll(
        ...jobIds.map((id) => db.collection(JobStorage.collection).doc(id))
      ),
      db.getAll(
        ...applications.map((item) =>
          db.collection(JobEngagementStorage.collection).doc(item.id)
        )
      ),
      candidateIds.length
        ? identityDb.getAll(
            ...candidateIds.map((id) =>
              identityDb.collection(ProfessionalStorage.rootCollection).doc(id)
            )
          )
        : Promise.resolve([] as DocumentSnapshot[]),
    ])
  const jobs = new Map(
    jobSnapshots.map((snapshot) => [snapshot.id, canonicalJob(snapshot)])
  )
  const engagements = new Map(
    engagementSnapshots
      .filter((snapshot) => snapshot.exists)
      .map((snapshot) => [snapshot.id, canonicalEngagement(snapshot)])
  )
  const candidates = new Map(
    candidateSnapshots.map((snapshot) => [
      snapshot.id,
      publicCandidate(snapshot.id, snapshot),
    ])
  )
  return applications.map((application) => {
    const job = jobs.get(application.job_id)
    if (!job || job.source_app_id !== scope.appId) {
      fail(503, 'An Application references an unavailable Job.')
    }
    return {
      application,
      job: {
        id: job.id,
        title: job.title,
        contract_type: job.contract_type,
        management_mode: job.management_mode,
        company_id: job.company_id,
        place_id: job.place_id,
      },
      candidate: includeCandidates
        ? (candidates.get(application.candidate_user_id) ?? null)
        : null,
      engagement: engagements.get(application.id) ?? null,
    }
  })
}

export async function viewResponse(
  scope: JobServerScope,
  application: JobApplication,
  includeCandidate: boolean
): Promise<JobApplicationResponse> {
  const [item] = await hydrateViews(scope, [application], includeCandidate)
  if (!item) fail(503, 'Application view is unavailable.')
  return { item }
}
