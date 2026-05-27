import { defineEventHandler } from 'h3'
import { menuQrPublicBaseUrl } from '../../utils/menuQrDocuments'

export default defineEventHandler(async () => {
  return {
    preview_base_url: menuQrPublicBaseUrl(),
    preview_path_suffix: '/qr',
    result_base_url: '',
  }
})
