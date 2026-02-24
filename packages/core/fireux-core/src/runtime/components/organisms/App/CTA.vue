<template>
  <UPageCTA
    class="cta"
    title="Runtime app"
    description="The app currently resolved for this runtime. Use the collection below to inspect other apps in this ecosystem."
    variant="naked"
  >
    <template #default>
      <div class="cta__body space-y-3">
        <div v-if="app" class="cta__toolbar flex justify-end">
          <UButton size="xs" variant="ghost" @click="toggleView">
            {{ view === 'preview' ? 'Profile' : 'Preview' }}
          </UButton>
        </div>

        <AppCardsPreview
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

        <AppCardsProfile
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
        <AppCreateSystem v-else />

        <div class="cta__toolbar flex flex-wrap justify-end gap-2">
          <UButton v-if="app?.id" variant="soft" size="sm" :to="`/apps/${app.id}`">
            Open current app
          </UButton>
          <UButton variant="ghost" size="sm" to="/docs/apps">Docs</UButton>
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
