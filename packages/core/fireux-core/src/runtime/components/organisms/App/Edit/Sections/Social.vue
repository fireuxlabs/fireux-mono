<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h3 class="text-base font-semibold">Social</h3>
          <p class="text-xs text-dimmed">
            Handles for Instagram/Twitter/YouTube (e.g. fireux.app). URLs for everything else.
          </p>
        </div>
      </div>
    </template>

    <div class="fx-section__item">
      <MoleculesFormsFirestoreSocialLinks
        :firebase-value="app.social_links"
        :update-function="handleUpdateSocialLinks"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppModel } from '../../../../../models/core/app.model';

defineProps<{
  app: AppModel
  handleUpdateSocialLinks: (value: AppModel['social_links']) => Promise<unknown>
}>()
</script>
