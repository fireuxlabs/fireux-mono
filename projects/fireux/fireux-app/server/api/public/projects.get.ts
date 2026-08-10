import { ProjectStorage } from 'fireux-core/runtime/models/system/project.model'
import { defineEventHandler, setResponseHeaders, type H3Event } from 'h3'
import { getFirestoreDb } from '../../utils/firebase-admin'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(async (event: H3Event) => {
  const snapshot = await (await getFirestoreDb())
    .collection(ProjectStorage.collection)
    .get()
  const projects = snapshot.docs
    .flatMap((document) => {
      const data = document.data() || {}
      if (text(data.status) !== 'active') return []
      return [
        {
          id: document.id,
          name: text(data.name),
          description: text(data.description),
          assets: { image: text(data.assets?.image) },
          status: 'active' as const,
        },
      ]
    })
    .sort((left, right) =>
      (left.name || left.id).localeCompare(right.name || right.id)
    )

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })
  return { ok: true as const, projects }
})
