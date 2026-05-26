import { $fetch } from 'ofetch'
import { defineEventHandler } from 'h3'
import { goQrProviderBaseUrl } from '../../../utils/goQrProvider'

type GoQrBrand = {
  name: string
  url: string
  logo_url?: string
}

export default defineEventHandler(async () => {
  const goQrBaseUrl = goQrProviderBaseUrl()
  const poweredBy = await $fetch<GoQrBrand>(`${goQrBaseUrl}/api/brand`)

  return {
    preview_base_url: goQrBaseUrl,
    result_base_url: goQrBaseUrl,
    powered_by: poweredBy,
  }
})
