import { useRuntimeConfig } from '#imports'
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  readBody,
} from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { serverKitchenDishesTarget } from '../../../../../../kitchen/server/mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { readString } from 'fireux-core/runtime/server/utils/records/read'
import {
  requireKitchenWriter,
  requireKitchenWriterAccount,
} from '../../../../../../kitchen/server/core/operator-access.ts'

export default defineEventHandler(async (event) => {
  const runtime = useRuntimeConfig()
  const appId = requirePathSegment(runtime.public?.fireux?.id, 'Runtime App id')
  const kitchenId = requirePathSegment(getQuery(event).kitchenId, 'Kitchen id')
  const dishId = requirePathSegment(getRouterParam(event, 'dishId'), 'Dish id')
  const body = await readBody<{ is_flagship?: unknown }>(event)
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => key !== 'is_flagship') ||
    typeof body.is_flagship !== 'boolean'
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide a boolean flagship choice.',
    })
  const isFlagship = body.is_flagship
  const { uid } = await requireKitchenWriter(event, { appId, kitchenId })
  const target = serverKitchenDishesTarget(kitchenId)

  await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (transaction) => {
      await requireKitchenWriterAccount({ appId, kitchenId }, uid, transaction)
      const current = await transaction.read(target, dishId)
      if (!current.exists)
        throw createError({ statusCode: 404, statusMessage: 'Dish not found.' })
      if (readString(current.data?.kitchen_id) !== kitchenId)
        throw createError({
          statusCode: 409,
          statusMessage: 'The stored Dish identity is invalid.',
        })

      const previousIds: string[] = []
      if (isFlagship) {
        let afterId: string | undefined
        while (true) {
          const page = await transaction.query(target, {
            field: 'is_flagship',
            op: '==',
            value: true,
            limit: 100,
            afterId,
          })
          previousIds.push(...page.map((row) => row.id))
          if (page.length < 100) break
          afterId = page[page.length - 1]!.id
        }
      }

      for (const id of previousIds) {
        if (id !== dishId)
          transaction.update(target, id, {
            is_flagship: false,
            updated: serverAuditStamp({ by: uid }),
          })
      }
      transaction.update(target, dishId, {
        is_flagship: isFlagship,
        updated: serverAuditStamp({ by: uid }),
      })
    }
  )

  return { ok: true as const, dish_id: dishId, is_flagship: isFlagship }
})
