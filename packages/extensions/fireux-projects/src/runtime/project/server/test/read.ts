import type { H3Event } from 'h3'
import { requireProjectOperator } from '../authority'

const text = (value: unknown) => String(value ?? '').trim()

export async function readProjectTests(
  event: H3Event,
  projectIdInput: unknown
) {
  const { projectId, projectRef } = await requireProjectOperator(
    event,
    projectIdInput
  )
  const snapshot = await projectRef
    .collection('tests')
    .orderBy('created_at')
    .limit(150)
    .get()
  return {
    ok: true as const,
    project_id: projectId,
    tests: snapshot.docs.map((document) => ({
      id: document.id,
      value: text(document.data().value),
    })),
  }
}
