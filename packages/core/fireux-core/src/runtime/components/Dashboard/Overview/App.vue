<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: turn the App layer into a branded, task-led workspace card. -->
<template>
  <UPageCard variant="subtle">
    <div v-if="appOutcome !== 'ready'">
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
        v-else-if="appOutcome === 'empty'"
        color="warning"
        variant="soft"
        icon="i-lucide-file-warning"
        title="Workspace setup needs attention"
        description="The app is running, but its shared details are unavailable. An app administrator may need to check its setup."
      />
    </div>

    <div v-if="canOpenWorkspace">
      <slot name="workspace">
        <UButton
          v-if="canOpenWorkspace"
          :to="workspacePath"
          label="Open workspace"
          :icon="workspaceIcon"
        />
      </slot>
    </div>

    <div v-if="membershipOutcome !== 'ready' || canManageApp">
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
        v-else-if="membershipOutcome === 'empty'"
        color="warning"
        variant="soft"
        icon="i-lucide-user-round-x"
        title="No app membership"
        :description="missingMembershipDescription"
      />

      <div v-else-if="membership">
        <div class="flex flex-wrap gap-2">
          <UButton
            v-if="canManageApp"
            to="/dashboard/admin"
            :label="`Manage ${appName}`"
            icon="i-lucide-shield-check"
            color="neutral"
            variant="soft"
          />
        </div>
      </div>

      <UButton
        v-if="membershipOutcome === 'empty' && canSelfJoin"
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
import type { AppCard } from '../../../app/composables/useAppView'
import type { AppUserWithId } from '../../../app/models/app-user.model.ts'
import type {
  DashboardOverviewOutcome,
  DashboardOverviewProfileEntry,
} from './types'

const props = defineProps<{
  appName: string
  appShortName: string
  appCard: AppCard | null
  appOutcome: DashboardOverviewOutcome
  membership: AppUserWithId | null
  membershipOutcome: DashboardOverviewOutcome
  profileEntries: DashboardOverviewProfileEntry[]
  canOpenWorkspace: boolean
  workspacePath: string
  workspaceLabel: string
  workspaceIcon: string
  canManageApp: boolean
  canSelfJoin: boolean
}>()

const missingMembershipDescription = computed(() =>
  props.canSelfJoin
    ? `Set up access to use ${props.appName} features. Your public identity already exists.`
    : 'This app has not granted you access. Your public identity is unchanged.'
)
</script>
