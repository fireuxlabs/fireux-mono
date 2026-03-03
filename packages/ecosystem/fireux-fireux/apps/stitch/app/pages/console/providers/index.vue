<template>
  <UDashboardPanel id="stitch-console-providers">
    <template #header>
      <LayoutsConsoleNavbar title="Providers">
        <template #right>
          <UButton to="/join" size="sm" color="primary" icon="i-lucide-user-plus">Create</UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="space-y-4">
        <UInput v-model="search" icon="i-lucide-search" placeholder="Search providers" />

        <USkeleton v-if="pending" class="h-56 rounded-lg" />

        <UAlert v-else-if="!rows.length" color="neutral" variant="subtle" title="No providers" description="Create a provider profile to start listing capacity." />

        <UTable v-else :data="rows" :columns="columns" sticky="header">
          <template #name-cell="{ row }">
            <UButton :to="`/console/providers/${row.original.id}`" color="neutral" variant="link">{{ row.original.name }}</UButton>
          </template>
          <template #status-cell="{ row }">
            <UBadge :label="row.original.status" :color="row.original.status === 'available' ? 'success' : row.original.status === 'limited' ? 'warning' : 'error'" variant="soft" />
          </template>
          <template #actions-cell="{ row }">
            <UButton :to="`/console/providers/${row.original.id}`" size="xs" color="primary" variant="soft" icon="i-lucide-pencil">Edit</UButton>
          </template>
        </UTable>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    key: 'stitch-providers',
    label: 'Providers',
    icon: 'i-lucide-users',
    layouts: ['console'],
    desktop: true,
  },
})

const search = ref('')
const { uid } = useAuth()
const { isAdmin } = useUser()

const managedUid = computed(() => (isAdmin.value ? '' : uid.value || ''))

const { filteredProviders, pending } = useStitchProviders({
  onlyPublic: false,
  createdByUid: managedUid,
  search,
})

const rows = computed(() =>
  filteredProviders.value.map((provider: any) => ({
    id: provider.id,
    name: provider.display_name,
    type: provider.type,
    status: provider.availability,
    visibility: provider.is_public ? 'public' : 'private',
  }))
)

const columns: TableColumn<(typeof rows.value)[number]>[] = [
  { accessorKey: 'name', header: 'Provider' },
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'status', header: 'Availability' },
  { accessorKey: 'visibility', header: 'Visibility' },
  { accessorKey: 'actions', header: '' },
]
</script>
