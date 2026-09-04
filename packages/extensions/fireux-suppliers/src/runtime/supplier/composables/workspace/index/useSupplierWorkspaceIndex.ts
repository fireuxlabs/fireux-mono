import { computed, onMounted, ref, watch, watchEffect } from 'vue'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useWorkspacePageState } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspacePageState'
import {
  defineWorkspaceCapabilityContext,
  type WorkspaceCapabilityContext,
} from 'fireux-core/runtime/composables/fireux/workspace/workspaceCapabilityContext'

export type SupplierWorkspaceIndexState = {
  user: {
    id: string
    anonymous: boolean
    suppliers: string[]
    primarySupplier: string
  }
  supplier: { id: string; name: string; tagline: string; url: string }
}

export type SupplierWorkspaceIndexDerived = {
  status: 'idle' | 'pending' | 'error' | 'empty' | 'ready'
  capability: WorkspaceCapabilityContext
  hasSelection: boolean
  canCreate: boolean
  canSelectMultiple: boolean
}

type PrimaryResponse = {
  current: SupplierWorkspaceIndexState['supplier'] | null
}

export function useSupplierWorkspaceIndex() {
  const { currentUser, hasAuthState } = useAuth()
  const appSession = useAppSession()
  const workspace = useWorkspace('supplier')
  const pageState = useWorkspacePageState('supplier')
  const mounted = ref(false)
  const current = ref<SupplierWorkspaceIndexState['supplier'] | null>(null)
  const pending = ref(false)
  const error = ref<unknown>()
  const primarySupplierId = computed(
    () => appSession.appUser.value?.primary_supplier || ''
  )
  let requestSequence = 0

  async function loadPrimary() {
    const user = currentUser.value
    if (
      !import.meta.client ||
      !hasAuthState.value ||
      !user ||
      !primarySupplierId.value
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
        '/api/workspace/supplier/primary',
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

  const state = computed<SupplierWorkspaceIndexState>(() => {
    const membership = appSession.appUser.value
    return {
      user: {
        id: currentUser.value?.uid || '',
        anonymous: Boolean(currentUser.value?.isAnonymous),
        suppliers: membership?.suppliers || [],
        primarySupplier: primarySupplierId.value,
      },
      supplier: current.value || { id: '', name: '', tagline: '', url: '' },
    }
  })

  const derived = computed<SupplierWorkspaceIndexDerived>(() => {
    const membership = appSession.appUser.value
    let status: SupplierWorkspaceIndexDerived['status'] = 'idle'
    if (!mounted.value || !hasAuthState.value || appSession.pending.value)
      status = 'pending'
    else if (appSession.error.value || error.value) status = 'error'
    else if (!currentUser.value) status = 'idle'
    else if (!primarySupplierId.value) status = 'empty'
    else if (pending.value) status = 'pending'
    else status = current.value ? 'ready' : 'error'

    return {
      status,
      capability: defineWorkspaceCapabilityContext({
        id: 'supplier',
        subject: 'Supplier',
        primitives: {
          create: { available: false, limit: null },
          read: {
            available: Boolean(current.value),
            count: current.value ? 1 : 0,
          },
          update: { available: false },
          delete: { available: false },
        },
        natives: [],
      }),
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
    [currentUser, hasAuthState, primarySupplierId],
    () => void loadPrimary(),
    { immediate: true }
  )
  watchEffect(() =>
    pageState.publish({
      user: state.value.user,
      supplier: state.value.supplier,
      derived: derived.value,
    })
  )
  watch(
    () => state.value.supplier,
    (supplier: SupplierWorkspaceIndexState['supplier']) => {
      if (supplier.id) {
        workspace.activate(
          supplier.id,
          supplier.name,
          supplier.tagline,
          supplier.url
        )
      } else {
        workspace.clearActive()
      }
    },
    { immediate: true }
  )

  return {
    state,
    derived,
    primitives: {},
    natives: {},
    actions: { refresh },
  }
}
