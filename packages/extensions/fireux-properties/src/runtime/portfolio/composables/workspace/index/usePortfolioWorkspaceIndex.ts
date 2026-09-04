import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'

export type PortfolioWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    portfolios: string[]
    primaryPortfolio: string
  }
  portfolio: { id: string; name: string; tagline: string; url: string }
}

export type PortfolioWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

type PrimaryResponse = {
  current: PortfolioWorkspaceIndexState['portfolio'] | null
}

export function usePortfolioWorkspaceIndex() {
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const workspace = useWorkspace('portfolio')
  const pageState = useWorkspacePageState('portfolio')
  const mounted = ref(false)
  const current = ref<PortfolioWorkspaceIndexState['portfolio'] | null>(null)
  const pending = ref(false)
  const error = ref<unknown>()
  const primaryPortfolioId = computed(
    () => appSession.appUser.value?.primary_portfolio || ''
  )
  let requestSequence = 0

  async function loadPrimary() {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      !primaryPortfolioId.value
    ) {
      current.value = null
      pending.value = false
      error.value = undefined
      return
    }

    const sequence = ++requestSequence
    pending.value = true
    error.value = undefined
    try {
      const response = await $fetch<PrimaryResponse>(
        '/api/workspace/portfolio/primary',
        { headers: { Authorization: `Bearer ${await user.getIdToken()}` } }
      )
      if (sequence === requestSequence) current.value = response.current
    } catch (cause) {
      if (sequence === requestSequence) {
        current.value = null
        error.value = cause
      }
    } finally {
      if (sequence === requestSequence) pending.value = false
    }
  }

  const state = computed<PortfolioWorkspaceIndexState>(() => {
    const membership = appSession.appUser.value
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
        portfolios: membership?.portfolios || [],
        primaryPortfolio: primaryPortfolioId.value,
      },
      portfolio: current.value || { id: '', name: '', tagline: '', url: '' },
    }
  })

  const derived = computed<PortfolioWorkspaceIndexDerived>(() => {
    const membership = appSession.appUser.value
    let outcome: PortfolioWorkspaceIndexDerived['outcome'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appSession.pending.value)
      outcome = 'pending'
    else if (appSession.error.value || error.value) outcome = 'error'
    else if (!currentUser.value) outcome = 'idle'
    else if (!primaryPortfolioId.value) outcome = 'empty'
    else if (pending.value) outcome = 'pending'
    else outcome = current.value ? 'ready' : 'error'

    return {
      outcome,
      hasSelection: Boolean(current.value),
      canCreate: false,
      canSelectMultiple: membership?.subscription === 'business',
    }
  })

  async function refresh() {
    await loadPrimary()
  }

  onMounted(() => {
    mounted.value = true
  })

  watch(
    [currentUser, hasAuthState, primaryPortfolioId],
    () => void loadPrimary(),
    { immediate: true }
  )
  watchEffect(() =>
    pageState.publish({
      user: state.value.user,
      portfolio: state.value.portfolio,
      derived: derived.value,
    })
  )
  watch(
    () => state.value.portfolio,
    (portfolio: PortfolioWorkspaceIndexState['portfolio']) => {
      if (portfolio.id) {
        workspace.activate(
          portfolio.id,
          portfolio.name,
          portfolio.tagline,
          portfolio.url
        )
      } else {
        workspace.clearActive()
      }
    },
    { immediate: true }
  )

  return { state, derived, actions: { refresh } }
}
