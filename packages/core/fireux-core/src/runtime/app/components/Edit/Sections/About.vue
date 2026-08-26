<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3>Public Profile</h3>
          <p>Edit the copy people see on public app surfaces.</p>
        </div>
      </div>
    </template>

    <div class="section__item">
      <MoleculesFormsEditableSimpleField
        label="Description"
        type="textarea"
        :rows="3"
        :maxlength="500"
        :value="app.description"
        placeholder="Describe your application..."
        :update="handleDescriptionUpdate"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { App } from '../../../models/app.model.ts'

defineProps<{
  app: App
  handleDescriptionUpdate: (value: string) => Promise<unknown>
}>()
</script>
