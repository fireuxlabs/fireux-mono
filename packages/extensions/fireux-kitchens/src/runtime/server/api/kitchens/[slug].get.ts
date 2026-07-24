// Concurrent edit — 2026-07-24 17:35 CEST — Kitchen public family: resolve exact public detail through the shared projection.
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type {
  PublicKitchenDetailResponse,
} from '../../../models/kitchen/kitchen-index.model.ts'
import {
  hydrateKitchenPublicDocuments,
  isPublishedKitchen,
  projectPublicKitchenDetail,
  type KitchenPublicDirectoryScope,
} from '../../kitchen/public-projection.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(
  async (event): Promise<PublicKitchenDetailResponse> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })

    const slug = text(getRouterParam(event, 'slug')).toLowerCase()
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kitchen slug is required.',
      })
    }

    const db = getRuntimeFirestore()
    const snapshot = await db
      .collection('kitchens')
      .where('slug', '==', slug)
      .limit(2)
      .get()
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Kitchen could not be read.',
        })
      })
    if (!snapshot.docs.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }
    if (snapshot.docs.length > 1) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen slug is not canonical.',
      })
    }

    const kitchenSnapshot = snapshot.docs[0]
    const data = kitchenSnapshot?.data() || {}
    if (!kitchenSnapshot || !isPublishedKitchen(data)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    const document = {
      id: kitchenSnapshot.id,
      data,
    }
    const dataByPath = await hydrateKitchenPublicDocuments(db, [document])
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Kitchen relationships could not be read.',
        })
      })
    const fireux = useFireUXConfig()
    const directoryScope: KitchenPublicDirectoryScope = {
      appId: fireux.appId,
      ecosystemId: text(fireux.ecosystemId || fireux.ecosystem),
      role: fireux.role,
    }
    const item = projectPublicKitchenDetail(
      document,
      dataByPath,
      directoryScope
    )
    if (!item) {
      throw createError({
        statusCode: 503,
        statusMessage: 'The published Kitchen is not canonical.',
      })
    }

    return { item }
  }
)
