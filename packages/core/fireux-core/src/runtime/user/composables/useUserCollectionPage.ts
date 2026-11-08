import { computed, reactive, toRefs } from 'vue'
import { useUserSession } from './session/useUserSession'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useUserDirectory } from './directory/useUserDirectory'
import { useCollectionPage } from '../../composables/shared/useCollectionPage'

/** One Entity acquisition and SEO owner over shared collection-page presentation. */
export function useUserCollectionPage() {
  const { appName } = useFireUXConfig()
  const { user: currentUser, appUser, appUserOutcome } = useUserSession()
  const hasAppMembership = computed(
    () => appUserOutcome.value === 'ready' && Boolean(appUser.value)
  )
  const { users, outcome, error, pending, hasMore, loadMore } =
    useUserDirectory({ currentUser, hasAppMembership })

  const pageTitle = 'Users'
  const pageDescription = 'Browse user profiles.'
  useSeo({
    title: `${appName} | ${pageTitle}`,
    description: pageDescription,
    path: '/users',
    robots: 'index, follow',
  })

  const page = useCollectionPage({
    entity: 'users',
    title: pageTitle,
    description: pageDescription,
    collection: { records: users, outcome: outcome, error },
    pagination: { hasMore, loading: pending, loadMore },
    diagnostics: {
      objects: () => ({
        users: users.value,
        currentUser: currentUser.value,
        appUser: appUser.value,
      }),
      derived: () => ({
        currentSurface: currentUser.value ? 'current' : 'create',
      }),
    },
  })
  return reactive({
    ...toRefs(page),
    users,
    currentUser,
    pending,
  })
}
