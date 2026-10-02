import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import {
  createError,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'
import type { Project } from 'fireux-fireux/runtime/project/models/project.model'
import { readProjectDocument } from 'fireux-fireux/runtime/project/utils/readProject'
import { getFirestoreDb } from '../../utils/firebase-admin'

export default defineLiveReadHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id || id.includes('/'))
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const snapshot = await (await getFirestoreDb())
    .collection('projects')
    .doc(id)
    .get()
  if (!snapshot.exists)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const project = readProjectDocument(snapshot.data(), snapshot.id)
  if (!project)
    throw createError({
      statusCode: 500,
      statusMessage: 'Stored Project has an invalid canonical shape',
    })
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    item: project,
  } satisfies DetailResponse<Project>
})
