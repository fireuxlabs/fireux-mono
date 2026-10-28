import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import { readEcosystem } from '../../../ecosystem/server/identity/read.ts'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return { ecosystem: await readEcosystem(getRouterParam(event, 'id')) }
})
