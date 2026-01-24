<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3 class="text-base font-semibold">About</h3>
          <p class="text-xs text-dimmed">
            Keep the human-facing description up to date.
          </p>
        </div>
      </div>
    </template>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Tagline"
        :maxlength="120"
        :firebase-value="app.tagline"
        placeholder="A short one-liner for cards and lists"
        :update-function="handleTaglineUpdate"
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Description"
        type="textarea"
        :rows="3"
        :maxlength="500"
        :firebase-value="app.description"
        placeholder="Describe your application..."
        :update-function="handleDescriptionUpdate"
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Short bio"
        type="textarea"
        :rows="2"
        :maxlength="240"
        :firebase-value="app.short_bio"
        placeholder="Short bio used on compact surfaces"
        :update-function="handleShortBioUpdate"
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Long bio"
        type="textarea"
        :rows="6"
        :maxlength="4000"
        :firebase-value="app.long_bio"
        placeholder="Long bio for profile pages"
        :update-function="handleLongBioUpdate"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppModel } from '../../../../../models/core/app.model';

defineProps<{
  app: AppModel
  handleTaglineUpdate: (value: string) => Promise<unknown>
  handleDescriptionUpdate: (value: string) => Promise<unknown>
  handleShortBioUpdate: (value: string) => Promise<unknown>
  handleLongBioUpdate: (value: string) => Promise<unknown>
}>()
</script>
