<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Agent/Edit/PreviewPanel.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="fx-preview__fallback">Loading agent preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="fx-preview__header">
          <div class="fx-preview__header-content">
            <p class="fx-preview__eyebrow">Directory preview</p>
            <p class="fx-preview__copy">
              Snapshot of how your agent profile renders inside FireUX.
            </p>
          </div>

          <UButton
            v-if="canToggle"
            size="xs"
            variant="ghost"
            class="fx-preview__toggle"
            @click="toggleView"
          >
            {{ showCellView ? 'Show Pill' : 'Show Cell' }}
          </UButton>
        </header>

        <OrganismsProfilesAgentCardsCell
          v-if="showCellCard && previewCard"
          v-bind="previewCard"
        />
        <OrganismsProfilesAgentCardsPill v-else-if="previewCard" v-bind="previewCard" />
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">Agent preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAgent } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent.ts'

const { coreProfile, pending, card } = useAgent()

const previewCard = computed(() => (coreProfile.value ? card(coreProfile.value) : null))
const isLoading = computed(() => Boolean(pending.value))
const hasPreview = computed(() => Boolean(previewCard.value))

const canToggle = computed(() => Boolean(previewCard.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)

const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}
</script>
