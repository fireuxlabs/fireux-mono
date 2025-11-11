packages/core/fireux-core/src/runtime/pages/dashboard/app.vue
<template>
  <DashboardEditStructure
    title="App Settings"
    description="Manage app identity, social links, and admin access."
    :guard-message="'You need admin access to manage this app. Ask an existing admin to add you in the Admin Users list.'"
    :hero="hero"
    :dev-data="app"
  >
    <UPageCard v-if="isAdmin && currentApp" variant="subtle">
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <OrganismsAppCardsPill :app="currentAppPill" />
            <OrganismsAppCardsCell :app="currentApp" :to="appLink" />
          </div>
          <OrganismsAppCardsProfile :app="currentApp" />
        </div>

        <OrganismsAppEdit :app="currentApp" />
      </div>
    </UPageCard>

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
import { useAppInterface } from '../../composables/firestore/core/app/main/useAppInterface.ts'

const { app } = useApp()
const { isAdmin } = useUser()
const { pillProps: appPillProps } = useAppInterface(app)
const router = useRouter()

const isLoading = computed(() => app.value === undefined)
const currentApp = computed(() =>
  app.value === undefined ? null : app.value ?? null
)
const appLink = computed(() => {
  const value = currentApp.value
  return value?.id ? `/apps/${value.id}` : null
})
const currentAppPill = computed(() =>
  currentApp.value ? appPillProps(currentApp.value) : null
)

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

  const pill = currentAppPill.value
  const to = appLink.value
  return {
    pillComponent: 'OrganismsAppCardsPill',
    pillProps: pill ? { app: pill } : null,
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
