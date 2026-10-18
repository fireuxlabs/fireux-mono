import { readKitchenOfferings } from '../../../kitchen/server/offerings/read'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { createError, getRouterParam, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { KitchenDetailResponse } from '../../../kitchen/models/kitchen-detail.response.ts'
import {
  readKitchenRelatedRecords,
  projectKitchenDetail,
  type KitchenReadScope,
} from '../../../kitchen/server/identity/read.ts'
import { readKitchenByRouteSlug } from '../../../kitchen/server/identity/route-identity.ts'
import { readKitchenSproochliAttachment } from '../../../kitchen/server/core/sproochli-attachment.ts'

const text = (value: unknown) => String(value ?? '').trim()

export default defineLiveReadHandler(
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
    const readScope: KitchenReadScope = {}
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
    const sproochli = await readKitchenSproochliAttachment(db, kitchen.id)
    const detail = projectKitchenDetail(
      document,
      dataByPath,
      readScope,
      sproochli,
      await readKitchenOfferings(db, kitchen.id, {
        kitchen: data,
        place: dataByPath.get('places/' + kitchen.id) || {},
      })
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
