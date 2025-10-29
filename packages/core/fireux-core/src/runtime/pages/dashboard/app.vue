packages/core/fireux-core/src/runtime/pages/dashboard/app.vue
<template>
  <DashboardEditStructure
    title="App Settings"
    description="Manage app identity, social links, and admin access."
    :guard-message="guardMessage"
    :hero="hero"
    :dev-data="app"
  >
    <OrganismsAppEdit v-if="canEdit && app" :app="app" />
  </DashboardEditStructure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DashboardEditStructure from '../../components/layouts/dashboard/EditStructure.vue'
import OrganismsAppCardsCell from '../../components/organisms/App/Cards/Cell.vue'
// @ts-expect-error Vue SFC import without explicit types
import OrganismsAppEdit from '../../components/organisms/App/Edit.vue'
import { useApp } from '../../composables/firestore/core/app/useApp.ts'
import { useUser } from '../../composables/firestore/core/user/_useUser.ts'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-app',
    label: 'App Settings',
    icon: 'i-lucide-badge-check',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const { app: appRef } = useApp()
const { isAdmin } = useUser()

const canEdit = computed(() => isAdmin.value === true)
const app = computed(() => appRef.value ?? null)

function initialsForApp(target?: {
  app_name?: string | null
  id?: string | null
}) {
  const name = target?.app_name?.trim() ?? ''
  if (name) {
    const [first = '', second = ''] = name.split(/\s+/)
    const combined = `${first[0] ?? ''}${second[0] ?? ''}`.trim()
    if (combined) return combined.toUpperCase()
    if (first) return first.slice(0, 2).toUpperCase()
  }
  const fallback = target?.id?.trim()
  return fallback ? fallback.slice(0, 2).toUpperCase() : 'AP'
}

const guardMessage = computed(() =>
  canEdit.value
    ? null
    : 'You need admin access to manage this app. Ask an existing admin to add you in the Admin Users list.'
)

const hero = computed(() => {
  const value = app.value
  if (!value) return null

  const to = value.id ? `/apps/${value.id}` : null
  return {
    pill: {
      to,
      title: value.app_name || value.id,
      subtitle: value.ecosystem || value.role || null,
      avatar: value.avatar_url || value.logo_url || value.wordmark_url || null,
      initials: initialsForApp(value),
    },
    cellComponent: OrganismsAppCardsCell,
    cellProps: {
      app: value,
      to,
    },
  }
})
</script>
