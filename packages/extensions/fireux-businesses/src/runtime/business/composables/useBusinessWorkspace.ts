import { useWorkspaceCreation } from 'fireux-core/runtime/workspace/composables/useWorkspaceCreation'
import { computed, watch } from 'vue'
import { useAsyncData, refreshNuxtData, useRoute, type AsyncData } from 'nuxt/app'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useWorkspace, defineWorkspace } from 'fireux-core/runtime/workspace/composables/useWorkspace'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { Business } from '../models/business.model'

export const useBusinessWorkspace = defineWorkspace(() => {
  const selection = useWorkspace('business')
  const route = useRoute()
  const { currentUser, hasAuthState } = useAuth()
  const app = useAppSession()
  const config = useFireUXConfig()
  const capture = useCommandScope([currentUser, app.appUser, () => config.appId])
  const state = useAsyncData(
    () => `business-workspace|${config.appId}|${currentUser.value?.uid || 'guest'}`,
    async (_app, { signal }) => {
      const user = currentUser.value
      const isCurrent = capture()
      if (!user || user.isAnonymous) return { businesses: [] as Business[], accessCount: 0 }
      const token = await user.getIdToken()
      if (!isCurrent()) throw new Error('The account or membership changed.')
      return $fetch<{ businesses: Business[]; accessCount: number }>('/api/workspace/business', {
        signal, cache: 'no-store', headers: { authorization: `Bearer ${token}` },
      })
    },
    { server: false, watch: [currentUser, hasAuthState, app.appUser] }
  )
  const outcome = computed(() => {
    if (!hasAuthState.value || app.pending.value || state.pending.value) return 'pending' as const
    if (app.error.value || state.error.value) return 'error' as const
    return state.data.value?.businesses.length ? 'ready' as const : 'empty' as const
  })
  const creation = useWorkspaceCreation('business', computed(() => ({
    count: state.data.value?.accessCount ?? 0, outcome: outcome.value,
  })))
  const collection = computed(() => outcome.value === 'ready' ? state.data.value?.businesses ?? [] : [])
  watch([collection, outcome, () => route.query.business], () => {
    const requested = typeof route.query.business === 'string' ? route.query.business : ''
    if (requested && collection.value.some((item) => item.id === requested)) selection.select(requested)
    else selection.reconcile(collection.value.map((item) => item.id), outcome.value)
  }, { immediate: true })
  const selected = computed(() => collection.value.find((item) => item.id === selection.selectedId.value) ?? null)
  async function command(method: 'POST' | 'PATCH', body: unknown, ownerIsCurrent: () => boolean = () => true) {
    const payload = structuredClone(body)
    const user = currentUser.value
    const isCurrent = capture()
    if (!user || user.isAnonymous) throw new Error('Sign in to manage a Business.')
    const token = await user.getIdToken()
    if (!isCurrent() || !ownerIsCurrent()) throw new Error('The account, membership or editor changed.')
    const result = await $fetch<{ id: string }>('/api/workspace/business', {
      method, body: payload as Record<string, unknown>, retry: 0,
      headers: { authorization: `Bearer ${token}` },
    })
    await refreshNuxtData()
    if (isCurrent()) selection.select(result.id)
    return { ...result, current: isCurrent() && ownerIsCurrent() }
  }
  return { canCreate: creation.canCreate, showUpgrade: creation.showUpgrade, id: selection.selectedId, selected, collection, outcome, select: selection.select, refresh: state.refresh as AsyncData<unknown, unknown>['refresh'], command }
})
