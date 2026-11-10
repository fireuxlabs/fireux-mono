import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  KITCHEN_MUTATION_TARGETS,
  serverKitchenMenusTarget,
} from 'fireux-kitchens/runtime/kitchen/server/mutation-targets'
import { readKitchenMenuReview } from 'fireux-kitchens/runtime/menu/server/publication/review'
import {
  readProtectedMenuFile,
  setProtectedMenuFileResponse,
} from 'fireux-kitchens/runtime/menu/server/document/protected-file'
import { assertOperator, context, operator, requireCustomer } from './authority'
import { fail, requestId } from './contract'

/** A request proof grants this reviewed attachment, never general Kitchen access. */
export async function readReviewFile(
  event: H3Event,
  rawId: unknown,
  input: Record<string, unknown>
) {
  const id = requestId(rawId)
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some(
      (key) => !['token', 'operator', 'expectedRevision'].includes(key)
    ) ||
    typeof input.expectedRevision !== 'string' ||
    !/^[a-f0-9]{64}$/.test(input.expectedRevision) ||
    (input.operator !== undefined && typeof input.operator !== 'boolean')
  )
    fail('Review file request is invalid.')
  const { appId, target } = context(event)
  const actor = input.operator === true ? await operator(event) : null
  const result = await readProtectedMenuFile({
    expectedRevision: input.expectedRevision,
    resolve: () =>
      runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        if (actor) await assertOperator(tx, appId, actor.uid)
        else await requireCustomer(tx, appId, id, input.token)
        const record = await tx.read(target, id)
        if (!record.exists) fail('Request not found.', 404)
        const request = record.data!
        if (
          !request.target ||
          request.review?.format !== 'document' ||
          request.review.revision !== input.expectedRevision
        )
          fail('This review has changed. Refresh the request.', 409)
        const { kitchenId, menuId } = request.target
        const review = await readKitchenMenuReview(tx, kitchenId, menuId)
        if (
          review.format !== 'document' ||
          review.revision !== request.review.revision
        )
          fail('This review has changed. Refresh the request.', 409)
        const [kitchen, menu] = await Promise.all([
          tx.read(KITCHEN_MUTATION_TARGETS.kitchens, kitchenId),
          tx.read(serverKitchenMenusTarget(kitchenId), menuId),
        ])
        if (!kitchen.exists || !menu.exists || !menu.data?.doc)
          fail('The reviewed file is unavailable.', 404)
        return {
          kitchenId,
          kitchen: kitchen.data!,
          document: menu.data.doc,
          revision: review.revision,
        }
      }),
  })
  return setProtectedMenuFileResponse(event, result)
}
