import type { H3Event } from 'h3'
import { requireProjectOperator } from '../core/authority'
import { readPlatformEcosystems } from '../../utils/ecosystems'

/** Relationship authority comes from each approved owning Ecosystem database. */
export async function readProjectEcosystems(event: H3Event, id: unknown) {
  const { projectId } = await requireProjectOperator(event, id)
  const ecosystems = await readPlatformEcosystems({ activeOnly: false })
  return {
    project_id: projectId,
    ecosystems: ecosystems.filter(
      (ecosystem) => ecosystem.project_id === projectId
    ),
  }
}
