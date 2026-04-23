<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Focus</div>
      </div>
    </template>

    <div class="space-y-3">
      <p class="console-card-header__description">
        Selected project and its linked ecosystem.
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
          Ecosystem ID:
          <span class="console-summary-value">{{ ecosystemIdLabel }}</span>
        </div>
      </div>
    </div>
  </UCard>

  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Ecosystem</div>
        <p class="console-card-header__description">
          Ecosystem record linked to the selected project.
        </p>
      </div>
    </template>

    <p v-if="pending" class="console-card-header__description">
      Loading ecosystem…
    </p>

    <EcosystemCardsPill
      v-else-if="ecosystemCard"
      v-bind="ecosystemCard"
      :link="false"
      :show-badges="false"
    />

    <p v-else-if="!ecosystemId" class="console-card-header__description">
      This selected project does not expose an ecosystem id yet.
    </p>

    <p v-else class="console-card-header__description">
      No ecosystem record was found for this project.
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useEcosystemInterface,
  type EcosystemSurface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import type { ConsoleMode } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import type { ProjectSurface } from 'fireux-core/runtime/composables/fireux/firestore/core/project/utils/view/useProjectInterface'

type EcosystemPillCard = NonNullable<
  ReturnType<ReturnType<typeof useEcosystemInterface>['pill']>
>

const props = defineProps<{
  selectedProject: ProjectSurface | null
  selectedMode: ConsoleMode
  ecosystemId: string
  ecosystem: EcosystemSurface | null | undefined
  pending: boolean
}>()

const { pill } = useEcosystemInterface()

const selectedProjectName = computed(() =>
  String(props.selectedProject?.name || '').trim() || 'Untitled'
)
const ecosystemIdLabel = computed(() =>
  String(props.ecosystemId || '').trim() || 'Unset'
)
const selectedModeLabel = computed(() =>
  props.selectedMode === 'demo' ? 'Demo' : props.selectedMode === 'test' ? 'Test' : 'Live'
)

const ecosystemCard = computed<EcosystemPillCard | null>(() => {
  const value = props.ecosystem
  if (!value) return null

  return pill({
    ...value,
    href: value.id ? `/ecosystems/${encodeURIComponent(value.id)}` : '',
    src: value.image_url,
    text: value.name,
    key: value.slug,
  }) ?? null
})
</script>
