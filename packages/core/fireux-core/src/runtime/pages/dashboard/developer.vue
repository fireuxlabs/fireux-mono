<!-- Concurrent edit — 2026-07-21 17:00 CEST — Dashboard Family pass: make Developer a truthful App-scoped workspace. -->
<!-- Concurrent edit — 2026-07-21 20:23 CEST — Developer Dashboard cleanup: remove repeated App chrome and sharpen the page hierarchy. -->
<template>
  <UDashboardPanel id="dashboard-developer">
    <template #header>
      <LayoutsDashboardNavbar title="Developer" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            headline="Developer workspace"
            :title="`Build and verify ${appDisplayName}`"
            description="Manage App media and verify the build connection for this environment."
          >
            <template #links>
              <UButton
                v-if="isAdmin"
                to="/dashboard/admin"
                label="Admin"
                color="neutral"
                variant="soft"
                icon="i-lucide-shield-check"
              />
              <UButton
                v-if="isLocalDev"
                to="/dev"
                label="Dev workbench"
                color="neutral"
                variant="ghost"
                icon="i-lucide-terminal"
              />
            </template>
          </UPageHeader>

          <MoleculesStateCard
            v-if="appOutcome === 'idle' || appOutcome === 'pending'"
            entity="developer workspace"
            kind="document"
            loading
          />

          <MoleculesStateCard
            v-else-if="appOutcome === 'error'"
            entity="developer workspace"
            kind="document"
            state="error"
          />

          <MoleculesStateCard
            v-else-if="appOutcome === 'missing' || !appSnapshot"
            entity="app"
            kind="document"
            state="missing"
          />

          <div v-else>
            <AppEditDev :app="appSnapshot" />
          </div>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta, useHead } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'

const fireux = useFireUXConfig()
const { app, outcome: appOutcome } = useApp()
const { isAdmin } = useUser()

const appSnapshot = computed(() =>
  appOutcome.value === 'ready' ? app.value ?? null : null
)
const appDisplayName = computed(
  () => appSnapshot.value?.app_name || fireux.appName
)
const isLocalDev = import.meta.dev

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-developer',
    label: 'Developer',
    icon: 'i-lucide-code',
    position: 'middle',
    order: 20,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  roles: ['developer'],
})

useHead({ title: 'Developer' })
</script>
