<!-- Concurrent edit — 2026-07-22 12:38 CEST — Ignition delivery pass: give admins a compact request queue and delivery checklist. -->
<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold text-highlighted">
          Ignition requests
        </h2>
        <p class="text-sm text-muted">
          Accept a request, then work through its launch checklist.
        </p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        :loading="pending"
        @click="refresh()"
      >
        Refresh
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Ignition requests could not be loaded"
      description="Refresh the page and try again."
    />

    <UAlert
      v-if="mutationError"
      color="error"
      variant="soft"
      icon="i-lucide-circle-alert"
      title="Request not updated"
      :description="mutationError"
    />

    <UCard v-if="pending && !items.length">
      <p class="text-sm text-muted">Loading requests...</p>
    </UCard>

    <UCard v-else-if="!items.length && !error">
      <p class="font-medium text-highlighted">No Ignition requests yet.</p>
      <p class="mt-1 text-sm text-muted">
        New requests from /get-started will appear here.
      </p>
    </UCard>

    <UCard v-for="request in items" :key="request.id">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-semibold text-highlighted">
                {{ request.business.name || 'Unnamed business' }}
              </h3>
              <UBadge :color="statusColor(request.status)" variant="soft">
                {{ statusLabel(request.status) }}
              </UBadge>
            </div>
            <p class="mt-1 text-sm text-muted">
              {{ request.contact.name }} · {{ formatDate(request.created_at) }}
            </p>
          </div>

          <USelect
            :model-value="request.status"
            class="w-40"
            :items="statusOptions"
            :disabled="isUpdating(request.id, 'status')"
            @update:model-value="setStatus(request, String($event))"
          />
        </div>
      </template>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <div class="space-y-5">
          <div class="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Contact
              </p>
              <a
                :href="`mailto:${request.contact.email}`"
                class="mt-1 block text-primary hover:underline"
              >
                {{ request.contact.email }}
              </a>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Website
              </p>
              <a
                v-if="request.business.website"
                :href="request.business.website"
                class="mt-1 block break-all text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                {{ request.business.website }}
              </a>
              <p v-else class="mt-1 text-muted">None</p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Branding
              </p>
              <p class="mt-1 text-highlighted">
                {{ brandingLabel(request.business.branding) }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Pages
              </p>
              <p class="mt-1 text-highlighted">
                {{ request.pages.join(', ') || 'None' }}
              </p>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              One job
            </p>
            <p class="mt-1 whitespace-pre-wrap text-highlighted">
              {{ request.app_job }}
            </p>
          </div>

          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-muted">
              Access
            </p>
            <p class="mt-1 whitespace-pre-wrap text-highlighted">
              {{ request.access }}
            </p>
          </div>
        </div>

        <div class="space-y-3 rounded-lg border border-default p-4">
          <div class="flex items-center justify-between gap-3">
            <h4 class="font-semibold text-highlighted">Delivery</h4>
            <UBadge color="neutral" variant="soft">
              {{ completedCount(request) }}/{{ checklist.length }}
            </UBadge>
          </div>

          <p v-if="request.status === 'new'" class="text-sm text-muted">
            Accept this request to start delivery.
          </p>

          <div class="space-y-3">
            <UCheckbox
              v-for="step in checklist"
              :key="step.key"
              :model-value="request.delivery[step.key]"
              :label="step.label"
              :disabled="
                request.status === 'new' ||
                request.status === 'declined' ||
                isUpdating(request.id, step.key)
              "
              @update:model-value="
                setChecklist(request, step.key, Boolean($event))
              "
            />
          </div>
        </div>
      </div>

      <template #footer>
        <p class="font-mono text-xs text-dimmed">{{ request.id }}</p>
      </template>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

type IgnitionStatus =
  | 'new'
  | 'accepted'
  | 'in-progress'
  | 'launched'
  | 'declined'
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
      data.value.items = data.value.items.map((item) =>
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
</script>
