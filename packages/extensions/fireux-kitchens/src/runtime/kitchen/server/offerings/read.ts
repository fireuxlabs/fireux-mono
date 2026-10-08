import type { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { GuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readKitchenOfferingRecords } from '../../utils/offerings'
import { serverKitchenOfferingsTarget } from './target'

export async function readKitchenOfferings(
  db: ReturnType<typeof getRuntimeFirestore>,
  kitchenId: string
) {
  const id = requireFirestoreDocumentId(kitchenId, 'Kitchen id')
  const snapshot = await db.collection(`kitchens/${id}/offerings`).get()
  return readKitchenOfferingRecords(
    snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }))
  )
}

export async function readKitchenOfferingsInTransaction(
  tx: GuardedServerTransaction,
  kitchenId: string
) {
  const target = serverKitchenOfferingsTarget(kitchenId)
  const rows: Array<{ id: string; data: Record<string, unknown> }> = []
  let after: string | undefined
  for (;;) {
    const page = await tx.readAll<Record<string, unknown>>(target, 1000, after)
    rows.push(...page)
    if (page.length < 1000) break
    after = page.at(-1)!.id
  }
  return readKitchenOfferingRecords(rows)
}
