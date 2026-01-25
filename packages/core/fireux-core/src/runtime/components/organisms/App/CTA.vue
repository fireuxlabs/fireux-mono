<template>
  <UPageCTA
    class="cta"
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="cta__body space-y-3">
        <div v-if="app" class="cta__toolbar flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <OrganismsAppCardsPreview
          v-if="app && view === 'preview'"
          :id="card(app).id"
          :short-name="card(app).shortName"
          :thumbnail-url="card(app).thumbnailUrl"
          :display-name="card(app).displayName"
          :ecosystem="card(app).ecosystem"
          :tagline="card(app).tagline"
          :user-count="card(app).userCount"
          :badges="card(app).badges"
        />

        <OrganismsAppCardsProfile
          v-else-if="app"
          :id="card(app).id"
          :short-name="card(app).shortName"
          :thumbnail-url="card(app).thumbnailUrl"
          :display-name="card(app).displayName"
          :ecosystem="card(app).ecosystem"
          :tagline="card(app).tagline"
          :user-count="card(app).userCount"
          :badges="card(app).badges"
          :app="app"
        />
        <OrganismsAppCreateSystem v-else />

        <div class="cta__toolbar flex justify-end">
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
