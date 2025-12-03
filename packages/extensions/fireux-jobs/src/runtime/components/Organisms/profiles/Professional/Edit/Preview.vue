<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit/Preview.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="fx-preview__fallback">Loading professional preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-4">
        <header class="fx-preview__header">
          <p class="fx-preview__eyebrow">Directory preview</p>
          <p class="fx-preview__copy">
            This is how your profile appears across FireUX surfaces.
          </p>
        </header>

        <div class="grid gap-4">
          <OrganismsProfilesProfessionalCardsPill
            v-if="pill"
            :professional="pill"
          />

          <OrganismsProfilesProfessionalCardsCell
            v-if="cell"
            :professional="cell"
          />
        </div>
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">Professional preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessional } from '../../../../composables/firestore/profiles/Professional/useProfessional.ts'

const { pill, cell, pending } = useProfessional()

const isLoading = computed(() => Boolean(pending.value))
const hasPreview = computed(() => Boolean(pill.value) || Boolean(cell.value))
</script>

<style scoped>
.fx-preview__header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-preview__eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}

.fx-preview__copy {
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.85);
}

.fx-preview__fallback {
  margin: 0;
  padding: 1.25rem 0;
  text-align: center;
  font-size: 0.875rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.6);
}
</style>
