import { defineEventHandler, setResponseHeaders } from 'h3'
import { textToolContract } from '../../../utils/goQrTextToolContracts'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  const contract = textToolContract()

  return {
    preview_base_url: contract.preview.base_url,
    preview_path_suffix: contract.preview.path_suffix,
    result_base_url: contract.provider.base_url,
  }
})
