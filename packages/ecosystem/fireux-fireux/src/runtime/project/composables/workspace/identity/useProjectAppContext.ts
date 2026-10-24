import { computed, onScopeDispose, ref, watch } from 'vue'
import { hasProjectAppContext } from '../../../utils/app-context-connection'
import { useAsyncData } from '#imports'
import type { NuxtApp } from 'nuxt/app'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import type { ProjectPublishedIdentity } from '../../../models/published-identity'

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
    imageFit?: 'contain' | 'cover'
    url: string
  }
}

/** FireUX's currently configured App connection; product ids stay out of Core. */
export function useProjectAppContext() {
  const { selectedId } = useWorkspace('project')
  const { currentUser } = useAuth()
  const session = useAppSession()
  const config = useFireUXConfig()
  const sources = [currentUser, session.appUser, selectedId, () => config.appId]
  const captureIntent = useCommandScope(sources)
  const epoch = ref(0)
  // A new membership/account lifetime must not reuse an earlier cached projection.
  watch(
    sources,
    () => {
      epoch.value += 1
    },
    { flush: 'sync' }
  )
  const disposed = ref(false)
  onScopeDispose(() => {
    disposed.value = true
  }, true)
  const connected = computed(() => hasProjectAppContext(selectedId.value))
  const signedIn = computed(() =>
    Boolean(currentUser.value && !currentUser.value.isAnonymous)
  )
  const active = computed(
    () => connected.value && signedIn.value && !disposed.value
  )
  const key = computed(
    () =>
      `project-app-context:${currentUser.value?.uid || 'guest'}:${selectedId.value || 'none'}:${epoch.value}`
  )
  const state = useAsyncData<{
    requestKey: string
    context: AppContext
  } | null>(
    key,
    async (_nuxtApp: NuxtApp, { signal }: { signal: AbortSignal }) => {
      const user = currentUser.value
      const projectId = selectedId.value
      const requestKey = key.value
      const isCurrent = captureIntent()
      if (!active.value || !user || signal.aborted) return null
      try {
        const token = await user.getIdToken()
        if (!isCurrent() || signal.aborted) return null
        const context = await $fetch<AppContext>(
          `/api/internal/control/projects/${encodeURIComponent(projectId)}/app-context`,
          {
            headers: { authorization: `Bearer ${token}` },
            signal,
            timeout: 15000,
            retry: 0,
          }
        )
        return isCurrent() && !signal.aborted ? { requestKey, context } : null
      } catch (cause) {
        if (!isCurrent() || signal.aborted) return null
        throw cause
      }
    },
    { server: false, default: () => null }
  )
  const pending = computed(() => active.value && state.pending.value)
  const data = computed(() =>
    active.value &&
    !pending.value &&
    !state.error.value &&
    state.data.value?.requestKey === key.value
      ? state.data.value.context
      : null
  )
  const message = computed(() => {
    if (!connected.value) return ''
    if (!signedIn.value) return 'Sign in to read the connected App identity.'
    if (state.error.value)
      return state.error.value.message || 'App context could not be loaded.'
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
          imageFit: data.value?.identity?.imageFit,
          message: message.value,
        }
      : null
  )
  return {
    connected,
    data,
    pending,
    message,
    refresh: () => state.refresh(),
    publication,
  }
}
