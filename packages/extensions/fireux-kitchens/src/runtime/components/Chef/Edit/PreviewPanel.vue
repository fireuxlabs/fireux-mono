<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/components/profiles/Chef/Edit/PreviewPanel.vue -->
<template>
  <ClientOnly>
    <section class="space-y-4">
      <UCard v-if="isLoading">
        <p class="preview__fallback">Loading chef preview…</p>
      </UCard>

      <UCard v-else-if="hasPreview" class="space-y-6">
        <header class="preview__header">
          <div class="preview__header-content">
            <p class="preview__eyebrow">Directory preview</p>
            <p class="preview__copy">
              Snapshot of how your chef profile renders inside FireUX.
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

        <ChefCardsCell
          v-if="showCellCard && previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
        <ChefCardsPill
          v-else-if="previewCard"
          v-bind="previewCard"
          :link="Boolean(previewCard.to)"
          class="block"
        />
      </UCard>

      <UCard v-else>
        <p class="preview__fallback">Chef preview unavailable.</p>
      </UCard>
    </section>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useChef } from '../../../composables/fireux/chef/useChef'

const { coreProfile, pending, preview: chefInterface } = useChef()

const previewCard = computed(() => (coreProfile.value ? chefInterface(coreProfile.value) : null))
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
