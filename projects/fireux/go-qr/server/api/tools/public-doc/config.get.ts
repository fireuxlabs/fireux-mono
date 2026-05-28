import { defineEventHandler, setResponseHeaders } from 'h3'
import { docToolContract } from '../../../utils/goQrToolContracts'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })

  const contract = docToolContract()

  return {
    preview_base_url: contract.preview.base_url,
    preview_path_suffix: contract.preview.path_suffix,
    result_base_url: contract.provider.base_url,
  }
})
