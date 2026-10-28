<!-- Concurrent edit — 2026-07-21 15:58 CEST — User bio pass: present canonical biography as the User's About section. -->
<template>
  <UCard class="profile">
    <template #header>
      <UserCardsCell
        :avatar-url="avatarUrl"
        :display-name="displayName"
        :handle="handle"
        :badges="badges"
        :title="title"
        :summary="summary"
        :profiles="profiles"
        :apps-label="appsLabel"
        :show-subtitle="showSubtitle"
        :show-badges="showBadges"
        :show-tagline="false"
      />
    </template>

    <div class="profile__body">
      <section
        v-if="showDescription && profileSummary"
        class="profile__section"
      >
        <div class="profile__label">About</div>
        <div class="profile__value">
          <span>{{ profileSummary }}</span>
        </div>
      </section>

      <section v-if="showMeta && title" class="profile__section">
        <div class="profile__label">Title</div>
        <div class="profile__value">
          <span>{{ title }}</span>
        </div>
      </section>

      <section v-if="showMeta && profiles.length" class="profile__section">
        <div class="profile__label">Profiles</div>
        <div class="profile__value">
          <span>{{ profiles.join(', ') }}</span>
        </div>
      </section>

      <section v-if="showMeta && appsLabel" class="profile__section">
        <div class="profile__label">Apps</div>
        <div class="profile__value">
          <span>{{ appsLabel }}</span>
        </div>
      </section>

      <section v-if="showDetails" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div v-if="user?.id" class="profile__kv">
            <div class="profile__k">User id</div>
            <div class="profile__v">
              <span>{{ user?.id }}</span>
            </div>
          </div>
          <div v-if="createdAtLabel" class="profile__kv">
            <div class="profile__k">Created</div>
            <div class="profile__v">
              <span>{{ createdAtLabel }}</span>
            </div>
          </div>
          <div v-if="updatedAtLabel" class="profile__kv">
            <div class="profile__k">Updated</div>
            <div class="profile__v">
              <span>{{ updatedAtLabel }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <template v-if="showFooter" #footer>
      <UserCardsPill
        :avatar-url="avatarUrl"
        :display-name="displayName"
        :handle="handle"
        :badges="badges"
        :title="title"
        :summary="summary"
        :profiles="profiles"
        :show-subtitle="showSubtitle"
        :show-badges="showBadges"
      />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from '#imports'

import { formatFirestoreTimestamp } from '../../utils/firestore-timestamp'

type Props = {
  avatarUrl?: string
  displayName?: string
  handle?: string
  badges?: string[]
  title?: string
  summary?: string
  bio?: string
  profiles?: string[]
  appsLabel?: string

  user?: {
    id?: string
    created?: {
      at?: unknown
    } | null
    updated?: {
      at?: unknown
    } | null
  } | null
  /** Optional override for the bio slot/value (e.g. caller wants to inject a different string). */
  bioOverride?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showDescription?: boolean
  showMeta?: boolean
  showDetails?: boolean
  showFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  displayName: '',
  handle: '',
  badges: () => [],
  title: '',
  summary: '',
  bio: '',
  profiles: () => [],
  appsLabel: '',
  showSubtitle: true,
  showBadges: true,
  showDescription: true,
  showMeta: true,
  showDetails: true,
  showFooter: true,
})

const profileSummary = computed(() =>
  String(props.bioOverride || props.summary || props.bio || '').trim()
)

const createdAtLabel = computed(() =>
  formatTimestampLabel(props.user?.created?.at)
)
const updatedAtLabel = computed(() =>
  formatTimestampLabel(props.user?.updated?.at)
)

function formatTimestampLabel(value: unknown): string {
  return (
    formatFirestoreTimestamp(value as any, {
      fallback: '',
      locale: 'en-GB',
    }) || ''
  )
}
</script>
