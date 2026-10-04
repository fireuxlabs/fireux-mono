<template>
  <ClientOnly>
    <section class="space-y-5" aria-label="Current app">
      <MoleculesStateCard
        v-if="appPending"
        entity="app"
        kind="document"
        loading
      />
      <MoleculesStateCard
        v-else-if="appError"
        entity="app"
        kind="document"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="!appCard"
        entity="app"
        kind="document"
        state="missing"
      />
      <UPageCard
        v-else
        title="Current App"
        icon="i-lucide-box"
        variant="subtle"
      >
        <AppCardsCell v-bind="appCard" link />
        <dl class="mt-5 divide-y divide-default text-sm">
          <div class="py-3 first:pt-0">
            <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
              App ID
            </dt>
            <dd class="mt-1 break-words font-mono text-highlighted">
              {{ appCard.id }}
            </dd>
          </div>
          <div class="py-3 last:pb-0">
            <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Ecosystem
            </dt>
            <dd class="mt-1 font-medium text-highlighted">
              {{ appCard.ecosystem || 'Not assigned' }}
            </dd>
          </div>
        </dl>
      </UPageCard>
    </section>

    <section class="space-y-5" aria-label="App user">
      <MoleculesStateCard
        v-if="appUserOutcome === 'idle' || appUserOutcome === 'pending'"
        entity="app user"
        kind="document"
        loading
      />
      <MoleculesStateCard
        v-else-if="appUserOutcome === 'error'"
        entity="app user"
        kind="document"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="appUserOutcome === 'missing' || !appUser"
        entity="app user"
        kind="document"
        state="missing"
      />
      <UPageCard
        v-else
        title="App User"
        icon="i-lucide-user-round-check"
        variant="subtle"
      >
        <dl class="divide-y divide-default text-sm">
          <div class="py-3 first:pt-0">
            <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Role
            </dt>
            <dd class="mt-1 font-medium capitalize text-highlighted">
              {{ appUser.role }}
            </dd>
          </div>
          <div class="py-3">
            <dt class="text-xs font-medium uppercase tracking-wide text-dimmed">
              Subscription
            </dt>
            <dd class="mt-1">
              <UserAccessBadge :subscription="appUser.subscription" />
            </dd>
          </div>
        </dl>
      </UPageCard>

      <UPageCard
        v-if="profileEntries.length"
        title="Profile types"
        icon="i-lucide-badge-plus"
        variant="subtle"
      >
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="entry in profileEntries"
            :key="entry.profileId"
            class="flex items-center justify-between gap-3 rounded-lg border border-default bg-default px-4 py-3"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium">{{ entry.label }}</p>
              <p class="text-xs text-dimmed">Available to add</p>
            </div>
            <UButton
              :to="entry.to"
              label="Add"
              color="neutral"
              variant="soft"
              size="xs"
            />
          </div>
        </div>
      </UPageCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useUserSession } from '../../user/composables/session/useUserSession'
import { computed } from 'vue'
import { useDashboardNav } from '../../composables/navigation/useDashboardNav'
import { useAppRead } from '../composables/useAppRead'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { useAppView } from '../composables/useAppView'

const { appUser, appOutcome: appUserOutcome } = useUserSession()
const { appId } = useFireUXConfig()
const { app, pending: appPending, error: appError } = useAppRead(appId)
const { toCard: toAppCard } = useAppView(app)
const { availableProfileEntries } = useDashboardNav()
const appCard = computed(() => toAppCard(app.value))
const profileEntries = computed(() =>
  appUserOutcome.value === 'ready' ? availableProfileEntries.value : []
)
</script>
