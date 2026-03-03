<template>
  <UDashboardPanel id="stitch-console-home">
    <template #header>
      <LayoutsConsoleNavbar title="Stitch Console" />
    </template>

    <template #body>
      <div class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge :label="isAdmin ? 'Admin scope' : 'Your scope'" color="primary" variant="soft" />
          <UBadge :label="`${providers.length} providers`" color="neutral" variant="subtle" />
          <UBadge :label="`${requests.length} requests`" color="neutral" variant="subtle" />
        </div>

        <UTabs :items="tabs">
          <template #providers>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <p class="font-medium">Providers</p>
                  <UButton to="/console/providers" size="sm" color="primary" icon="i-lucide-users">Open</UButton>
                </div>
              </template>
              <p class="text-sm text-muted">Manage provider profiles and public visibility.</p>
            </UCard>
          </template>

          <template #requests>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between gap-2">
                  <p class="font-medium">Requests</p>
                  <UButton to="/console/requests" size="sm" color="primary" icon="i-lucide-briefcase-business">Open</UButton>
                </div>
              </template>
              <p class="text-sm text-muted">Create, update, and track capacity requests.</p>
            </UCard>
          </template>
        </UTabs>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

definePageMeta({
  layout: 'console',
  requiresAuth: true,
  nav: {
    key: 'stitch-console-home',
    label: 'Stitch',
    icon: 'i-lucide-briefcase-business',
    layouts: ['console'],
    desktop: true,
    mobile: true,
  },
})

const { uid } = useAuth()
const { isAdmin } = useUser()

const managedUid = computed(() => (isAdmin.value ? '' : uid.value || ''))

const { providers } = useStitchProviders({ onlyPublic: false, createdByUid: managedUid })
const { requests } = useStitchRequests({ createdByUid: managedUid })

const tabs = [
  { label: 'Providers', slot: 'providers', icon: 'i-lucide-users' },
  { label: 'Requests', slot: 'requests', icon: 'i-lucide-briefcase-business' },
]
</script>
