<!-- FILE: packages/extensions/fireux-suppliers/src/runtime/components/Supplier/Edit/PreviewPanel.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="preview__fallback">Loading supplier preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="preview__header">
          <div class="preview__header-content">
            <p class="preview__eyebrow">Directory preview</p>
            <p class="preview__copy">
              Supplier listings across Misebox mirror this preview.
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

        <SupplierCardsCell
          v-if="showCellCard && previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
        <SupplierCardsPill
          v-else-if="previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
      </UCard>

      <UCard v-else>
        <p class="preview__fallback">Supplier preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupplier } from '../../../../composables/fireux/firestore/supplier/useSupplier'

const { coreSupplier, pending, preview: supplierInterface } = useSupplier()

const previewCard = computed(() => (coreSupplier.value ? supplierInterface(coreSupplier.value) : null))
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
