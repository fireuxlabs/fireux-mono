<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3 class="text-base font-semibold">Surfaces</h3>
          <p class="text-xs text-dimmed">
            Card surfaces derived from the app model.
          </p>
        </div>
      </div>
    </template>

    <div v-if="appCard" class="section__item space-y-4">
      <div>
        <div class="mb-2">
          <UBadge size="xs" variant="soft" color="neutral">Cell</UBadge>
        </div>
        <OrganismsAppCardsCell
          v-bind="appCard"
          :link="Boolean(appCard.to)"
          class="block"
        />
      </div>

      <div>
        <div class="mb-2">
          <UBadge size="xs" variant="soft" color="neutral">Preview</UBadge>
        </div>
        <OrganismsAppCardsPreview v-bind="appCard" />
      </div>
    </div>

    <p v-else class="section__empty">No app card available.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

defineProps<{
  appCard: AppCard.Card | null
}>()

</script>
