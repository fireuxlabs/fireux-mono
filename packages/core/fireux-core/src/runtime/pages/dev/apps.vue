<template>
  <UPage>
    <UPageHeader
      title="Dev · Apps"
      description="Debug and inspect each app section with its live data and developer utilities."
    />

    <UPageBody class="space-y-10">
      <DevPane
        title="Current app"
        description="Resolved /apps/<id> for this runtime."
        :debug-data="currentAppDev"
        :default-open="hasCurrentApp"
      >
        <template #actions>
          <UButton v-if="hasCurrentApp" size="xs" variant="ghost" @click="toggleAppView">
            {{ appView === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </template>

        <MoleculesStateCard
          v-if="isLoading"
          entity="app"
          kind="document"
          loading
        />

        <MoleculesStateCard
          v-else-if="!hasCurrentApp"
          entity="app"
          kind="document"
        />

        <div v-else class="space-y-4">
          <OrganismsAppCardsPreview
            v-if="appView === 'preview' && appSnapshot"
            v-bind="card(appSnapshot)"
          />

          <OrganismsAppCardsProfile
            v-else-if="appSnapshot"
            v-bind="card(appSnapshot)"
            :app="appSnapshot"
          />
        </div>
      </DevPane>

      <DevPane
        title="App health checks"
        description="Cross-checks admin metadata across users and memberships."
        :checks="appHealthChecks"
      />

      <DevPane
        title="App members"
        description="Live /apps/{id}/users memberships and counts."
        :debug-data="appUsersDev"
        :default-open="hasAppMembers"
      />

      <DevPane
        title="App collection"
        description="Browse apps available to this runtime."
      >
        <OrganismsAppCollectionManager />
      </DevPane>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { definePageMeta } from '#imports'
import { useCardViewToggle } from '../../composables/shared/useCardViewToggle'
import { useApp } from '../../composables/fireux/firestore/core/app/useApp'
import { useAppUsers } from '../../composables/fireux/firestore/core/app/fetch/useAppUsers'
import { useDevHealth } from '../../composables/dev/health/useDevHealth'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/apps'],
  nav: {
    key: 'dev-apps',
    label: 'Apps',
    icon: 'i-lucide-app-window',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
    order: 20,
  },
  title: 'Dev · Apps',
  description: 'Developer view for Apps with section-level dev panels.',
})

const { app, card, pending, isResolved, isInitialized } = useApp()
const { users } = useAppUsers()
const { getChecksForScope } = useDevHealth()

const isLoading = computed(() => app.value === undefined || pending.value)
const appSnapshot = computed(() => app.value ?? null)
const hasCurrentApp = computed(() => Boolean(appSnapshot.value))
const { view: appView, toggleView: toggleAppView } = useCardViewToggle(() => hasCurrentApp.value)
const appUsersList = computed(() => users.value ?? [])

const showOnboardingBlocker = computed(
  () => isResolved.value && !isInitialized.value
)

const currentAppDev = computed(() => ({
  flags: {
    isLoading: isLoading.value,
    showOnboardingBlocker: showOnboardingBlocker.value,
    isInitialized: isInitialized.value,
    hasApp: Boolean(appSnapshot.value),
  },
  app: appSnapshot.value,
}))

const appUsersDev = computed(() => ({
  total: appUsersList.value.length,
  members: appUsersList.value,
}))

const hasAppMembers = computed(() => appUsersList.value.length > 0)
const appHealthChecks = getChecksForScope('apps')
</script>
