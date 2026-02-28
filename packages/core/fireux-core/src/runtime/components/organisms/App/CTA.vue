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

        <UCard v-else variant="subtle">
          <div class="space-y-3">
            <p class="text-sm text-muted">
              No app profile is currently visible for this workspace.
            </p>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="isAuthenticated"
                color="primary"
                icon="i-lucide-plus"
                @click="openCreateFlow"
              >
                Create App
              </UButton>
              <UButton
                v-else
                :to="createAuthRedirect"
                color="primary"
                icon="i-lucide-log-in"
              >
                Sign In To Create App
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UPageCTA>

  <UModal v-model:open="showCreateModal" title="Create App" :dismissible="false">
    <template #body>
      <AppCreateSystem />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, navigateTo, onMounted, ref, useRoute, useRouter, watch } from '#imports'
import { useApp } from '../../../composables/fireux/firestore/core/app/useApp'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCardViewToggle } from '../../../composables/shared/useCardViewToggle'

const { app, card } = useApp()
const route = useRoute()
const router = useRouter()
const auth = import.meta.client ? useAuth() : null
const isAuthenticated = computed(() => auth?.isAuthenticated?.value ?? false)
const showCreateModal = ref(false)
const { view, toggleView } = useCardViewToggle(() => Boolean(app.value))
const currentCard = computed(() => (app.value ? card(app.value) : null))
const createAuthRedirect = '/auth?redirect=%2Fapps%3Fcreate%3D1'

async function openCreateFlow() {
  if (!isAuthenticated.value) return
  showCreateModal.value = true
}

async function clearCreateQueryFlag() {
  if (!route.query.create) return
  const next = { ...route.query }
  delete next.create
  await router.replace({ query: next }).catch(() => {})
}

watch(
  () => [route.query.create, isAuthenticated.value] as const,
  async ([createFlag, authed]) => {
    if (createFlag !== '1' || !authed) return
    showCreateModal.value = true
    await clearCreateQueryFlag()
  },
  { immediate: true }
)

onMounted(async () => {
  if (route.query.create !== '1') return
  if (!isAuthenticated.value) return
  showCreateModal.value = true
  await clearCreateQueryFlag()
})

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
