// Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: let FireUX App admins accept requests and run their delivery checklist.
import { Timestamp, type UpdateData } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppConversationsTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import {
  parseIgnitionRequestPatch,
  serializeIgnitionRequest,
} from '../../../../utils/ignition-request'
import { requireFireuxAppAdmin } from '../../../../utils/require-fireux-app-admin'

export default defineEventHandler(async (event: H3Event) => {
  const { appId, uid } = await requireFireuxAppAdmin(event)
  const requestId = requireFirestoreDocumentId(
    getRouterParam(event, 'requestId'),
    'Ignition request id'
  )
  const patch = parseIgnitionRequestPatch(await readBody(event))
  const conversations = serverAppConversationsTarget(appId)
  const updated = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const snapshot = await mutations.read<Record<string, unknown>>(
        conversations,
        requestId
      )
      if (!snapshot.exists || !snapshot.data) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Ignition request not found.',
        })
      }

      const source = snapshot.data
      if (source.kind !== 'ignition') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Ignition request not found.',
        })
      }
      const ignition = (source.ignition || {}) as Record<string, unknown>
      const currentStatus = String(ignition.stage || '').trim()
      const timestamp = Timestamp.now()
      const updates: UpdateData<{ updated: { at: Timestamp; by: string }; status: string; ignition: { stage: string; accepted: { at: Timestamp; by: string }; delivery: Record<string, boolean> } }> = {
        updated: { at: timestamp, by: uid },
      }

      if (patch.kind === 'status') {
        updates['ignition.stage'] = patch.status
        updates.status =
          patch.status === 'launched' || patch.status === 'declined'
            ? 'closed'
            : patch.status === 'new'
              ? 'open'
              : 'pending'
        if (patch.status === 'accepted' && currentStatus !== 'accepted') {
          updates['ignition.accepted'] = { at: timestamp, by: uid }
        }
        if (patch.status === 'launched') {
          updates['ignition.delivery.launched'] = true
        }
      } else {
        if (currentStatus === 'new' || currentStatus === 'declined') {
          throw createError({
            statusCode: 409,
            statusMessage: 'Accept this request before starting its checklist.',
          })
        }
        updates[`ignition.delivery.${patch.key}`] = patch.value
        if (patch.key === 'launched') {
          updates['ignition.stage'] = patch.value ? 'launched' : 'in-progress'
          updates.status = patch.value ? 'closed' : 'pending'
        } else if (currentStatus === 'accepted' && patch.value) {
          updates['ignition.stage'] = 'in-progress'
          updates.status = 'pending'
        }
      }

      mutations.update(conversations, requestId, updates)
      return serializeIgnitionRequest(requestId, {
        ...source,
        status: updates.status ?? source.status,
        ignition: {
          ...ignition,
          stage: updates['ignition.stage'] ?? ignition.stage,
          delivery: {
            ...((ignition.delivery || {}) as Record<string, unknown>),
            ...(patch.kind === 'checklist'
              ? { [patch.key]: patch.value }
              : patch.status === 'launched'
                ? { launched: true }
                : {}),
          },
        },
      })
    }
  )

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  return {
    ok: true as const,
    item: updated,
  }
})
