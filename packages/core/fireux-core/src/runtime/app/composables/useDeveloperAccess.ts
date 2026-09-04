import { computed } from '#imports'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'

/** FireUX developer dashboard access bound to the configured developer uid. */
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
