<template>
  <UPageCTA
    class="fx-cta"
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="fx-cta__body space-y-3">
        <div v-if="app" class="fx-cta__toolbar flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <OrganismsAppCardsPreview
          v-if="app && view === 'preview'"
          v-bind="card(app)"
        />

        <OrganismsAppCardsProfile
          v-else-if="app"
          v-bind="card(app)"
          :app="app"
        />
        <OrganismsAppCreateSystem v-else />

        <div class="fx-cta__toolbar flex justify-end">
          <UButton variant="ghost" size="sm" to="/apps/learn-more">Learn more</UButton>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp';
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle';

const { app, card } = useApp()
const { view, toggleView } = useCardViewToggle(() => Boolean(app.value))
</script>
