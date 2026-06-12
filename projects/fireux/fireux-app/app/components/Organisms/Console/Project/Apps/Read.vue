<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Focus</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="console-card-header__description">
          Selected project and its linked app.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Project:
            <span class="console-summary-value">{{ selectedProjectName }}</span>
          </div>
          <div class="console-summary-field">
            Primary App ID:
            <span class="console-summary-value">{{ appIdLabel }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="pending">
      <p class="console-card-header__description">
        Loading app…
      </p>
    </UCard>

    <template v-else-if="hasApps">
      <AppCollectionManager
        v-if="ecosystemApps.length"
        :collection="ecosystemApps"
        title="Ecosystem Apps"
        description="Apps that belong to the selected project ecosystem."
        :link="false"
      />

      <AppCollectionManager
        v-if="projectApps.length"
        :collection="projectApps"
        title="Project Apps Outside Ecosystem"
        description="Apps that belong to the project but not to the selected ecosystem."
        :link="false"
      />
    </template>

    <UCard v-else-if="!appId">
      <p class="console-card-header__description">
        This selected project does not expose an app id yet.
      </p>
    </UCard>

    <UCard v-else>
      <p class="console-card-header__description">
        No app record was found for this project.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Project apps"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsoleApps } from '../../../../../composables/fireux/console/project/operations/Apps/useProjectConsoleApps'

const {
  selectedProject,
  appId,
  ecosystemId,
  apps,
  pending,
  debug,
} = useProjectConsoleApps()

const selectedProjectName = computed(() =>
  String(selectedProject.value?.name || '').trim() || 'Untitled'
)
const appIdLabel = computed(() => String(appId.value || '').trim() || 'Unset')

const ecosystemApps = computed(() => {
  const currentEcosystemId = String(ecosystemId.value || '').trim()
  if (!currentEcosystemId) return []

  return apps.value.filter((app) => {
    const appEcosystemId = String(app.ecosystem_id || app.ecosystem || '').trim()
    return appEcosystemId === currentEcosystemId
  })
})
const projectApps = computed(() => {
  const ecosystemAppIds = new Set(ecosystemApps.value.map((app) => app.id))
  return apps.value.filter((app) => !ecosystemAppIds.has(app.id))
})
const hasApps = computed(() => ecosystemApps.value.length > 0 || projectApps.value.length > 0)
</script>
