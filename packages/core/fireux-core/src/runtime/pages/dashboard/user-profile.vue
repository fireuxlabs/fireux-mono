<!-- packages/core/fireux-core/src/runtime/pages/dashboard/user-profile.vue -->
<template>
  <UDashboardPanel id="user-profile">
    <template #header>
      <UDashboardNavbar title="User Profile" :ui="{ right: 'gap-2' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-eye"
            size="sm"
            variant="soft"
            :color="activeSection === 'preview' ? 'primary' : 'gray'"
            :aria-pressed="activeSection === 'preview'"
            @click="toggleSection"
          >
            <span class="hidden sm:inline">
              {{ activeSection === 'preview' ? 'Show editor' : 'Show preview' }}
            </span>
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="currentUser" class="space-y-6">
        <div class="grid gap-6 lg:grid-cols-2">
          <Transition name="fade-toggle">
            <OrganismsUserEditPreview
              v-show="showPreview"
              :user="currentUser"
              :pill="currentUserPill"
              :link="userLink"
            />
          </Transition>

          <Transition name="fade-toggle">
            <OrganismsUserEditUser
              v-show="showEditor"
              :user="currentUser"
              :is-tenant="isTenant"
            />
          </Transition>
        </div>
      </div>

      <div
        v-else
        class="rounded border border-gray-200 bg-white py-8 text-center shadow-sm"
      >
        <UIcon
          name="i-heroicons-user-circle"
          class="mx-auto mb-4 h-12 w-12 text-gray-400"
        />
        <p>{{ isLoading ? 'Loading profile...' : 'Profile not found.' }}</p>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useUser } from '../../composables/firestore/core/user/useUser'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-user-profile',
    label: 'User Profile',
    icon: 'i-lucide-user',
    order: 30,
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const useHeadFn = (globalThis as any).useHead as
  | undefined
  | ((input: any) => void)
useHeadFn?.({ title: 'Your Profile' })

const { currentUser, pillProps, isLoading } = useUser()
const activeSection = ref<'preview' | 'edit'>('edit')

const breakpoints = useBreakpoints(breakpointsTailwind)
const isDesktop = breakpoints.greaterOrEqual('lg')

const showPreview = computed(
  () => isDesktop.value || activeSection.value === 'preview'
)
const showEditor = computed(
  () => isDesktop.value || activeSection.value === 'edit'
)

const toggleSection = () => {
  activeSection.value = activeSection.value === 'preview' ? 'edit' : 'preview'
}

const currentUserPill = computed(() =>
  currentUser.value ? pillProps(currentUser.value) : null
)
const userLink = computed(() =>
  currentUser.value?.id ? `/users/${currentUser.value.id}` : null
)

const config = useFireUXConfig()
const isTenant = computed(
  () =>
    config.role === 'tenant' &&
    typeof config.appId === 'string' &&
    config.appId.length > 0
)
</script>
