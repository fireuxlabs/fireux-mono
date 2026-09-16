import { patchKitchenOrderingService } from '../../utils/ordering-service'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readKitchenOrdering } from '../../utils/kitchen-ordering'
import { readServiceChanges } from './validation'

export async function updateKitchenOrderingService(
  event: H3Event,
  input: unknown
) {
  const { kitchenId, type, changes } = readServiceChanges(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const ordering = readKitchenOrdering(authority.rootData.ordering)
    const current = ordering.services.find((service) => service.type === type)
    const service = patchKitchenOrderingService(type, current, changes)
    for (const id of changes.menu_ids ||
      (changes.enabled === true ? service.menu_ids : [])) {
      requireFirestoreDocumentId(id, 'Menu id')
      const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
    }
    if (service.enabled && !service.menu_ids.length)
      throw createError({
        statusCode: 400,
        statusMessage: 'Select at least one Menu before enabling this service.',
      })
    const services = [
      ...ordering.services.filter((row) => row.type !== type),
      service,
    ]
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      ordering: { services },
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
    return { ok: true, service }
  })
}
