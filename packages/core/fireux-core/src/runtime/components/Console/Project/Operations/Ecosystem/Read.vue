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
          Selected project and its linked ecosystem.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Project:
            <span class="console-summary-value">{{ selectedProjectName }}</span>
          </div>
          <div class="console-summary-field">
            Ecosystem ID:
            <span class="console-summary-value">{{ ecosystemIdLabel }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="pending">
      <p class="console-card-header__description">
        Loading ecosystem…
      </p>
    </UCard>

    <UCard v-else-if="ecosystemCard">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Ecosystem</div>
        </div>
      </template>

      <EcosystemCardsCell
        v-bind="ecosystemCard"
        :link="false"
      />
    </UCard>

    <UCard v-else-if="!ecosystemId">
      <p class="console-card-header__description">
        This selected project does not expose an ecosystem id yet.
      </p>
    </UCard>

    <UCard v-else>
      <p class="console-card-header__description">
        No ecosystem record was found for this project.
      </p>
    </UCard>

    <DevFireuxDebugPanel
      title="Project ecosystem"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  EcosystemInterfaceInput,
} from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import { useEcosystemInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'
import { useProjectConsoleEcosystem } from '../../../../../composables/fireux/console/project/operations/Ecosystem/useProjectConsoleEcosystem'

// Operation entry spine: docs/concepts/console.md
const {
  selectedProject,
  ecosystemId,
  ecosystem,
  pending,
  debug,
} = useProjectConsoleEcosystem()

const selectedProjectName = computed(() =>
  String(selectedProject.value?.name || '').trim() || 'Untitled'
)
const ecosystemIdLabel = computed(() =>
  String(ecosystemId.value || '').trim() || 'Unset'
)

const ecosystemCollection = computed<EcosystemInterfaceInput[]>(() => {
  const value = ecosystem.value
  if (!value) return []

  return [
    {
      ...value,
      href: value.id ? `/ecosystems/${encodeURIComponent(value.id)}` : '',
      src: value.image_url,
      text: value.name,
      key: value.slug,
    },
  ]
})
const { cell } = useEcosystemInterface()
const ecosystemCard = computed(() => cell(ecosystemCollection.value[0]))
</script>
