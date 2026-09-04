import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'

export type PropertyWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    properties: string[]
    primaryProperty: string
  }
  property: { id: string; name: string; tagline: string; url: string }
}

export type PropertyWorkspaceIndexDerived = {
  outcome: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

type PrimaryResponse = {
  current: PropertyWorkspaceIndexState['property'] | null
}

export function usePropertyWorkspaceIndex() {
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const workspace = useWorkspace('property')
  const pageState = useWorkspacePageState('property')
  const mounted = ref(false)
  const current = ref<PropertyWorkspaceIndexState['property'] | null>(null)
  const pending = ref(false)
  const error = ref<unknown>()
  const primaryPropertyId = computed(
    () => appSession.appUser.value?.primary_property || ''
  )
  let requestSequence = 0

  async function loadPrimary() {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      !primaryPropertyId.value
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
        '/api/workspace/property/primary',
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

  const state = computed<PropertyWorkspaceIndexState>(() => {
    const membership = appSession.appUser.value
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
        properties: membership?.properties || [],
        primaryProperty: primaryPropertyId.value,
      },
      property: current.value || { id: '', name: '', tagline: '', url: '' },
    }
  })

  const derived = computed<PropertyWorkspaceIndexDerived>(() => {
    const membership = appSession.appUser.value
    let outcome: PropertyWorkspaceIndexDerived['outcome'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appSession.pending.value)
      outcome = 'pending'
    else if (appSession.error.value || error.value) outcome = 'error'
    else if (!currentUser.value) outcome = 'idle'
    else if (!primaryPropertyId.value) outcome = 'empty'
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
    [currentUser, hasAuthState, primaryPropertyId],
    () => void loadPrimary(),
    { immediate: true }
  )
  watchEffect(() =>
    pageState.publish({
      user: state.value.user,
      property: state.value.property,
      derived: derived.value,
    })
  )
  watch(
    () => state.value.property,
    (property: PropertyWorkspaceIndexState['property']) => {
      if (property.id) {
        workspace.activate(
          property.id,
          property.name,
          property.tagline,
          property.url
        )
      } else {
        workspace.clearActive()
      }
    },
    { immediate: true }
  )

  return { state, derived, actions: { refresh } }
}
