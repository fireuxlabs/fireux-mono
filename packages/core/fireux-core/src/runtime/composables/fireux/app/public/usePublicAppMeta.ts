import { useFetch } from '#imports'
import type { FireuxPublicAppMetaResponse } from '../../../../models/system/public-app-content.model'

export function usePublicAppMeta() {
  return useFetch<FireuxPublicAppMetaResponse>('/api/public/app/meta', {
    key: 'fireux-public-app-meta',
  })
}
