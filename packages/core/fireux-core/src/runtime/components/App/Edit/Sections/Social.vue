<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Links</h3>
          <p>
            Edit public website, contact, and social links.
          </p>
        </div>
      </div>
    </template>

    <div class="section__item">
      <MoleculesFormsFirestoreSocialLinks
        :firebase-value="app.social_links"
        :update-function="handleUpdateSocialLinks"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppModel } from '../../../../models/core/app.model';

defineProps<{
  app: AppModel
  handleUpdateSocialLinks: (value: AppModel['social_links']) => Promise<unknown>
}>()
</script>
