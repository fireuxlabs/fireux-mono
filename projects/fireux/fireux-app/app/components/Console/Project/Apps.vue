<template>
  <section class="console-surface space-y-4">
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
            Mode:
            <span class="console-summary-value">{{ selectedModeLabel }}</span>
          </div>
          <div class="console-summary-field">
            App ID:
            <span class="console-summary-value">{{ appIdLabel }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">App</div>
          <p class="console-card-header__description">
            App record linked to the selected project.
          </p>
        </div>
      </template>

      <p v-if="pending" class="console-card-header__description">
        Loading app…
      </p>

      <AppCardsPill
        v-else-if="appCard"
        v-bind="appCard"
        :link="false"
        :show-badges="false"
      />

      <p v-else-if="!appId" class="console-card-header__description">
        This selected project does not expose an app id yet.
      </p>

      <p v-else class="console-card-header__description">
        No app record was found for this project.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useProjectConsoleApps } from '../../../composables/fireux/project-console/useProjectConsoleApps'

type AppPillCard = NonNullable<
  ReturnType<ReturnType<typeof useAppInterface>['pill']>
>

const { selectedProject, selectedMode, appId, app, pending } = useProjectConsoleApps()
const { pill } = useAppInterface()

const selectedProjectName = computed(() => String(selectedProject.value?.name || '').trim() || 'Untitled')
const appIdLabel = computed(() => String(appId.value || '').trim() || 'Unset')
const selectedModeLabel = computed(() =>
  selectedMode.value === 'demo' ? 'Demo' : selectedMode.value === 'test' ? 'Test' : 'Live'
)

const appCard = computed<AppPillCard | null>(() => {
  const value = app.value
  if (!value) return null
  return pill(value) ?? null
})
</script>
