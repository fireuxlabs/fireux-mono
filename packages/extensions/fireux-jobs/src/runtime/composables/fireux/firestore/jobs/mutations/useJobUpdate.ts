// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: patch only caller-safe fields through the author boundary.
import type { JobPatchIntent } from '../../../../../models/job-author.model'
import { patchAuthorJobRequest } from '../../../jobs/author/jobAuthorClient'

export function useJobUpdate() {
  const updateJob = (jobId: string, patch: JobPatchIntent) =>
    patchAuthorJobRequest(jobId, patch)

  return { updateJob }
}
