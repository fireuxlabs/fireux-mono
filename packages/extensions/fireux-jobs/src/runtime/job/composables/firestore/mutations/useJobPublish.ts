// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Jobs API: publish only through the validated author lifecycle route.
import { publishAuthorJobRequest } from '../../author/jobAuthorClient'

export type JobPublishInput = {
  id: string
  title?: string
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useJobPublish() {
  async function publishJob(input: JobPublishInput) {
    const id = clean(input.id)
    const title = input.title === undefined ? undefined : clean(input.title)

    if (!id) throw new Error('Job id is required before publishing.')
    if (input.title !== undefined && !title) {
      throw new Error('Job title is required before publishing.')
    }

    return publishAuthorJobRequest(id)
  }

  return {
    publishJob,
  }
}
