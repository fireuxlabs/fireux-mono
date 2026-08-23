<template>
  <section class="public-profile-hub" data-public-profile="user">
    <UserProfileHero
      kind-label="User"
      icon="i-lucide-user-round"
      tone="primary"
      :avatar-url="user.avatar"
      :display-name="user.display_name"
      :handle="`@${user.handle}`"
      summary=""
      :stats="[]"
      :show-user-profile-link="false"
    >
      <template #badges>
        <UserAccessBadge v-if="isOwnProfile" :subscription="subscription" />
      </template>

      <template #actions>
        <div
          v-if="canEdit"
          class="inline-flex items-center rounded-md border border-default bg-default p-0.5"
          aria-label="Profile mode"
        >
          <UButton
            label="Browse"
            icon="i-lucide-eye"
            color="primary"
            variant="soft"
            size="sm"
            disabled
          />
          <UButton
            to="/dashboard/user-profile"
            label="Edit"
            icon="i-lucide-pencil"
            color="neutral"
            variant="outline"
            size="sm"
          />
        </div>
      </template>
    </UserProfileHero>

    <UPageCard
      as="section"
      variant="subtle"
      class="rounded-3xl"
      :ui="{ container: 'p-5 sm:p-7' }"
    >
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div class="max-w-2xl">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-align-left" class="size-4 text-primary" />
            <h2 class="font-semibold text-highlighted">About</h2>
          </div>
          <p class="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
            {{ bioText }}
          </p>
        </div>
        <UButton
          v-if="canEdit && !hasBio"
          to="/dashboard/user-profile"
          label="Add bio"
          icon="i-lucide-pencil"
          color="neutral"
          variant="soft"
        />
      </div>
    </UPageCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserSubscription } from '../composables/useUserPermissions'
import type { User } from '../models/user.model.ts'

const props = withDefaults(
  defineProps<{
    user: User
    isOwnProfile?: boolean
    canEdit?: boolean
    subscription?: UserSubscription | null
  }>(),
  {
    isOwnProfile: false,
    canEdit: false,
    subscription: null,
  }
)

const bio = computed(() => props.user.bio.trim())
const hasBio = computed(() => Boolean(bio.value))
const bioText = computed(
  () => bio.value || `${props.user.display_name} hasn’t added a bio yet.`
)
</script>
