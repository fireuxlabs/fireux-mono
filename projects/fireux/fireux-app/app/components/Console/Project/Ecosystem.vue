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
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  useEcosystemInterface,
} from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import { useProjectConsoleEcosystem } from '../../../composables/fireux/project-console/useProjectConsoleEcosystem'

type EcosystemPillCard = NonNullable<
  ReturnType<ReturnType<typeof useEcosystemInterface>['pill']>
>

const { selectedProject, selectedMode, ecosystemId, ecosystem, pending } = useProjectConsoleEcosystem()
const { pill } = useEcosystemInterface()

const selectedProjectName = computed(() => String(selectedProject.value?.name || '').trim() || 'Untitled')
const ecosystemIdLabel = computed(() => String(ecosystemId.value || '').trim() || 'Unset')
const selectedModeLabel = computed(() =>
  selectedMode.value === 'demo' ? 'Demo' : selectedMode.value === 'test' ? 'Test' : 'Live'
)

const ecosystemCard = computed<EcosystemPillCard | null>(() => {
  const value = ecosystem.value
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
