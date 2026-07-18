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
      <section v-if="showDescription && profileSummary" class="profile__section">
        <div class="profile__label">Summary</div>
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

      <section v-if="showMeta && (appCards.length || appsLabel)" class="profile__section">
        <div class="profile__label">Apps</div>
        <div class="profile__value">
          <div v-if="appCards.length" class="profile__apps">
            <AppCardsPill
              v-for="appCard in appCards"
              :key="appCard.id"
              v-bind="appCard"
              :link="Boolean(appCard.to)"
              :show-badges="false"
              class="profile__app-pill"
            />
          </div>
          <span v-else-if="appsLabel">{{ appsLabel }}</span>
        </div>
      </section>

      <section v-if="showDetails" class="profile__section">
        <div class="profile__label">Details</div>
        <div class="profile__value">
          <div class="profile__kv">
            <div class="profile__k">User id</div>
            <div class="profile__v">
              <span v-if="user?.id">{{ user.id }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>
          <div class="profile__kv">
            <div class="profile__k">Created</div>
            <div class="profile__v">
              <span v-if="createdAtLabel">{{ createdAtLabel }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>
          <div class="profile__kv">
            <div class="profile__k">Updated</div>
            <div class="profile__v">
              <span v-if="updatedAtLabel">{{ updatedAtLabel }}</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
    <template #footer>
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

import { useAppCollection } from '../../../composables/fireux/firestore/core/app/fetch/useAppCollection'
import { useAppInterface } from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { formatFirestoreTimestamp } from '../../../utils/formatTimestamp'

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
    userOf?: string[]
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
})

const { apps } = useAppCollection()
const { pill: appToPill } = useAppInterface()

const profileSummary = computed(() =>
  String(props.bioOverride || props.summary || props.bio || '').trim()
)

const appIds = computed(() => {
  const rawIds = Array.isArray(props.user?.userOf) ? props.user.userOf : []
  return Array.from(
    new Set(rawIds.map((id) => String(id || '').trim()).filter(Boolean))
  )
})

const appCards = computed(() => {
  if (!appIds.value.length) return []

  const ids = new Set(appIds.value)
  return (apps.value ?? [])
    .filter((app) => ids.has(String(app.id || '').trim()))
    .map((app) => appToPill(app as any))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
})

const createdAtLabel = computed(() => formatTimestampLabel(props.user?.created?.at))
const updatedAtLabel = computed(() => formatTimestampLabel(props.user?.updated?.at))

function formatTimestampLabel(value: unknown): string {
  return (
    formatFirestoreTimestamp(value as any, {
      fallback: '',
      locale: 'en-GB',
    }) || ''
  )
}
</script>

<style scoped>
.profile__apps {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.profile__app-pill {
  max-width: 22rem;
}
</style>
