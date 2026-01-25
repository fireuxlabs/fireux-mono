<template>
  <UCard class="profile">
    <template #header>
      <div class="profile__header">
        <div class="profile__identity">
          <UAvatar :src="avatarUrl" :alt="displayName" size="md" />
          <div class="profile__titles">
            <div class="profile__title">{{ displayName }}</div>
            <div v-if="showSubtitle" class="profile__subtitle">
              <span v-if="handle">{{ handle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div v-if="showBadges && badges.length" class="profile__badges">
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
    </template>

    <div class="profile__body">
      <section v-if="showDescription" class="profile__section">
        <div class="profile__label">Bio</div>
        <div class="profile__value">
          <span v-if="prop || bio">{{ prop || bio }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </section>

      <section v-if="showMeta" class="profile__section">
        <div class="profile__label">Profiles</div>
        <div class="profile__value">
          <span v-if="profiles.length">{{ profiles.join(', ') }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </section>

      <section v-if="showMeta" class="profile__section">
        <div class="profile__label">Apps</div>
        <div class="profile__value">
          <span v-if="appsLabel">{{ appsLabel }}</span>
          <span v-else class="italic">missing</span>
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
              <span v-if="user?.created_at">set</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>
          <div class="profile__kv">
            <div class="profile__k">Updated</div>
            <div class="profile__v">
              <span v-if="user?.updated_at">set</span>
              <span v-else class="opacity-70">missing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type Props = {
  avatarUrl: string
  displayName: string
  handle: string
  badges: string[]
  bio: string
  profiles: string[]
  appsLabel: string

  user?: {
    id?: string
    created_at?: unknown
    updated_at?: unknown
  } | null
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showDescription?: boolean
  showMeta?: boolean
  showDetails?: boolean
}

withDefaults(
  defineProps<Props>(),
  {
    showSubtitle: true,
    showBadges: true,
    showDescription: true,
    showMeta: true,
    showDetails: true,
  }
)
</script>
