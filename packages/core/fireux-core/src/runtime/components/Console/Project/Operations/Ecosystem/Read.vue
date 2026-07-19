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
          Selected project and its related ecosystems.
        </p>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Project:
            <span class="console-summary-value">{{ selectedProjectName }}</span>
          </div>
          <div class="console-summary-field">
            Ecosystems:
            <span class="console-summary-value">{{ ecosystemCards.length }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="pending">
      <p class="console-card-header__description">
        Loading ecosystem…
      </p>
    </UCard>

    <UCard v-else-if="ecosystemCards.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Project Ecosystems</div>
        </div>
      </template>

      <div class="space-y-3">
        <EcosystemCardsCell
          v-for="card in ecosystemCards"
          :key="card.id"
          v-bind="card"
          :link="false"
        />
      </div>
    </UCard>

    <UCard v-else>
      <p class="console-card-header__description">
        No ecosystem records point to this project.
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
  ecosystems,
  pending,
  debug,
} = useProjectConsoleEcosystem()

const selectedProjectName = computed(() =>
  String(selectedProject.value?.name || '').trim() || 'Untitled'
)
const ecosystemCollection = computed<EcosystemInterfaceInput[]>(() => {
  return ecosystems.value.map((value) => ({
      ...value,
      href: value.id ? `/ecosystems/${encodeURIComponent(value.id)}` : '',
      src: value.image_url,
      text: value.name,
      key: value.slug,
    }))
})
const { cell } = useEcosystemInterface()
const ecosystemCards = computed(() =>
  ecosystemCollection.value
    .map((entry) => cell(entry))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> => Boolean(card))
)
</script>
