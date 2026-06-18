<template>
  <UPageCTA
    data-entity-cta-family="profile-managed"
    :class="['cta', { 'cta--usage': isResolved && isInitialized && currentUser }]"
    :title="isResolved && isInitialized && currentUser ? undefined : 'Current User'"
    :description="isResolved && isInitialized && currentUser ? undefined : 'Sign in to view or create your profile.'"
    variant="naked"
  >
    <template #default>
      <div v-if="isResolved && isInitialized && currentUser" class="cta__body space-y-2">
        <div class="cta__toolbar flex justify-end">
          <UButton
            size="xs"
            variant="ghost"
            :icon="view === 'preview' ? 'i-lucide-id-card' : 'i-lucide-eye'"
            :aria-label="view === 'preview' ? 'Switch to profile view' : 'Switch to preview view'"
            :title="view === 'preview' ? 'Profile' : 'Preview'"
            @click="toggleView"
          />
        </div>

        <UserCardsPreview
          v-if="view === 'preview'"
          v-bind="userInterface(currentUser)"
        />

        <UserCardsProfile
          v-else
          v-bind="userInterface(currentUser)"
          :user="currentUser"
        />

        <div
          v-if="showProfileSuggestion"
          class="rounded-lg border border-default bg-muted/30 p-4"
        >
          <div class="space-y-1">
            <p class="text-sm font-medium text-highlighted">
              You are set up as a user
            </p>
            <p class="text-sm text-dimmed">
              Want to add a profile type today? Choose {{ profileActionList }},
              or just keep browsing.
            </p>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <UButton
              v-for="profileAction in profileActions"
              :key="profileAction.to"
              size="xs"
              color="neutral"
              variant="soft"
              :to="profileAction.to"
            >
              {{ profileAction.label }}
            </UButton>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              @click="dismissedSuggestion = true"
            >
              No thanks, just browsing
            </UButton>
          </div>
        </div>
      </div>

      <UserCreateSystem v-else />
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
import { useUser } from '../../composables/fireux/firestore/core/user/useUser'
import { useCardViewToggle } from '../../composables/shared/useCardViewToggle'

const { profiles: appProfiles } = useFireUXConfig()
const { isResolved, isInitialized, currentUser, pill: userInterface } = useUser()
const { view, toggleView } = useCardViewToggle(() => Boolean(currentUser.value))
const dismissedSuggestion = ref(false)
const knownProfileActions = [
  { key: 'chef', label: 'Chef', to: '/chefs' },
  { key: 'agent', label: 'Agent', to: '/agents' },
  { key: 'professional', label: 'Professional', to: '/professionals' },
]
const profileActions = computed(() => {
  const configuredProfiles = new Set(
    appProfiles.map((profile) => String(profile ?? '').trim().toLowerCase())
  )

  return knownProfileActions.filter((profile) =>
    configuredProfiles.has(profile.key)
  )
})
const profileActionList = computed(() => {
  const labels = profileActions.value.map((profile) => profile.label)
  if (labels.length < 2) return labels[0] ?? 'a profile'
  if (labels.length === 2) return `${labels[0]} or ${labels[1]}`
  return `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}`
})
const profileTypes = computed(() =>
  Array.isArray(currentUser.value?.profiles)
    ? currentUser.value.profiles.filter((profile) => String(profile ?? '').trim())
    : []
)
const showProfileSuggestion = computed(
  () =>
    isResolved.value &&
    isInitialized.value &&
    Boolean(currentUser.value) &&
    !dismissedSuggestion.value &&
    profileActions.value.length > 0 &&
    profileTypes.value.length === 0
)
</script>
