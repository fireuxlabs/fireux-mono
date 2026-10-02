import { computed } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useMembershipAccess } from 'fireux-core/runtime/app/composables/useMembershipAccess'
import { projectAccessCollectionPath } from '../utils/project-access'

/** Live Project associations for the current App membership. */
export function useProjectAccess() {
  const session = useAppSession()
  const { appId } = useFireUXConfig()
  const source = useMembershipAccess(
    () => (appId ? projectAccessCollectionPath(appId) : ''),
    session.uid,
    () => (session.app.value ? session.appUser.value : null)
  )
  const error = computed(() => session.error.value || source.error.value)
  const outcome = computed(() => {
    if (error.value) return 'error' as const
    if (session.pending.value) return 'pending' as const
    return source.outcome.value
  })
  return {
    ids: computed(() =>
      ['ready', 'empty'].includes(outcome.value) ? source.ids.value : []
    ),
    pending: computed(() => outcome.value === 'pending'),
    error,
    outcome,
  }
}
