// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: patch only caller-safe fields through the author boundary.
import type { JobPatchIntent } from '../../../models/job-author.model.ts'
import { patchAuthorJobRequest } from '../../author/jobAuthorClient'

export function useJobUpdate() {
  const updateJob = (input: { jobId: string; changes: JobPatchIntent }) =>
    patchAuthorJobRequest(input.jobId, input.changes)

  return { updateJob }
}
