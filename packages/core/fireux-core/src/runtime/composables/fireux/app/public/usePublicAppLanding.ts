import { useFetch } from '#imports'
import type { FireuxPublicAppLandingResponse } from '../../../../models/system/public-app-content.model'

export function usePublicAppLanding() {
  return useFetch<FireuxPublicAppLandingResponse>('/api/internal/app/landing', {
    key: 'fireux-public-app-landing',
  })
}
