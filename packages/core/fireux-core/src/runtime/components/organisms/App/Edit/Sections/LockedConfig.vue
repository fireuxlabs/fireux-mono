<template>
  <UCard class="section">
    <template #header>
      <div class="section__header">
        <div class="section__copy">
          <h3 class="text-base font-semibold">locked app config</h3>
        </div>

        <div v-if="isDev" class="shrink-0">
          <UButton
            to="/dashboard/developer"
            size="xs"
            variant="soft"
            icon="i-lucide-arrow-up-right"
            label="Go to dev panel"
          />
        </div>
      </div>
    </template>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="App ID"
        :firebase-value="app.id"
        placeholder="app-id"
        :maxlength="80"
        :update-function="noopUpdate"
        disabled
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Role"
        :firebase-value="app.role"
        placeholder="global"
        :maxlength="20"
        :update-function="noopUpdate"
        disabled
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Ecosystem"
        :firebase-value="app.ecosystem"
        placeholder="misebox"
        :maxlength="60"
        :update-function="handleEcosystemUpdate"
        disabled
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="App name"
        :firebase-value="app.app_name"
        placeholder="FireUX"
        :maxlength="60"
        :update-function="noopUpdate"
        disabled
      />
    </div>

    <div class="section__item">
      <MoleculesFormsFirestoreSimpleField
        label="Short name"
        :firebase-value="app.app_short_name"
        placeholder="fireux"
        :maxlength="40"
        :update-function="noopUpdate"
        disabled
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppModel } from '../../../../../models/core/app.model';

defineProps<{
  app: AppModel
  isDev: boolean
  noopUpdate: () => Promise<void>
  handleEcosystemUpdate: (value: string) => Promise<unknown>
}>()
</script>
