<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/components/Organisms/profiles/Supplier/Edit/PreviewPanel.vue -->
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

        <component
          :is="wrapperFor(previewCard)"
          v-if="showCellCard && previewCard"
          v-bind="wrapperPropsFor(previewCard)"
          class="block"
        >
          <OrganismsProfilesSupplierCardsCell :supplier="previewCard" />
        </component>
        <component
          :is="wrapperFor(previewCard)"
          v-else-if="previewCard"
          v-bind="wrapperPropsFor(previewCard)"
          class="block"
        >
          <OrganismsProfilesSupplierCardsPill v-bind="previewCard" />
        </component>
      </UCard>

      <UCard v-else>
        <p class="fx-preview__fallback">Supplier preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupplier } from '../../../../../composables/fireux/firestore/profiles/Supplier/useSupplier'

const { coreProfile, pending, card } = useSupplier()

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

const wrapperFor = (card: ReturnType<typeof card> | null) => (card?.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (card: ReturnType<typeof card> | null) => (card?.to ? { to: card.to } : {})
</script>
