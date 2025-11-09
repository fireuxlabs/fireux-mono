import { useFetch } from '#imports'
import type { EnvCheckResponse } from '../../../../../types/app/onboarding'

/**
 * Fetches the onboarding environment validation summary from the server.
 */
export function useEnvCheck() {
  return useFetch<EnvCheckResponse>('/api/app/env-check', {
    server: false,
    default: () =>
      ({
        isValid: false,
        required: [],
        optionalClient: [],
        optional: [],
        server: {
          adminAuth: {
            json: false,
            splitKeys: {
              FIREBASE_PROJECT_ID: false,
              FIREBASE_CLIENT_EMAIL: false,
              FIREBASE_PRIVATE_KEY: false,
            },
            configured: false,
          },
          optional: [],
        },
        missingRequired: [],
        summary: {
          required: '0/0',
          optionalClient: '0/0',
          optionalServer: '0/0',
          brandAssets: '0/0',
        },
        warnings: [],
        notes: [],
        brandAssets: [],
      } satisfies EnvCheckResponse),
  })
}
