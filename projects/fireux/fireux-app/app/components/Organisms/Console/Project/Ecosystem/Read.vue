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

    <UCard v-if="pending">
      <p class="console-card-header__description">
        Loading ecosystem…
      </p>
    </UCard>

    <EcosystemCollectionManager
      v-else-if="ecosystemCollection.length"
      :collection="ecosystemCollection"
      title="Project Ecosystem"
      description="Ecosystem record linked to the selected project."
      :link="false"
    />

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
import { useProjectConsoleEcosystem } from '../../../../../composables/fireux/console/project/operations/useProjectConsoleEcosystem'

const {
  selectedProject,
  selectedMode,
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
const selectedModeLabel = computed(() =>
  selectedMode.value === 'demo' ? 'Demo' : selectedMode.value === 'test' ? 'Test' : 'Live'
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
</script>
