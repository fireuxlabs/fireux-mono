import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import type { ProjectPublishedIdentity } from 'fireux-core/runtime/project/models/published-identity'

type AppContext = {
  sourcePath: string
  revision: string
  context: {
    title: string
    summary: string
    source: string
    reviewStatus: string
  }
  identity?: {
    name: string
    description: string
    imageUrl: string
    url: string
  }
}

/** FireUX's currently configured App connection; product ids stay out of Core. */
export function useProjectAppContext() {
  const { selectedId } = useWorkspace('project')
  const { currentUser } = useAuth()
  const connected = computed(() => selectedId.value === 'misebox')
  const key = computed(
    () =>
      `project-app-context:${currentUser.value?.uid || 'guest'}:${selectedId.value || 'none'}`
  )
  const { data, pending, error, refresh } = useAsyncData<AppContext | null>(
    key,
    async () => {
      const user = currentUser.value
      if (!connected.value || !user) return null
      return $fetch<AppContext>(
        `/api/internal/control/projects/${encodeURIComponent(selectedId.value)}/app-context`,
        {
          headers: { authorization: `Bearer ${await user.getIdToken()}` },
          timeout: 15000,
          retry: 0,
        }
      )
    },
    { server: false, default: () => null }
  )
  const message = computed(() => {
    if (!connected.value) return ''
    if (!currentUser.value) return 'Sign in to read the connected App identity.'
    if (error.value)
      return error.value.message || 'App context could not be loaded.'
    if (!pending.value && !data.value?.identity)
      return 'The connected App has not published its identity yet.'
    return ''
  })
  const publication = computed<ProjectPublishedIdentity | null>(() =>
    connected.value
      ? {
          projectId: selectedId.value,
          appName: data.value?.identity?.name || 'Misebox',
          sourceUrl: import.meta.dev
            ? 'http://localhost:3001/api/fireux/context/product'
            : 'https://misebox.app/api/fireux/context/product',
          status: pending.value ? 'pending' : message.value ? 'error' : 'ready',
          description:
            message.value || pending.value
              ? ''
              : data.value?.identity?.description || '',
          imageUrl:
            message.value || pending.value
              ? ''
              : data.value?.identity?.imageUrl || '',
          message: message.value,
        }
      : null
  )
  return { connected, data, pending, message, refresh, publication }
}
