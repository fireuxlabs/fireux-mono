<template>
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/app/utils/view/useAppInterface'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'
import type { App } from 'fireux-core/runtime/models/core/app.model'

type AppPillCard = NonNullable<
  ReturnType<ReturnType<typeof useAppInterface>['pill']>
>

const props = defineProps<{
  selectedProject: ProjectSurface | null
  selectedMode: ConsoleMode
  appId: string
  app: App | null | undefined
  pending: boolean
}>()

const { pill } = useAppInterface()

const selectedProjectName = computed(() =>
  String(props.selectedProject?.name || '').trim() || 'Untitled'
)
const appIdLabel = computed(() => String(props.appId || '').trim() || 'Unset')
const selectedModeLabel = computed(() =>
  props.selectedMode === 'demo' ? 'Demo' : props.selectedMode === 'test' ? 'Test' : 'Live'
)

const appCard = computed<AppPillCard | null>(() => {
  const value = props.app
  if (!value) return null
  return pill(value) ?? null
})
</script>
