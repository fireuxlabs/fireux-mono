import { defineEventHandler, setResponseHeaders } from 'h3'
import { docToolContract } from '../../../utils/goQrToolContracts'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  return docToolContract()
})
