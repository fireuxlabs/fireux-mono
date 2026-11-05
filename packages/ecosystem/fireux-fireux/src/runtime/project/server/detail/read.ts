import { createError } from 'h3'
import type { ProjectPublicSummary } from '../../models/project.model'
import { readProjectPublicSummary } from '../../utils/readProject'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'

export async function readProjectDetail(idInput: unknown): Promise<ProjectPublicSummary> {
  const id = String(idInput ?? '').trim()
  if (!id || id.includes('/'))
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const snapshot = await getRuntimeFirestore('fireux')
    .collection('projects')
    .doc(id)
    .get()
  if (!snapshot.exists)
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  const project = readProjectPublicSummary(snapshot.data(), snapshot.id)
  if (!project)
    throw createError({
      statusCode: 500,
      statusMessage: 'Stored Project has an invalid canonical shape',
    })
  return project
}
