<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/profiles/Professional/Edit/PreviewPanel.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="preview__fallback">Loading professional preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="preview__header">
          <div class="preview__header-content">
            <p class="preview__eyebrow">Directory preview</p>
            <p class="preview__copy">
              This is how your profile appears across FireUX surfaces.
            </p>
          </div>

          <UButton
            v-if="canToggle"
            size="xs"
            variant="ghost"
            class="preview__toggle"
            @click="toggleView"
          >
            {{ showCellView ? 'Show Pill' : 'Show Cell' }}
          </UButton>
        </header>

        <ProfessionalCardsCell
          v-if="showCellCard && previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
        <ProfessionalCardsPill
          v-else-if="previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
      </UCard>

      <UCard v-else>
        <p class="preview__fallback">Professional preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useProfessional } from '../../../../composables/fireux/firestore/profiles/Professional/useProfessional.ts'

const { coreProfile, pending, preview: professionalInterface } = useProfessional()

const previewCard = computed(() => (coreProfile.value ? professionalInterface(coreProfile.value) : null))
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
