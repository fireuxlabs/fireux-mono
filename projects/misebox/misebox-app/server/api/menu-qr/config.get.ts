import { defineEventHandler } from 'h3'
import { miseboxPublicBaseUrl, publicMenuBaseUrl } from '../../utils/menuPublicRecords'

export default defineEventHandler(async () => {
  return {
    preview_base_url: publicMenuBaseUrl(),
    preview_path_suffix: '/qr',
    result_base_url: miseboxPublicBaseUrl(),
  }
})
