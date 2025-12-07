<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/components/Organisms/profiles/Supplier/Edit/Preview.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="fx-preview__fallback">Loading supplier preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="fx-preview__header">
          <div class="fx-preview__header-content">
            <p class="fx-preview__eyebrow">Directory preview</p>
            <p class="fx-preview__copy">
              Supplier listings across Misebox mirror this preview.
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

        <OrganismsProfilesSupplierCardsCell
          v-if="showCellCard && cell"
          :supplier="cell"
        />
        <OrganismsProfilesSupplierCardsPill v-else-if="pill" :supplier="pill" />
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">Supplier preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupplier } from '../../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'

const { pillProps, cellProps, pending } = useSupplier()

const pill = computed(() => pillProps())
const cell = computed(() => cellProps())
const isLoading = computed(() => Boolean(pending.value))
const hasPreview = computed(() => Boolean(pill.value || cell.value))

const canToggle = computed(() => Boolean(cell.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)

const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}
</script>

<style scoped>
.fx-preview__header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.fx-preview__header-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-preview__toggle {
  align-self: flex-start;
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
  margin: 0.25rem 0 0;
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
