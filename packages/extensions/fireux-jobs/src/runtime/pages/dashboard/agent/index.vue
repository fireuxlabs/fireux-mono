<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue -->
<!-- Concurrent edit — 2026-07-21 13:52 CEST — CSS necessity pass: let UDashboardPanel own body rhythm. -->
<template>
  <UDashboardPanel id="dashboard-agent-home">
    <template #header>
      <FireLayoutsDashboardNavbar title="Hiring profile" />
    </template>

    <template #body>
      <UPageGrid>
        <UCard>
          <div class="fx-card-body-stack">
            <div class="card__header">
              <div>
                <p>Hi {{ greetingName }}</p>
                <p>This is the public identity that posts jobs.</p>
              </div>

              <UButton
                to="/dashboard/agent/profile"
                label="Edit profile"
                color="neutral"
                size="sm"
              />
            </div>

            <div v-if="showProfileCompletedness" class="fx-card-body-stack">
              <div class="card__header">
                <span>Profile completedness</span>
                <UBadge color="neutral" variant="soft">
                  {{ profileLabel }}
                </UBadge>
              </div>

              <UProgress :model-value="profileComplete ?? 0" :max="100" />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div>
              <UIcon name="i-lucide-sparkles" />
              Quick actions
            </div>
          </template>

          <div class="fx-card-body-stack">
            <UButton
              to="/dashboard/agent/profile"
              label="Update hiring profile"
              color="neutral"
              block
            />
            <UButton
              to="/dashboard/agent/my-gigs"
              label="Review hiring"
              variant="soft"
              color="neutral"
              block
            />
            <UButton
              to="/jobs/manage"
              label="Manage job posts"
              variant="ghost"
              color="neutral"
              block
            />
          </div>
        </UCard>
      </UPageGrid>

      <UCard>
        <template #header>
          <div>
            <UIcon name="i-lucide-flag" />
            Next steps
          </div>
        </template>

        <ul class="fx-card-body-stack">
          <li>
            <UIcon name="i-lucide-check-circle" />
            Add placement types and coverage areas to improve matching.
          </li>
          <li>
            <UIcon name="i-lucide-check-circle" />
            Add a profile image to build trust with candidates.
          </li>
          <li>
            <UIcon name="i-lucide-check-circle" />
            Review your job posts to keep them current.
          </li>
        </ul>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

// Concurrent edit — 2026-07-20 17:14 CEST — Repo Efficiency Pass 2 of 6: calculate Agent completeness from canonical fields only.
import { computed } from 'vue'
import { useAgent } from '../../../user/composables/profiles/Agent/useAgent'

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-jobs'], profiles: ['agent'] },
    key: 'dashboard-agent-home',
    label: 'Hiring profile',
    icon: 'i-lucide-shield-user',
    position: 'middle',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})

const { currentUser } = useUserSession()
const greetingName = computed(() => {
  const user = currentUser.value
  return user?.display_name?.trim() || 'there'
})

const { agentProfile } = useAgent()

const profileComplete = computed<number | null>(() => {
  if (agentProfile.value === undefined) return null
  const profile = agentProfile.value ?? null
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
