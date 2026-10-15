<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Surfaces</h3>
          <p>
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
        <AppCardsCell
          :to="appCard.to"
          :thumbnail-url="appCard.thumbnailUrl"
          :display-name="appCard.displayName"
          :badges="appCard.badges"
          :tagline="appCard.tagline"
          :user-count="appCard.userCount"
          :link="Boolean(appCard.to)"
          class="block"
        />
      </div>

      <div>
        <div class="mb-2">
          <UBadge size="xs" variant="soft" color="neutral">Preview</UBadge>
        </div>
        <AppCardsSummary
          :id="appCard.id"
          :short-name="appCard.shortName"
          :thumbnail-url="appCard.thumbnailUrl"
          :display-name="appCard.displayName"
          :ecosystem="appCard.ecosystem"
          :tagline="appCard.tagline"
          :user-count="appCard.userCount"
          :badges="appCard.badges"
        />
      </div>
    </div>

    <p v-else class="section__empty">No app card available.</p>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../composables/useAppView';

defineProps<{
  appCard: AppCard | null
}>()

</script>
