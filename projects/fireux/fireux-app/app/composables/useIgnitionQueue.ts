import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

export function useIgnitionQueue() {
  type IgnitionStatus =
    | 'new'
    | 'accepted'
    | 'in-progress'
    | 'launched'
    | 'declined'
  type IgnitionOrigin = {
    surface: 'pricing' | 'solution' | 'app-directory'
    ref: string
  }
  type ChecklistKey =
    | 'request_reviewed'
    | 'scope_agreed'
    | 'content_received'
    | 'app_configured'
    | 'customer_reviewed'
    | 'launched'

  type IgnitionRequest = {
    id: string
    status: IgnitionStatus
    contact: { name: string; email: string }
    business: { name: string; website: string; branding: string }
    pages: string[]
    app_job: string
    access: string
    origin: IgnitionOrigin | null
    delivery: Record<ChecklistKey, boolean>
    created_at: string
  }

  type IgnitionCollectionResponse = {
    ok: true
    items: IgnitionRequest[]
  }

  type IgnitionMutationResponse = {
    ok: true
    item: IgnitionRequest
  }

  const statusOptions = [
    { label: 'New', value: 'new' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'In progress', value: 'in-progress' },
    { label: 'Launched', value: 'launched' },
    { label: 'Declined', value: 'declined' },
  ]

  const checklist: { key: ChecklistKey; label: string }[] = [
    { key: 'request_reviewed', label: 'Request reviewed' },
    { key: 'scope_agreed', label: 'Scope agreed' },
    { key: 'content_received', label: 'Content received' },
    { key: 'app_configured', label: 'App configured' },
    { key: 'customer_reviewed', label: 'Customer approved' },
    { key: 'launched', label: 'App launched' },
  ]

  const { currentUser, hasAuthState } = useAuth()
  const mutationError = ref('')
  const updating = ref(new Set<string>())
  const { data, pending, error, refresh } =
    useAsyncData<IgnitionCollectionResponse>(
      'fireux-ignition-requests',
      async () => {
        if (import.meta.server || !hasAuthState.value || !currentUser.value) {
          return { ok: true, items: [] }
        }
        const token = await currentUser.value.getIdToken()
        return $fetch<IgnitionCollectionResponse>(
          '/api/internal/control/ignition-requests',
          { headers: { authorization: `Bearer ${token}` } }
        )
      },
      {
        server: false,
        lazy: false,
        watch: [currentUser, hasAuthState],
      }
    )

  const items = computed(() => data.value?.items ?? [])

  function statusLabel(status: IgnitionStatus) {
    return (
      statusOptions.find((option) => option.value === status)?.label || status
    )
  }

  function statusColor(status: IgnitionStatus) {
    if (status === 'launched') return 'success' as const
    if (status === 'declined') return 'error' as const
    if (status === 'accepted' || status === 'in-progress')
      return 'primary' as const
    return 'neutral' as const
  }

  function brandingLabel(branding: string) {
    if (branding === 'ready') return 'Logo and colours ready'
    if (branding === 'use-existing') return 'Use existing website'
    if (branding === 'help') return 'Needs branding help'
    return branding || 'Not set'
  }

  function titleCaseSlug(value: string) {
    return value
      .split('-')
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ')
  }

  function originLabel(origin: IgnitionOrigin) {
    if (origin.surface === 'pricing') return 'App pricing'
    if (origin.surface === 'solution') {
      return `Solution · ${titleCaseSlug(origin.ref)}`
    }
    return `App example · ${origin.ref}`
  }

  function originTo(origin: IgnitionOrigin) {
    const ref = encodeURIComponent(origin.ref)
    if (origin.surface === 'pricing') return '/pricing/your-app'
    if (origin.surface === 'solution') return `/solutions/${ref}`
    return `/apps/${ref}`
  }

  function formatDate(value: string) {
    if (!value) return 'Date unavailable'
    const date = new Date(value)
    return Number.isNaN(date.valueOf())
      ? 'Date unavailable'
      : new Intl.DateTimeFormat(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(date)
  }

  function completedCount(request: IgnitionRequest) {
    return checklist.filter((step) => request.delivery[step.key]).length
  }

  function operationKey(requestId: string, operation: string) {
    return `${requestId}:${operation}`
  }

  function isUpdating(requestId: string, operation: string) {
    return updating.value.has(operationKey(requestId, operation))
  }

  function errorMessage(error: unknown) {
    const source = error as {
      data?: { statusMessage?: string; message?: string }
      statusMessage?: string
      message?: string
    }
    return (
      source.data?.statusMessage ||
      source.data?.message ||
      source.statusMessage ||
      source.message ||
      'Please try again.'
    )
  }

  async function updateRequest(
    request: IgnitionRequest,
    operation: string,
    body: Record<string, unknown>
  ) {
    const user = currentUser.value
    if (!user || isUpdating(request.id, operation)) return

    mutationError.value = ''
    const key = operationKey(request.id, operation)
    updating.value = new Set(updating.value).add(key)
    try {
      const token = await user.getIdToken()
      const response = await $fetch<IgnitionMutationResponse>(
        `/api/internal/control/ignition-requests/${encodeURIComponent(request.id)}`,
        {
          method: 'PATCH',
          headers: { authorization: `Bearer ${token}` },
          body,
        }
      )
      if (data.value) {
        data.value.items = data.value.items.map((item: IgnitionRequest) =>
          item.id === response.item.id ? response.item : item
        )
      }
    } catch (error) {
      mutationError.value = errorMessage(error)
    } finally {
      const next = new Set(updating.value)
      next.delete(key)
      updating.value = next
    }
  }

  async function setStatus(request: IgnitionRequest, status: string) {
    if (!statusOptions.some((option) => option.value === status)) return
    await updateRequest(request, 'status', { status })
  }

  async function setChecklist(
    request: IgnitionRequest,
    checklistKey: ChecklistKey,
    checked: boolean
  ) {
    await updateRequest(request, checklistKey, {
      checklist_key: checklistKey,
      checked,
    })
  }

  return {
    brandingLabel,
    checklist,
    completedCount,
    error,
    formatDate,
    isUpdating,
    items,
    mutationError,
    originLabel,
    originTo,
    pending,
    refresh,
    setChecklist,
    setStatus,
    statusColor,
    statusLabel,
    statusOptions,
  }
}
