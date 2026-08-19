import { useRuntimeConfig } from '#imports'
import { createError, defineEventHandler, setResponseHeaders } from 'h3'
import type { Supplier } from 'fireux-suppliers/runtime/supplier/models/Supplier.model'

export default defineEventHandler(
  async (event): Promise<{ suppliers: Supplier[] }> => {
    const config = useRuntimeConfig(event)
    const baseUrl = String(config.supplierDirectoryBaseUrl || '')
      .trim()
      .replace(/\/$/, '')
    if (
      !/^https:\/\//.test(baseUrl) &&
      !/^http:\/\/localhost(?::\d+)?$/.test(baseUrl)
    ) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Supplier network is not configured.',
      })
    }
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, max-age=30',
    })
    return {
      suppliers: await $fetch<Supplier[]>(`${baseUrl}/api/suppliers`),
    }
  }
)
