<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: turn the App layer into a branded, task-led workspace card. -->
<template>
  <UPageCard variant="subtle">
    <div v-if="appOutcome !== 'ready'">
      <p v-if="appOutcome === 'idle' || appOutcome === 'pending'">
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
      <FireState
        v-if="membershipOutcome === 'idle' || membershipOutcome === 'pending'"
        outcome="pending"
        entity="App membership"
      />

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
        description="This app has not granted you access. Your public identity is unchanged."
      />

      <div v-else-if="membership">
        <div class="fx-card__actions">
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
    </div>

    <template v-if="membershipOutcome === 'ready' && profileEntries.length">
      <USeparator />

      <div>
        <h3>Profiles in this app</h3>
        <p>
          Open active profiles or create one of the profiles this app supports.
        </p>

        <div>
          <div v-for="entry in profileEntries" :key="entry.profileId">
            <div>
              <UIcon :name="entry.icon || 'i-lucide-user-round'" />
              <div>
                <p>
                  {{ entry.label }}
                </p>
                <p>
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
import type { AppUserWithId } from '../../../app/models/app-user.model.ts'
import type {
  DashboardOverviewOutcome,
  DashboardOverviewProfileEntry,
} from './types'

defineProps<{
  appName: string
  appOutcome: DashboardOverviewOutcome
  membership: AppUserWithId | null
  membershipOutcome: DashboardOverviewOutcome
  profileEntries: DashboardOverviewProfileEntry[]
  canOpenWorkspace: boolean
  workspacePath: string
  workspaceLabel: string
  workspaceIcon: string
  canManageApp: boolean
}>()
</script>
