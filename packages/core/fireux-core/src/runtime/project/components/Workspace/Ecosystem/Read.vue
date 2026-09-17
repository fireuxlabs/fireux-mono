<!-- Concurrent edit — 2026-07-20 16:19 CEST — Workspace Spine project cleanup: render Ecosystem operation outcomes explicitly. -->
<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="workspace-card-header">
          <div class="workspace-card-header__title">Focus</div>
        </div>
      </template>

      <div class="space-y-3">
        <p class="workspace-card-header__description">
          Selected project and its related ecosystems.
        </p>

        <div class="workspace-summary-grid">
          <div class="workspace-summary-field">
            Project:
            <span class="workspace-summary-value">{{
              selectedProjectName
            }}</span>
          </div>
          <div class="workspace-summary-field">
            Ecosystems:
            <span class="workspace-summary-value">{{ ecosystemCount }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <UCard v-if="outcome === 'pending'">
      <p class="workspace-card-header__description">Loading ecosystem…</p>
    </UCard>

    <UCard v-else-if="outcome === 'error'">
      <UAlert
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="Project ecosystems could not be loaded"
        description="Please try again."
      />
    </UCard>

    <UCard v-else-if="outcome === 'ready'">
      <template #header>
        <div class="workspace-card-header">
          <div class="workspace-card-header__title">Project Ecosystems</div>
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

    <UCard v-else-if="outcome === 'empty'">
      <p class="workspace-card-header__description">
        No ecosystem records point to this project.
      </p>
    </UCard>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EcosystemInterfaceInput } from '../../../../ecosystem/composables/useEcosystemView'
import { useEcosystemView } from '../../../../ecosystem/composables/useEcosystemView'
import { useProjectWorkspaceEcosystem } from '../../../composables/workspace/capabilities/Ecosystem/useProjectWorkspaceEcosystem'

// Operation entry spine: docs/concepts/workspace.md
const { selectedProject, ecosystems, outcome } =
  useProjectWorkspaceEcosystem()

const selectedProjectName = computed(
  () => String(selectedProject.value?.name || '').trim() || 'Untitled'
)
const ecosystemCollection = computed<EcosystemInterfaceInput[]>(() => {
  return ecosystems.value.map((value: EcosystemInterfaceInput) => ({
    ...value,
    href: value.id ? `/ecosystems/${encodeURIComponent(value.id)}` : '',
    src: value.image_url,
    text: value.name,
    key: value.id,
  }))
})
const { cell } = useEcosystemView()
const ecosystemCards = computed(() =>
  ecosystemCollection.value
    .map((entry) => cell(entry))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
const ecosystemCount = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
    ? ecosystemCards.value.length
    : '—'
)
</script>
