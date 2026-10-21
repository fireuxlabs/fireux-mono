import type { KitchenOffering } from '../../models/offering.model'
import { resolveKitchenOperationHours } from '../../utils/kitchen-readers'
import { hoursWithinParent } from '../../utils/service-hours'
import { randomUUID } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenMenusTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../core/mutation-authority'
import { readKitchenOfferingsInTransaction } from '../offerings/read'
import { serverKitchenOfferingsTarget } from '../offerings/target'
import { kitchenOfferingData } from '../../utils/offerings'
import { patchKitchenOfferingInteraction } from '../../utils/offering-interaction'
import { kitchenOfferingOptions } from '../../utils/offering-options'
import {
  tableServiceChannel,
  configureTableChannel,
  tableChannelEnabled,
} from '../../utils/table-service'
import {
  readOfferingUpdate,
  requireConfiguredOffering,
  requireServiceMenus,
  fail,
} from './validation'
import { readInteractionChanges } from './interaction-validation'

export function readOfferingConfiguration(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    fail('Invalid offering configuration.')
  const body = input as Record<string, unknown>
  if (
    Object.keys(body).some(
      (key) =>
        ![
          'kitchenId',
          'offeringId',
          'option',
          'name',
          'menu_ids',
          'hours',
          'hours_source',
          'enabled',
          'interactions',
          'collection_timing',
        ].includes(key)
    )
  )
    fail('Unsupported offering setting.')
  const option = kitchenOfferingOptions.find(
    (option) => option.key === body.option
  )
  if (!option || typeof body.enabled !== 'boolean')
    return fail('Choose a offering and its availability.')
  if (option.key === 'counter' && body.menu_ids !== undefined)
    fail('Choose menus separately for Eat in and Takeaway.')
  const isNew = body.offeringId === undefined
  if (body.collection_timing !== undefined && option.key !== 'collection')
    fail('Collection timing requires Collection.')
  const base = readOfferingUpdate({
    kitchenId: body.kitchenId,
    offeringId: isNew ? 'new-offering' : body.offeringId,
    changes: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.menu_ids !== undefined ? { menu_ids: body.menu_ids } : {}),
      ...(body.hours !== undefined ? { hours: body.hours } : {}),
      ...(body.hours_source !== undefined
        ? { hours_source: body.hours_source }
        : {}),
      ...(body.collection_timing !== undefined
        ? { collection_timing: body.collection_timing }
        : {}),
    },
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
      fail('Ordering option does not match this offering.')
    return readInteractionChanges({
      kitchenId: base.kitchenId,
      offeringId: base.offeringId,
      type: row.type,
      changes: row.changes,
    })
  })
  if (new Set(interactions.map((row) => row.type)).size !== option.types.length)
    fail('Configure each ordering option once.')
  return {
    ...base,
    isNew,
    option,
    enabled: body.enabled,
    interactions,
  }
}

/** Apply sparse setup changes; public eligibility remains dependent on menus and hours. */
export async function configureKitchenOffering(event: H3Event, input: unknown) {
  const config = readOfferingConfiguration(input)
  const actor = await readKitchenMutationActor(event)
  const id = config.isNew ? randomUUID() : config.offeringId
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const authority = await requireKitchenMutationAuthority(
      tx,
      actor,
      config.kitchenId
    )
    const offerings = await readKitchenOfferingsInTransaction(
      tx,
      config.kitchenId
    )
    if (
      config.isNew &&
      offerings.some((offering) =>
        offering.interactions.some(
          (row) =>
            (config.option.types as readonly string[]).includes(row.type) &&
            (!tableServiceChannel(config.option.key) ||
              (row.type !== 'browse' &&
                tableChannelEnabled(
                  row,
                  tableServiceChannel(config.option.key)!
                )))
        )
      )
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'This option already has saved settings. Close and reopen its configuration.',
      })
    }
    const current = offerings.find((offering) => offering.id === id)
    if (!config.isNew && !current)
      throw createError({
        statusCode: 404,
        statusMessage: 'Offering not found.',
      })
    const requestedChannel = tableServiceChannel(config.option.key)
    if (
      current &&
      (current.interactions.some(
        (row) =>
          row.type !== 'browse' &&
          !(config.option.types as readonly string[]).includes(row.type)
      ) ||
        (requestedChannel &&
          !current.interactions.some(
            (row) =>
              row.type !== 'browse' &&
              tableChannelEnabled(row, requestedChannel)
          )))
    )
      throw createError({
        statusCode: 400,
        statusMessage: 'This setup belongs to a different service.',
      })
    const browse = current?.interactions.filter(
      (row) => row.type === 'browse'
    ) || [{ type: 'browse' as const, enabled: true }]
    const offering: KitchenOffering = {
      id,
      name: config.changes.name || current?.name || config.option.label,
      ...(current?.separate ? { separate: true } : {}),
      menu_ids: config.changes.menu_ids ?? current?.menu_ids ?? [],
      ...((
        config.changes.hours === undefined
          ? current?.hours
          : config.changes.hours
      )
        ? {
            hours: (config.changes.hours === undefined
              ? current?.hours
              : config.changes.hours)!,
          }
        : {}),
      ...(config.changes.collection_timing || current?.collection_timing
        ? {
            collection_timing:
              config.changes.collection_timing || current?.collection_timing,
          }
        : {}),
      hours_source:
        config.changes.hours_source ||
        (config.changes.hours ? 'custom' : current?.hours_source) ||
        'kitchen',
      enabled: config.enabled,
      interactions: [
        ...browse,
        ...config.interactions.map((row) => {
          const previous = current?.interactions.find(
            (item) => item.type === row.type
          )
          const channel = tableServiceChannel(config.option.key)
          return patchKitchenOfferingInteraction(row.type, previous, {
            ...row.changes,
            enabled:
              config.option.key === 'counter'
                ? true
                : config.enabled && (row.changes.enabled ?? true),
            ...(channel ? configureTableChannel(channel, config.enabled) : {}),
          })
        }),
      ],
    }
    if (config.option.key === 'counter') {
      offering.menu_ids = [
        ...new Set(
          offering.interactions.flatMap((row) =>
            row.type === 'eat_in' || row.type === 'takeaway'
              ? row.menu_ids || []
              : []
          )
        ),
      ]
    }
    if (offering.menu_ids.length > 100)
      fail('Select up to 100 menus per service.')
    if (offering.hours_source === 'kitchen') delete offering.hours
    if (
      config.changes.hours &&
      offering.hours_source === 'custom' &&
      !hoursWithinParent(
        config.changes.hours,
        resolveKitchenOperationHours(authority.rootData, authority.placeData)
      )
    )
      fail('Serving hours must be within Kitchen service hours.')
    requireConfiguredOffering(offering, true)
    const selectedMenus = []
    const validateMenus =
      config.changes.menu_ids !== undefined ||
      config.interactions.some((row) => row.changes.menu_ids !== undefined)
    // Removing saved choices must remain possible even when other old choices are incompatible.
    const removingOnly = Boolean(
      current &&
        offering.menu_ids.length < current.menu_ids.length &&
        offering.menu_ids.every((menuId) =>
          current.menu_ids.includes(menuId)
        ) &&
        config.interactions.every(
          ({ type, changes }) =>
            !changes.menu_ids ||
            changes.menu_ids.every((menuId) =>
              current.interactions.some(
                (row) =>
                  row.type === type &&
                  'menu_ids' in row &&
                  row.menu_ids?.includes(menuId)
              )
            )
        )
    )
    for (const menuId of validateMenus && !removingOnly
      ? offering.menu_ids
      : []) {
      const menu = await tx.read(
        serverKitchenMenusTarget(config.kitchenId),
        menuId
      )
      if (!menu.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'A selected Menu no longer exists.',
        })
      selectedMenus.push(menu.data || {})
    }
    if (selectedMenus.length) requireServiceMenus(selectedMenus, false)
    const target = serverKitchenOfferingsTarget(config.kitchenId)
    if (current)
      tx.update(target, id, {
        ...kitchenOfferingData(offering),
        ...(config.changes.hours === null || offering.hours_source === 'kitchen'
          ? { hours: FieldValue.delete() }
          : {}),
      })
    else tx.create(target, id, kitchenOfferingData(offering))
    return { ok: true, kitchen_id: config.kitchenId, offering }
  })
}
