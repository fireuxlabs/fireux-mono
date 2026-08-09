// Concurrent edit — 2026-07-24 17:35 CEST — Kitchen public family: resolve exact public detail through the shared projection.
import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type {
  PublicKitchenDetailResponse,
} from '../../../models/kitchen/kitchen-index.model.ts'
import {
  hydrateKitchenPublicDocuments,
  isRoutableKitchen,
  projectPublicKitchenDetail,
  type KitchenPublicDirectoryScope,
} from '../../kitchen/public-projection.ts'
import { readKitchenByRouteSlug } from '../../kitchen/route-identity.ts'

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
    const kitchen = await readKitchenByRouteSlug(db, slug)
      .catch(() => {
        throw createError({
          statusCode: 503,
          statusMessage: 'Kitchen could not be read.',
        })
      })
    const data = kitchen?.data || {}
    if (!kitchen || !isRoutableKitchen(data)) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    const document = {
      id: kitchen.id,
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
        statusMessage: 'The Kitchen is not canonical.',
      })
    }

    return { item }
  }
)
