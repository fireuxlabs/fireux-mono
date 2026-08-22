import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { KitchenDetailResponse } from '../../../kitchen/models/kitchen-detail.model.ts'
import {
  readKitchenRelatedRecords,
  projectKitchenDetail,
  type KitchenReadScope,
} from '../../../kitchen/server/identity/read.ts'
import { readKitchenByRouteSlug } from '../../../kitchen/server/identity/route-identity.ts'
import { readKitchenSproochliAttachment } from '../../../kitchen/server/core/sproochli-attachment.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineEventHandler(
  async (event): Promise<KitchenDetailResponse> => {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })

    const slug = text(getRouterParam(event, 'kitchen')).toLowerCase()
    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kitchen slug is required.',
      })
    }

    const db = getRuntimeFirestore()
    const kitchen = await readKitchenByRouteSlug(db, slug).catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen could not be read.',
      })
    })
    const data = kitchen?.data || {}
    if (!kitchen) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Kitchen not found.',
      })
    }

    const document = {
      id: kitchen.id,
      data,
    }
    const fireux = useFireUXConfig()
    const readScope: KitchenReadScope = {
      ecosystem: fireux.ecosystem,
    }
    const dataByPath = await readKitchenRelatedRecords(
      db,
      [document],
      readScope
    ).catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen relationships could not be read.',
      })
    })
    const sproochli = await readKitchenSproochliAttachment(db, kitchen.id, data)
    const detail = projectKitchenDetail(
      document,
      dataByPath,
      readScope,
      sproochli
    )
    if (!detail) {
      throw createError({
        statusCode: 503,
        statusMessage: 'The Kitchen is not canonical.',
      })
    }

    return detail
  }
)
