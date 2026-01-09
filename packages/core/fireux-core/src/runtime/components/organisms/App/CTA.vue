<template>
  <UPageCTA
    title="Current app"
    description="The app currently resolved for this runtime."
    variant="naked"
  >
    <template #default>
      <div class="space-y-3">
        <div v-if="app" class="flex justify-end">
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

        <div class="flex justify-end">
          <UButton variant="ghost" size="sm" to="/apps/learn-more">Learn more</UButton>
        </div>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'

const { app, card } = useApp()

type View = 'preview' | 'profile'
const view = ref<View>('preview')
const toggleView = () => {
  view.value = view.value === 'preview' ? 'profile' : 'preview'
}

watch(
  () => Boolean(app.value),
  (hasApp) => {
    if (!hasApp) view.value = 'preview'
  }
)
</script>
