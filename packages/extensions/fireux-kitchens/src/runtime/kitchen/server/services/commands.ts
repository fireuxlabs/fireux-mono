import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverKitchenMenusTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readKitchenServices } from '../../utils/kitchen-services'
import { patchKitchenServiceInteraction } from '../../utils/service-interaction'
import type { KitchenService } from '../../models/service.model'
import {
  readServiceCreate,
  readServiceUpdate,
  requireConfiguredService,
} from './validation'
import { readInteractionChanges } from './interaction-validation'

const missing = () =>
  createError({ statusCode: 404, statusMessage: 'Service not found.' })

export async function createKitchenService(event: H3Event, input: unknown) {
  const { kitchenId, name } = readServiceCreate(input)
  const actor = await readKitchenMutationActor(event)
  const id = randomUUID()
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const services = readKitchenServices(authority.rootData.services)
    const service: KitchenService = {
      id,
      name,
      enabled: false,
      menu_ids: [],
      interactions: [{ type: 'browse', enabled: true }],
    }
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      services: [...services, service],
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
    return { ok: true, service }
  })
}

export async function updateKitchenService(event: H3Event, input: unknown) {
  const { kitchenId, serviceId, changes } = readServiceUpdate(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const services = readKitchenServices(authority.rootData.services)
    const current = services.find((row) => row.id === serviceId)
    if (!current) throw missing()
    const { hours, ...fields } = changes
    const service = { ...current, ...fields }
    if (hours === null) delete service.hours
    else if (hours !== undefined) service.hours = hours
    requireConfiguredService(service)
    for (const id of changes.menu_ids ||
      (changes.enabled === true ? service.menu_ids : [])) {
      const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
    }
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      services: services.map((row) => (row.id === serviceId ? service : row)),
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
    return { ok: true, service }
  })
}

export async function updateKitchenServiceInteraction(
  event: H3Event,
  input: unknown
) {
  const { kitchenId, serviceId, type, changes } = readInteractionChanges(input)
  const actor = await readKitchenMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      kitchenId
    )
    const services = readKitchenServices(authority.rootData.services)
    const current = services.find((row) => row.id === serviceId)
    if (!current) throw missing()
    const interaction = patchKitchenServiceInteraction(
      type,
      current.interactions.find((row) => row.type === type),
      changes
    )
    const service = {
      ...current,
      interactions: [
        ...current.interactions.filter((row) => row.type !== type),
        interaction,
      ],
    }
    requireConfiguredService(service)
    if (service.enabled && interaction.enabled) {
      for (const id of service.menu_ids) {
        const menu = await tx.read(serverKitchenMenusTarget(kitchenId), id)
        if (!menu.exists)
          throw createError({
            statusCode: 400,
            statusMessage: 'A selected Menu no longer exists.',
          })
      }
    }
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, kitchenId, {
      services: services.map((row) => (row.id === serviceId ? service : row)),
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
    return { ok: true, service }
  })
}
