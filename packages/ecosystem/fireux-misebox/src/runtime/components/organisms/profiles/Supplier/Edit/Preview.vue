<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/components/Organisms/profiles/Supplier/Edit/Preview.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="fx-preview__fallback">Loading supplier preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-4">
        <header class="fx-preview__header">
          <p class="fx-preview__eyebrow">Directory preview</p>
          <p class="fx-preview__copy">
            Supplier listings across Misebox mirror this preview.
          </p>
        </header>

        <div class="grid gap-4">
          <OrganismsProfilesSupplierCardsPill v-if="pill" :supplier="pill" />
          <OrganismsProfilesSupplierCardsCell v-if="cell" :supplier="cell" />
        </div>
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">Supplier preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplier } from '../../../../composables/firestore/profiles/Supplier/useSupplier.ts'

const { pill, cell, pending } = useSupplier()

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
  margin: 0;
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
