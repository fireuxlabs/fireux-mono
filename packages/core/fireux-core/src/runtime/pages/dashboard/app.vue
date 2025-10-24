<template>
  <client-only>
    <UPage>
      <UPageBody class="space-y-6">
        <UPageHeader
          title="App Settings"
          description="Manage app identity, social links, and admin access."
        />

        <UPageCard v-if="!canEdit" variant="subtle">
          <p class="text-sm text-gray-500">
            You need admin access to manage this app. Ask an existing admin to
            add you in the Admin Users list.
          </p>
        </UPageCard>

        <OrganismsAppEdit v-else />
      </UPageBody>
    </UPage>
  </client-only>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrganismsAppEdit from '../../components/organisms/App/Edit.vue'
import { useUser } from '../../composables/firestore/core/user/useUser'

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

const { isAdmin } = useUser()
const canEdit = computed(() => isAdmin.value === true)
</script>
