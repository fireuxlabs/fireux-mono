import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import {
  CONSOLE_TARGET_LIMIT,
  type WorkspaceTargetsResponse,
} from '../../../../../models/utils/workspace-target.model'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from '../../../../server/utils/auth/bearer'
import { getRuntimeFirestore } from '../../../../server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from '../../../../server/utils/ids/path'

const text = (value: unknown) => String(value ?? '').trim()
const normalizedText = (value: unknown) => text(value).toLowerCase()
const APP_SUPPORT_COLLECTIONS: Record<string, string> = {
  blank: 'blanks',
  portfolio: 'portfolios',
  property: 'properties',
  supplier: 'suppliers',
}

export default defineEventHandler(
  async (event: H3Event): Promise<WorkspaceTargetsResponse> => {
    const { uid } = await requireFirebaseBearerUser(
      event,
      'Sign in to view Workspace targets.'
    )
    const family = normalizedText(getRouterParam(event, 'family'))
    const { appId, workspaces } = useFireUXConfig()
    if (!family || !workspaces.includes(family)) {
      throw createError({ statusCode: 404, statusMessage: 'Workspace not found.' })
    }

    const db = getRuntimeFirestore()
    const membershipSnapshot = await db.doc(`apps/${appId}/users/${uid}`).get()
    const role = normalizedText(membershipSnapshot.get('role'))
    if (
      !membershipSnapshot.exists ||
      (role !== 'admin' && role !== 'user')
    ) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Current App membership is required.',
      })
    }

    let ids: string[] = []
    if (family === 'project') {
      const targetsSnapshot = await db.doc(`users/${uid}/private/targets`).get()
      const rawIds = targetsSnapshot.get('project_ids')
      ids = Array.isArray(rawIds)
        ? [...new Set(rawIds.map(text).filter(isFirestoreDocumentId))]
        : []
    } else {
      const collectionName = APP_SUPPORT_COLLECTIONS[family]
      if (!collectionName) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Workspace target provider not found.',
        })
      }
      const supports = db.collection(`apps/${appId}/${collectionName}`)
      const [operatorSnapshot, teamSnapshot] = await Promise.all([
        supports.where('operator_ids', 'array-contains', uid).get(),
        supports.where('team_ids', 'array-contains', uid).get(),
      ])
      ids = [...new Set(
        [...operatorSnapshot.docs, ...teamSnapshot.docs]
          .map(snapshot => text(snapshot.id))
          .filter(isFirestoreDocumentId)
      )]
    }
    if (ids.length > CONSOLE_TARGET_LIMIT) {
      throw createError({
        statusCode: 409,
        statusMessage: `${family} Workspace targets exceed the supported limit.`,
      })
    }

    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
    return {
      ok: true,
      appId,
      family,
      items: ids.map(id => ({ id })),
    }
  }
)
