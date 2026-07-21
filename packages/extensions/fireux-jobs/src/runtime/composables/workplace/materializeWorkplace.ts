// Concurrent edit — 2026-07-21 12:58 CEST — Misebox Jobs workplace adapter: expose type- and collection-discriminated owner materialization.
import { useNuxtApp } from '#imports'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'

export type JobWorkplaceMaterializationInput = {
  workplaceType?: string
  workplaceCollection?: string
  workplaceId: string
  place: PlaceUpsertInput
}

export type JobWorkplaceMaterializationContext =
  JobWorkplaceMaterializationInput & {
    materialize: (
      owner: string,
      action: () => Promise<void>
    ) => Promise<void>
  }

const hookName = 'fireux:jobs:workplace:materialize'
const normalizeString = (value: unknown) => String(value ?? '').trim()

/**
 * Materialize the workplace entity selected by a neutral type or collection.
 * Place is the neutral base entity and has already been materialized by the
 * caller, so only a more specific discriminator requires an owner adapter.
 */
export async function materializeJobWorkplace(
  input: JobWorkplaceMaterializationInput
): Promise<void> {
  const workplaceType = normalizeString(input.workplaceType)
  const workplaceCollection = normalizeString(input.workplaceCollection)
  const workplaceId = normalizeString(input.workplaceId)

  if (!workplaceId) throw new Error('Workplace id is required')
  if (!workplaceType && !workplaceCollection) {
    throw new Error('Workplace type or collection is required')
  }
  if (
    (!workplaceType || workplaceType === 'place') &&
    (!workplaceCollection || workplaceCollection === 'places')
  ) {
    return
  }

  const discriminator = [workplaceType, workplaceCollection]
    .filter(Boolean)
    .join('/')

  let claimedBy = ''
  let materialized = false

  const context: JobWorkplaceMaterializationContext = {
    ...input,
    workplaceType,
    workplaceCollection,
    workplaceId,
    async materialize(owner, action) {
      const normalizedOwner = normalizeString(owner)
      if (!normalizedOwner) {
        throw new Error(`The "${discriminator}" workplace adapter has no owner`)
      }
      if (claimedBy) {
        throw new Error(
          `Multiple workplace adapters claimed "${discriminator}": ${claimedBy} and ${normalizedOwner}`
        )
      }

      claimedBy = normalizedOwner
      await action()
      materialized = true
    },
  }

  await useNuxtApp().callHook(hookName as any, context as any)

  if (!claimedBy) {
    throw new Error(
      `No workplace adapter is registered for "${discriminator}"`
    )
  }
  if (!materialized) {
    throw new Error(
      `The "${discriminator}" workplace adapter did not materialize its entity`
    )
  }
}
