<template>
  <UPageCTA
    :class="['cta', { 'cta--usage': Boolean(currentCard) }]"
    :title="currentCard ? undefined : 'Current App'"
    variant="naked"
  >
    <template #default>
      <div class="cta__body space-y-2">
        <div v-if="currentCard" class="cta__toolbar flex justify-end">
          <UButton
            size="xs"
            variant="ghost"
            :icon="view === 'preview' ? 'i-lucide-id-card' : 'i-lucide-eye'"
            :aria-label="view === 'preview' ? 'Switch to profile view' : 'Switch to preview view'"
            :title="view === 'preview' ? 'Profile' : 'Preview'"
            @click="toggleView"
          />
        </div>

        <div
          v-if="app && currentCard"
          role="link"
          tabindex="0"
          class="rounded-md cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          :aria-label="`Open app ${currentCard.displayName || currentCard.id}`"
          @click="onSurfaceClick"
          @keydown="onSurfaceKeydown"
        >
          <AppCardsPreview
            v-if="view === 'preview'"
            :id="currentCard.id"
            :short-name="currentCard.shortName"
            :thumbnail-url="currentCard.thumbnailUrl"
            :display-name="currentCard.displayName"
            :ecosystem="currentCard.ecosystem"
            :tagline="currentCard.tagline"
            :user-count="currentCard.userCount"
            :badges="currentCard.badges"
          />

          <AppCardsProfile
            v-else
            :id="currentCard.id"
            :short-name="currentCard.shortName"
            :thumbnail-url="currentCard.thumbnailUrl"
            :display-name="currentCard.displayName"
            :ecosystem="currentCard.ecosystem"
            :tagline="currentCard.tagline"
            :user-count="currentCard.userCount"
            :badges="currentCard.badges"
            :app="app"
          />
        </div>
        <AppCreateSystem v-else />
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, navigateTo } from '#imports'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'

const { app, card } = useApp()
const { view, toggleView } = useCardViewToggle(() => Boolean(app.value))
const currentCard = computed(() => (app.value ? card(app.value) : null))

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest('a, button, input, select, textarea, [role="button"]'))
}

async function openCurrentApp() {
  const to = currentCard.value?.to
  if (!to) return
  await navigateTo(to)
}

async function onSurfaceClick(event: MouseEvent) {
  if (isInteractiveTarget(event.target)) return
  await openCurrentApp()
}

async function onSurfaceKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  if (isInteractiveTarget(event.target)) return
  event.preventDefault()
  await openCurrentApp()
}
</script>
