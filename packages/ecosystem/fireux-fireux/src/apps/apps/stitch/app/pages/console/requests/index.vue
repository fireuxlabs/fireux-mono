<template>
  <UDashboardPanel id="stitch-console-requests">
    <template #header>
      <LayoutsConsoleNavbar title="Requests">
        <template #right>
          <UButton size="sm" color="primary" :loading="createLoading" icon="i-lucide-plus" @click="createNew">Create request</UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search requests" />

        <USkeleton v-if="pending" class="h-56 rounded-lg" />

        <UAlert v-else-if="!rows.length" color="neutral" variant="subtle" title="No requests" description="Create your first capacity request to start matching." />

        <UTable v-else :data="rows" :columns="columns" sticky="header">
          <template #title-cell="{ row }">
            <UButton :to="`/console/requests/${row.original.id}`" color="neutral" variant="link">{{ row.original.title }}</UButton>
          </template>
          <template #status-cell="{ row }">
            <UBadge :label="row.original.status" :color="row.original.status === 'open' ? 'success' : row.original.status === 'paused' ? 'warning' : 'neutral'" variant="soft" />
          </template>
          <template #actions-cell="{ row }">
            <UButton :to="`/console/requests/${row.original.id}`" size="xs" color="primary" variant="soft" icon="i-lucide-pencil">Edit</UButton>
          </template>
        </UTable>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'


definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    key: 'stitch-requests',
    label: 'Requests',
    icon: 'i-lucide-briefcase-business',
    layouts: ['console'],
    desktop: true,
  },
})

const search = ref('')
const { uid } = useAuth()
const { isAdmin } = useUser()
const { createRequest, loading: createLoading } = useStitchRequestCreate()

const managedUid = computed(() => (isAdmin.value ? '' : uid.value || ''))

const { filteredRequests, pending } = useStitchRequests({
  createdByUid: managedUid,
  search,
})

const rows = computed(() =>
  filteredRequests.value.map((request: any) => ({
    id: request.id,
    title: request.title,
    scope: request.scope,
    status: request.status,
    budget: request.budget_type,
  }))
)

const columns: TableColumn<(typeof rows.value)[number]>[] = [
  { accessorKey: 'title', header: 'Request' },
  { accessorKey: 'scope', header: 'Scope' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'budget', header: 'Budget' },
  { accessorKey: 'actions', header: '' },
]

const createNew = async () => {
  const id = await createRequest({
    title: 'New capacity request',
    summary: 'Describe the capacity you need.',
    scope: 'technical audit',
    tags: [],
    budget_type: 'hourly',
    status: 'open',
  })

  await navigateTo(`/console/requests/${id}`)
}
</script>
