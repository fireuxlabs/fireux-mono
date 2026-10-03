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
import { kitchenServiceOptions } from '../../utils/service-options'
import {
  tableServiceChannel,
  configureTableChannel,
} from '../../utils/table-service'
import { readServiceUpdate, requireConfiguredService, fail } from './validation'
import { readInteractionChanges } from './interaction-validation'

export function readServiceConfiguration(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail('Invalid service configuration.')
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some(
      (key) =>
        ![
          'kitchenId',
          'serviceId',
          'option',
          'name',
          'menu_ids',
          'hours',
          'enabled',
          'interactions',
          'activateShared',
        ].includes(key)
    )
  )
    fail('Unsupported service setting.')
  const option = kitchenServiceOptions.find(
    (option) => option.key === body.option
  )
  if (!option || typeof body.enabled !== 'boolean')
    return fail('Choose a service and its availability.')
  const isNew = body.serviceId === undefined
  const base = readServiceUpdate({
    kitchenId: body.kitchenId,
    serviceId: isNew ? 'new-service' : body.serviceId,
    changes: { name: body.name, menu_ids: body.menu_ids, hours: body.hours },
  })
  if (
    !Array.isArray(body.interactions) ||
    body.interactions.length !== option.types.length
  )
    fail('Configure every ordering option.')
  const interactions = (body.interactions as unknown[]).map((value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      return fail('Invalid ordering settings.')
    const row = value as Record<string, unknown>
    if (Object.keys(row).some((key) => !['type', 'changes'].includes(key)))
      fail('Unsupported ordering setting.')
    if (!(option.types as readonly unknown[]).includes(row.type))
      fail('Ordering option does not match this service.')
    return readInteractionChanges({
      kitchenId: base.kitchenId,
      serviceId: base.serviceId,
      type: row.type,
      changes: row.changes,
    })
  })
  if (new Set(interactions.map((row) => row.type)).size !== option.types.length)
    fail('Configure each ordering option once.')
  if (body.enabled && !interactions.some((row) => row.changes.enabled))
    fail('Choose at least one ordering option.')
  if (!base.changes.menu_ids?.length || !base.changes.hours?.windows.length)
    fail('Choose menus and serving hours before saving.')
  return {
    ...base,
    isNew,
    option,
    enabled: body.enabled,
    interactions,
    activateShared: body.activateShared === true,
  }
}

/** Commit menus, explicit hours and interaction settings together before making them available. */
export async function configureKitchenService(event: H3Event, input: unknown) {
  const config = readServiceConfiguration(input)
  const actor = await readKitchenMutationActor(event)
  const id = config.isNew ? randomUUID() : config.serviceId
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      config.kitchenId
    )
    const services = readKitchenServices(authority.rootData.services)
    if (
      config.isNew &&
      services.some((service) =>
        service.interactions.some((row) =>
          (config.option.types as readonly string[]).includes(row.type)
        )
      )
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'This option already has saved settings. Close and reopen its configuration.',
      })
    }
    const current = services.find((service) => service.id === id)
    if (!config.isNew && !current)
      throw createError({
        statusCode: 404,
        statusMessage: 'Service not found.',
      })
    const others = current?.interactions.filter(
      (row) => !(config.option.types as readonly string[]).includes(row.type)
    ) || [{ type: 'browse' as const, enabled: true }]
    if (
      config.enabled &&
      current &&
      !current.enabled &&
      others.some((row) => row.type !== 'browse' && row.enabled) &&
      !config.activateShared
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'This offering also enables another ordering option. Review the shared settings before saving.',
      })
    }
    const service = {
      id,
      name: config.changes.name!,
      menu_ids: config.changes.menu_ids!,
      hours: config.changes.hours!,
      enabled: current?.enabled || config.enabled,
      interactions: [
        ...others,
        ...config.interactions.map((row) => {
          const previous = current?.interactions.find(
            (item) => item.type === row.type
          )
          const channel = tableServiceChannel(config.option.key)
          return patchKitchenServiceInteraction(row.type, previous, {
            ...row.changes,
            enabled: config.enabled && row.changes.enabled === true,
            ...(channel
              ? configureTableChannel(
                  previous && previous.type !== 'browse'
                    ? {
                        ...previous,
                        enabled: Boolean(current?.enabled && previous.enabled),
                      }
                    : undefined,
                  channel,
                  config.enabled
                )
              : {}),
          })
        }),
      ],
    }
    requireConfiguredService(service)
    let orderableMenus = 0
    for (const menuId of service.menu_ids) {
      const menu = await tx.read(
        serverKitchenMenusTarget(config.kitchenId),
        menuId
      )
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
      const data = menu.data
      const doc = data?.doc as { url?: string } | undefined
      if (data?.status === 'published' && !doc?.url?.trim()) orderableMenus++
    }
    if (config.enabled && !orderableMenus)
      throw createError({
        statusCode: 400,
        statusMessage:
          'Publish at least one menu with items and prices before enabling ordering.',
      })
    tx.update(FIRESTORE_MUTATION_TARGETS.kitchens, config.kitchenId, {
      services: current
        ? services.map((row) => (row.id === id ? service : row))
        : [...services, service],
      updated: serverAuditStamp({ by: actor.uid, appId: authority.ownerAppId }),
    })
    return { ok: true, kitchen_id: config.kitchenId, service }
  })
}
