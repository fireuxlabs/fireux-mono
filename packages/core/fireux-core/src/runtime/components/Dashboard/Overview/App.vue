<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: turn the App layer into a branded, task-led workspace card. -->
<template>
  <UPageCard class="h-full" variant="subtle">
    <div class="flex items-start gap-4">
      <UAvatar
        :src="appCard?.avatarUrl || undefined"
        :text="appCard?.avatarText || avatarText"
        :alt="appName"
        size="xl"
        class="shrink-0"
      />
      <div class="min-w-0">
        <h2 class="truncate text-xl font-semibold text-highlighted">
          {{ appName }} workspace
        </h2>
        <p class="mt-1 text-sm leading-6 text-muted">
          {{ appCard?.tagline || `Your workspace in ${appName}.` }}
        </p>
      </div>
    </div>

    <div class="mt-5">
      <p
        v-if="appOutcome === 'idle' || appOutcome === 'pending'"
        class="text-sm text-muted"
      >
        Loading workspace details…
      </p>
      <UAlert
        v-else-if="appOutcome === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Workspace details unavailable"
        description="Your public profile is still available. Current app details could not be read."
      />
      <UAlert
        v-else-if="appOutcome === 'missing'"
        color="warning"
        variant="soft"
        icon="i-lucide-file-warning"
        title="Workspace setup needs attention"
        description="The app is running, but its shared details are unavailable. An app administrator may need to check its setup."
      />
      <p v-else-if="appSummary" class="text-sm leading-6 text-muted">
        {{ appSummary }}
      </p>
    </div>

    <div class="mt-6">
      <div
        v-if="membershipOutcome === 'idle' || membershipOutcome === 'pending'"
        class="space-y-3"
      >
        <USkeleton class="h-10 w-52 rounded-lg" />
        <USkeleton class="h-5 w-40 rounded" />
      </div>

      <UAlert
        v-else-if="membershipOutcome === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-shield-alert"
        title="App access unavailable"
        description="Your public identity is unaffected, but this app membership could not be read."
      />

      <UAlert
        v-else-if="membershipOutcome === 'missing'"
        color="warning"
        variant="soft"
        icon="i-lucide-user-round-x"
        title="No app membership"
        :description="missingMembershipDescription"
      />

      <div v-else-if="membership">
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="canOpenWorkspace"
            :to="workspacePath"
            :label="`Open ${workspaceLabel}`"
            :icon="workspaceIcon"
          />
          <UButton
            v-if="canManageApp"
            to="/dashboard/admin"
            :label="`Manage ${appName}`"
            icon="i-lucide-shield-check"
            color="neutral"
            variant="soft"
          />
        </div>

        <div class="mt-5 flex items-center gap-2 text-sm text-muted">
          <UIcon
            :name="
              membership.role === 'admin'
                ? 'i-lucide-shield-check'
                : 'i-lucide-user-round-check'
            "
            class="size-4 shrink-0"
          />
          <span>{{ membershipLabel }}</span>
        </div>
      </div>

      <UButton
        v-if="membershipOutcome === 'missing' && canSelfJoin"
        class="mt-4"
        to="/users/create"
        label="Set up app access"
        icon="i-lucide-user-plus"
      />
    </div>

    <template v-if="membershipOutcome === 'ready' && profileEntries.length">
      <USeparator class="my-5" />

      <div>
        <h3 class="font-medium text-highlighted">Profiles in this app</h3>
        <p class="mt-1 text-sm text-muted">
          Open active profiles or create one of the profiles this app supports.
        </p>

        <div class="mt-4 space-y-2">
          <div
            v-for="entry in profileEntries"
            :key="entry.profileId"
            class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2.5"
          >
            <div class="flex min-w-0 items-center gap-3">
              <UIcon
                :name="entry.icon || 'i-lucide-user-round'"
                class="size-5 shrink-0 text-dimmed"
              />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ entry.label }}
                </p>
                <p class="text-xs text-muted">
                  {{ entry.active ? 'Active profile' : 'Available to create' }}
                </p>
              </div>
            </div>
            <UButton
              :to="entry.to"
              :label="entry.active ? 'Open' : 'Create'"
              :aria-label="`${entry.active ? 'Open' : 'Create'} ${entry.label} profile`"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
        </div>
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../app/composables/useAppInterface'
import type { CurrentAppMembership } from '../../../app/models/app-context.model.ts'
import type {
  DashboardOverviewOutcome,
  DashboardOverviewProfileEntry,
} from './types'

const props = defineProps<{
  appName: string
  appShortName: string
  appCard: AppCard.Card | null
  appOutcome: DashboardOverviewOutcome
  membership: CurrentAppMembership | null
  membershipOutcome: DashboardOverviewOutcome
  profileEntries: DashboardOverviewProfileEntry[]
  canOpenWorkspace: boolean
  workspacePath: string
  workspaceLabel: string
  workspaceIcon: string
  canManageApp: boolean
  canSelfJoin: boolean
}>()

const avatarText = computed(() =>
  props.appShortName
    .split(/\s+/g)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
)

const appSummary = computed(() => {
  const summary = props.appCard?.summary.trim() || ''
  const tagline = props.appCard?.tagline.trim() || ''
  return summary && summary !== tagline ? summary : ''
})

const missingMembershipDescription = computed(() =>
  props.canSelfJoin
    ? `Set up access to use ${props.appName} features. Your public identity already exists.`
    : 'This app has not granted you access. Your public identity is unchanged.'
)

const membershipLabel = computed(() =>
  props.membership?.role === 'admin'
    ? `Administrator in ${props.appName}`
    : `Member of ${props.appName}`
)
</script>
