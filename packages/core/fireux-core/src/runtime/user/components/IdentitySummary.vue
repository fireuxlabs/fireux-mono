<template>
  <UCard class="profile">
    <template #header>
      <UserCardsCell
        :avatar-url="avatarUrl"
        :display-name="displayName"
        :handle="handle"
        :summary="summary"
        :show-subtitle="showSubtitle"
        :show-tagline="false"
      />
    </template>
    <div class="profile__body">
      <section
        v-if="showDescription && profileSummary"
        class="profile__section"
      >
        <div class="profile__label">About</div>
        <div class="profile__value">{{ profileSummary }}</div>
      </section>
      <section v-if="showDetails && user?.id" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div class="profile__kv">
            <div class="profile__k">User id</div>
            <div class="profile__v">{{ user.id }}</div>
          </div>
        </div>
      </section>
    </div>
    <template v-if="showFooter" #footer>
      <UserCardsPill
        :avatar-url="avatarUrl"
        :display-name="displayName"
        :handle="handle"
        :show-subtitle="showSubtitle"
      />
    </template>
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { User } from '../models/user.model'
const props = withDefaults(
  defineProps<{
    avatarUrl?: string
    displayName?: string
    handle?: string
    summary?: string
    bio?: string
    user?: Pick<User, 'id'> | null
    bioOverride?: string
    showSubtitle?: boolean
    showDescription?: boolean
    showDetails?: boolean
    showFooter?: boolean
  }>(),
  {
    avatarUrl: '',
    displayName: '',
    handle: '',
    summary: '',
    bio: '',
    showSubtitle: true,
    showDescription: true,
    showDetails: true,
    showFooter: true,
  }
)
const profileSummary = computed(() =>
  String(props.bioOverride || props.summary || props.bio || '').trim()
)
</script>
