<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-home">
    <template #header>
      <UDashboardNavbar title="Agent">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium">Hi {{ greetingName }}</p>
                <p class="text-sm text-dimmed">
                  Agent overview — this is the identity that posts jobs.
                </p>
              </div>

              <UButton
                to="/dashboard/agent/profile"
                label="Build agent profile"
                color="neutral"
                size="sm"
              />
            </div>

            <div v-if="showProfileCompletedness" class="space-y-2">
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm text-dimmed">Profile completedness</span>
                <UBadge color="neutral" variant="soft">
                  {{ profileLabel }}
                </UBadge>
              </div>

              <UProgress
                :model-value="profileComplete ?? 0"
                :max="100"
                :ui="{ indicator: 'transition-none duration-0' }"
              />
            </div>

            <div class="text-sm whitespace-pre-wrap">
Thank you so much for your message. It's lovely that you're thinking of us 😊

You are welcome to advertise our "unsolicited applications" as job openings:

Cook/Chef https://jobs.huettenzauber.ch/publication/koch-huettenzauber/fk5batbzlnlfcengdagdj5vlk5tiyhbzp17sck3ghwl43i67mm0phm53e27kentq
Service staff https://jobs.huettenzauber.ch/publication/servicemitarbeitende-huettenzauber/ixodqfuayt8hyz10ummbub6k2ichvbjoczqodleob0tqv1yjkxt8hxzwjzaqorye

Do you need any further information from us?

Good evening and happy holidays

Miriam
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-home',
    label: 'Agent',
    icon: 'i-lucide-shield-user',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { currentUser } = useUser()
const greetingName = computed(() => {
  const user = currentUser.value
  return user?.display_name?.trim() || user?.email?.trim() || 'there'
})

const { coreProfile } = useAgent()

const profileComplete = computed<number | null>(() => {
  if (coreProfile.value === undefined) return null
  const profile = coreProfile.value ?? null
  if (!profile) return 0

  const isFilledString = (value?: string | null) => Boolean(value?.trim())
  const isFilledArray = (value?: unknown[] | null) =>
    Array.isArray(value) && value.length > 0

  const checks: boolean[] = [
    isFilledString(profile.title ?? null),
    isFilledString(profile.tagline ?? null),
    isFilledString(profile.bio_short ?? null),
    isFilledString(profile.contact_email ?? null),
    isFilledString(profile.website_url ?? null),
    isFilledArray(profile.badges ?? null),
  ]

  const complete = checks.filter(Boolean).length
  const total = checks.length
  return Math.round((complete / total) * 100)
})

const showProfileCompletedness = computed(() => {
  return profileComplete.value == null || profileComplete.value < 100
})

const profileLabel = computed(() => {
  if (profileComplete.value == null) return '—'
  return `${profileComplete.value}%`
})
</script>
