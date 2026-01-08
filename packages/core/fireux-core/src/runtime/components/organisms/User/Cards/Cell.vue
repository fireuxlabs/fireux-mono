<template>
  <NuxtLink :to="to" class="fx-card fx-card--cell">
    <div class="fx-card__media">
      <UAvatar :src="avatarUrl" :alt="displayName" size="sm" />

      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__header">
          <div class="min-w-0">
            <div class="fx-card__title">{{ displayName }}</div>
            <div v-if="handle" class="fx-card__subtitle">
              {{ handle }}
            </div>
          </div>

          <div v-if="badges.length" class="fx-card__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div class="fx-card__tagline">
          <span v-if="prop">{{ prop }}</span>
          <span v-else-if="profiles.length && apps">{{ profiles.join(', ') }} · {{ apps }}</span>
          <span v-else-if="profiles.length">{{ profiles.join(', ') }}</span>
          <span v-else-if="apps">{{ apps }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

defineProps<
  Pick<
    UserCard.Card,
    'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles' | 'apps'
  > & {
    prop?: string
  }
>()
</script>
