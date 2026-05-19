import { computed } from '#imports'
import { useAuth } from '../firebase/useAuth'
import { useFireUXConfig } from './FireUXConfig'

/**
 * FireUX developer dashboard access.
 *
 * `DEVELOPER_ID` is an app-runtime uid pin. It is intentionally separate from
 * `DEVELOPER_PIN`, which unlocks app onboarding flows.
 */
export function useDeveloperAccess() {
  const { developerId } = useFireUXConfig()
  const { uid } = useAuth()

  const configuredDeveloperId = computed(() => String(developerId || '').trim())
  const isDeveloper = computed(
    () =>
      Boolean(configuredDeveloperId.value) &&
      uid.value === configuredDeveloperId.value
  )

  return {
    configuredDeveloperId,
    isDeveloper,
  }
}
