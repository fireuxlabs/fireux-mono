<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="preview__state">Loading supplier preview…</p>
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
        <p class="preview__state">Supplier preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupplierConsoleIdentity } from '../../../composables/console/identity/useSupplierConsoleIdentity'
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'

const { selectedSupplier } = useSupplierConsoleIdentity()
const { preview: supplierInterface } = useSupplierInterface()

const previewCard = computed(() =>
  selectedSupplier.value ? supplierInterface(selectedSupplier.value) : null
)
const isLoading = computed(() => selectedSupplier.value === undefined)
const hasPreview = computed(() => Boolean(previewCard.value))

const canToggle = computed(() => Boolean(previewCard.value))
const showCellView = ref(false)
const showCellCard = computed(() => canToggle.value && showCellView.value)

const toggleView = () => {
  if (!canToggle.value) return
  showCellView.value = !showCellView.value
}

</script>
