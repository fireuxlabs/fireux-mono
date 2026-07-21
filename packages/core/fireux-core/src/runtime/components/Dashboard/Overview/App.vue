<!-- Concurrent edit — 2026-07-21 14:57 CEST — Dashboard Overview pass: add an outcome-aware current-App membership and capability layer. -->
<template>
  <UPageCard class="h-full" variant="subtle">
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 items-center gap-3">
        <UAvatar
          :src="appCard?.avatarUrl || undefined"
          :text="appCard?.avatarText || avatarText"
          :alt="appName"
          size="lg"
        />
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <UBadge color="primary" variant="subtle">App</UBadge>
            <UBadge color="neutral" variant="soft">{{ roleLabel }}</UBadge>
          </div>
          <h2 class="mt-2 truncate text-lg font-semibold text-highlighted">
            {{ appName }}
          </h2>
          <p class="mt-1 text-sm text-muted">
            {{
              appCard?.tagline || `Your access and capabilities in ${appName}.`
            }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-5">
      <p
        v-if="appOutcome === 'idle' || appOutcome === 'pending'"
        class="text-sm text-muted"
      >
        Loading current app details…
      </p>
      <UAlert
        v-else-if="appOutcome === 'error'"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="App details unavailable"
        description="Your User profile is still available. Current app details could not be read."
      />
      <UAlert
        v-else-if="appOutcome === 'missing'"
        color="warning"
        variant="soft"
        icon="i-lucide-file-warning"
        title="App setup needs attention"
        description="The app is running, but its shared app details are unavailable. An app administrator may need to check its setup."
      />
      <p v-else-if="appCard?.summary" class="text-sm text-muted">
        {{ appCard.summary }}
      </p>
    </div>

    <USeparator class="my-5" />

    <div>
      <h3 class="font-medium text-highlighted">Your membership</h3>
      <p class="mt-1 text-sm text-muted">
        This access belongs to {{ appName }} and does not change your public
        User.
      </p>

      <div
        v-if="membershipOutcome === 'idle' || membershipOutcome === 'pending'"
        class="mt-4 flex flex-wrap gap-2"
      >
        <USkeleton class="h-6 w-24 rounded-full" />
        <USkeleton class="h-6 w-20 rounded-full" />
      </div>

      <UAlert
        v-else-if="membershipOutcome === 'error'"
        class="mt-4"
        color="error"
        variant="soft"
        icon="i-lucide-shield-alert"
        title="App access unavailable"
        description="Your public identity is unaffected, but this app membership could not be read."
      />

      <UAlert
        v-else-if="membershipOutcome === 'missing'"
        class="mt-4"
        color="warning"
        variant="soft"
        icon="i-lucide-user-round-x"
        title="No app membership"
        :description="missingMembershipDescription"
      />

      <div v-else-if="membership" class="mt-4 flex flex-wrap gap-2">
        <UBadge color="primary" variant="soft">
          {{ membership.role === 'admin' ? 'Administrator' : 'Member' }}
        </UBadge>
        <UBadge
          :color="membership.is_premium ? 'warning' : 'neutral'"
          variant="soft"
        >
          {{ membership.is_premium ? 'Premium' : 'Standard' }}
        </UBadge>
        <UBadge
          v-if="membership.console_enabled"
          color="success"
          variant="soft"
        >
          Console enabled
        </UBadge>
      </div>
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

    <template #footer>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="membershipOutcome === 'missing' && canSelfJoin"
          to="/users/create"
          label="Set up app access"
          icon="i-lucide-user-plus"
        />
        <UButton
          v-if="canOpenConsole"
          :to="consolePath"
          label="Open console"
          icon="i-lucide-panels-top-left"
        />
        <UButton
          to="/dashboard/settings"
          label="Account settings"
          icon="i-lucide-settings"
          color="neutral"
          variant="soft"
        />
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { UserApp } from '../../../models/core/user.model'
import type {
  DashboardOverviewOutcome,
  DashboardOverviewProfileEntry,
} from './types'

const props = defineProps<{
  appName: string
  appShortName: string
  roleLabel: string
  appCard: AppCard.Card | null
  appOutcome: DashboardOverviewOutcome
  membership: UserApp | null
  membershipOutcome: DashboardOverviewOutcome
  profileEntries: DashboardOverviewProfileEntry[]
  canOpenConsole: boolean
  consolePath: string
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

const missingMembershipDescription = computed(() =>
  props.canSelfJoin
    ? `Set up access to use ${props.appName} features. Your public identity already exists.`
    : `This app has not granted you access. Your public identity is unchanged.`
)
</script>
