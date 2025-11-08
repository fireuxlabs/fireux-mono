packages/core/fireux-core/src/runtime/pages/dashboard/app.vue
<template>
  <DashboardEditStructure
    title="App Settings"
    description="Manage app identity, social links, and admin access."
    :guard-message="'You need admin access to manage this app. Ask an existing admin to add you in the Admin Users list.'"
    :hero="hero"
    :dev-data="app"
  >
    <OrganismsAppEdit v-if="isAdmin && currentApp" :app="currentApp" />
    <template v-else-if="!isLoading && !isAdmin">
      <p class="text-sm text-gray-500">
        You don’t have permission to edit this app.
      </p>
    </template>
  </DashboardEditStructure>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useApp } from '../../composables/firestore/core/app/useApp.ts'
import { useUser } from '../../composables/firestore/core/user/useUser.ts'

const { app } = useApp()
const { isAdmin } = useUser()
const router = useRouter()

const isLoading = computed(() => app.value === undefined)
const currentApp = computed(() => (app.value === undefined ? null : app.value ?? null))

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

const hero = computed(() => {
  const value = currentApp.value
  if (!value) return null

  const to = value.id ? `/apps/${value.id}` : null
  return {
    pill: {
      to,
      title: value.app_name || value.id,
      subtitle: value.ecosystem || value.role || null,
      avatar: value.avatar_url || value.logo_url || value.wordmark_url || null,
      initials: 'A',
    },
    cellComponent: 'OrganismsAppCardsCell',
    cellProps: {
      app: value,
      to,
    },
  }
})

if (import.meta.client) {
  watch(
    () => ({ loading: isLoading.value, admin: isAdmin.value }),
    ({ loading, admin }) => {
      if (!loading && !admin) {
        router.replace('/dashboard')
      }
    },
    { immediate: true }
  )
}
</script>
