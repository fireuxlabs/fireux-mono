import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { PLACE_MUTATION_TARGETS } from '../mutation-targets'
import { normalizePlacePatch } from './normalize-patch'

/** Stage a Place-owned patch after the composing command proves exact authority. */
export function stagePlaceUpdate(
  mutations: GuardedServerTransaction,
  id: string,
  requestedPatch: Record<string, unknown>,
  place: Record<string, unknown>,
  actor: { uid: string; runtimeAppId: string; bucketName: string }
) {
  const patch = normalizePlacePatch(
    requestedPatch,
    {
      bucketName: actor.bucketName,
      placeId: id,
    },
    place
  )

  mutations.update(PLACE_MUTATION_TARGETS.places, id, {
    ...patch,
    updated: serverAuditStamp({
      by: actor.uid,
      ...(actor.runtimeAppId ? { appId: actor.runtimeAppId } : {}),
    }),
  })
}
