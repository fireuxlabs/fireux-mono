<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue -->
<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: let UDashboardPanel own body rhythm. -->
<template>
  <UDashboardPanel id="console-agent-home">
    <template #header>
      <LayoutsDashboardNavbar title="Agent" />
    </template>

    <template #body>
      <div class="grid gap-4 lg:grid-cols-3">
        <UCard class="lg:col-span-2">
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
                label="Edit profile"
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
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-sparkles" />
              Quick actions
            </div>
          </template>

          <div class="space-y-2">
            <UButton
              to="/dashboard/agent/profile"
              label="Update agent profile"
              color="neutral"
              block
            />
            <UButton
              to="/dashboard/agent/my-gigs"
              label="View my gigs"
              variant="soft"
              color="neutral"
              block
            />
          </div>
        </UCard>
      </div>

      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-sm font-semibold">
            <UIcon name="i-lucide-flag" />
            Next steps
          </div>
        </template>

        <ul class="space-y-2 text-sm text-dimmed">
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="text-primary" />
            Add placement types and coverage areas to improve matching.
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="text-primary" />
            Add a profile image to build trust with candidates.
          </li>
          <li class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="text-primary" />
            Review your gigs to keep postings current.
          </li>
        </ul>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 17:14 CEST — Repo Efficiency Pass 2 of 6: calculate Agent completeness from canonical fields only.
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { computed } from 'vue'
import { useAgent } from '../../../composables/fireux/firestore/profiles/Agent/useAgent'

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['agent'] },
    key: 'dashboard-agent-home',
    label: 'Agent',
    icon: 'i-lucide-shield-user',
    position: 'middle',
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
  return user?.display_name?.trim() || 'there'
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
    isFilledString(profile.summary ?? null),
    isFilledString(profile.agent_bio ?? null),
    isFilledString(profile.agent_contact_email ?? null),
    isFilledString(profile.agent_website_url ?? null),
    isFilledArray(profile.agent_placement_types ?? null),
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
