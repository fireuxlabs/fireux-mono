import { usePublish } from 'fireux-core/runtime/composables/fireux/publishing/usePublish'

export type JobPublishInput = {
  id: string
  title?: string
}

const clean = (value: unknown) => String(value ?? '').trim()

export function useJobPublish() {
  const { publish } = usePublish()

  async function publishJob(input: JobPublishInput) {
    const id = clean(input.id)
    const title = input.title === undefined ? undefined : clean(input.title)

    if (!id) throw new Error('Job id is required before publishing.')
    if (input.title !== undefined && !title) {
      throw new Error('Job title is required before publishing.')
    }

    return publish({
      collectionPath: 'jobs',
      id,
      routePath: `/jobs/${encodeURIComponent(id)}`,
      patch: {
        visibility: 'public',
      },
    })
  }

  return {
    publishJob,
  }
}
