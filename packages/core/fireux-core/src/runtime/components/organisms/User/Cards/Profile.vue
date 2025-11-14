<template>
  <UCard class="profile-card">
    <div class="profile">
      <div class="profile-header">
        <div class="avatar-wrap">
          <UAvatar
            :src="user?.avatar || ''"
            :alt="avatarAlt"
            size="xl"
            class="avatar"
          />
        </div>
        <div class="identity">
          <h2 class="name">{{ displayName }}</h2>
          <div v-if="handle" class="identity-meta">
            <span class="handle">@{{ handle }}</span>
          </div>
          <div
            v-if="
              user?.role ||
              user?.appId ||
              user?.created_in ||
              user?.coreStatus ||
              user?.appStatus
            "
            class="status-chips"
          >
            <UBadge v-if="user?.role" size="sm" variant="soft" color="primary">
              {{ user.role }}
            </UBadge>
            <UBadge
              v-if="user?.appId"
              size="sm"
              variant="subtle"
              color="neutral"
            >
              App · {{ user.appId }}
            </UBadge>
            <UBadge
              v-if="user?.created_in"
              size="sm"
              variant="subtle"
              color="neutral"
            >
              Created · {{ user.created_in }}
            </UBadge>
            <UBadge
              v-if="user?.coreStatus"
              size="sm"
              variant="soft"
              color="primary"
            >
              Core · {{ user.coreStatus }}
            </UBadge>
            <UBadge
              v-if="user?.appStatus"
              size="sm"
              variant="soft"
              color="neutral"
            >
              App · {{ user.appStatus }}
            </UBadge>
          </div>
        </div>
      </div>

      <div v-if="user?.bio" class="bio">
        <p>{{ user.bio }}</p>
      </div>

      <USeparator />

      <div v-if="hasSectionContent" class="section-grid">
        <section v-if="profileBadges.length" class="section-card">
          <div class="section-card__header">
            <h3 class="section-title">Profiles</h3>
            <span class="section-count">{{ profileBadges.length }}</span>
          </div>
          <div class="chip-group">
            <UBadge
              v-for="profile in profileBadges"
              :key="`profile-${profile}`"
              size="xs"
              variant="soft"
            >
              {{ profile }}
            </UBadge>
          </div>
        </section>
        <section
          v-if="adminMemberships.length || memberMemberships.length"
          class="section-card"
        >
          <div class="section-card__header">
            <h3 class="section-title">{{ membershipTitle }}</h3>
            <span class="section-count">{{ membershipTotal }}</span>
          </div>

          <div v-if="adminMemberships.length" class="chip-subtitle">
            Administrates
          </div>
          <div v-if="adminMemberships.length" class="chip-group">
            <UBadge
              v-for="app in adminMemberships"
              :key="`admin-${app}`"
              size="xs"
              variant="soft"
            >
              {{ app }}
            </UBadge>
          </div>

          <div
            v-if="memberMemberships.length"
            :class="[
              'chip-group',
              adminMemberships.length ? 'with-border' : '',
            ]"
          >
            <UBadge
              v-for="membership in memberMemberships"
              :key="`member-${membership}`"
              size="xs"
              variant="soft"
            >
              {{ membership }}
            </UBadge>
          </div>
        </section>
      </div>

      <USeparator />

      <div class="detail-grid">
        <div class="detail-row">
          <span class="detail-label">User ID</span>
          <span class="detail-value mono">{{ user?.id || '—' }}</span>
        </div>
        <div v-if="createdAt" class="detail-row">
          <span class="detail-label">Created</span>
          <span class="detail-value">
            <UIcon name="i-lucide-clock" class="icon" />
            {{ createdAt }}
          </span>
        </div>
        <div v-if="updatedAt" class="detail-row">
          <span class="detail-label">Updated</span>
          <span class="detail-value">
            <UIcon name="i-lucide-refresh-cw" class="icon" />
            {{ updatedAt }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatFirestoreTimestamp } from '../../../../utils/formatTimestamp'

const props = defineProps<{ user: any }>()

const user = computed(() => props.user ?? null)

const listUniqueStrings = (value?: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value)).filter(
    (entry): entry is string => typeof entry === 'string' && entry.length > 0
  )
}

const displayName = computed(
  () =>
    user.value?.display_name?.trim() ||
    user.value?.handle?.trim() ||
    user.value?.id ||
    'User'
)
const handle = computed(() => user.value?.handle?.trim() || '')
const avatarAlt = computed(() =>
  handle.value ? `${displayName.value} (@${handle.value})` : displayName.value
)

const profileBadges = computed(() => listUniqueStrings(user.value?.profiles))
const adminMemberships = computed(() => listUniqueStrings(user.value?.adminOf))
const memberMemberships = computed(() => listUniqueStrings(user.value?.userOf))

const membershipTotal = computed(
  () => adminMemberships.value.length + memberMemberships.value.length
)

const membershipTitle = computed(() => 'User Of')

const hasSectionContent = computed(
  () => profileBadges.value.length || membershipTotal.value > 0
)

const createdAt = computed(
  () => formatFirestoreTimestamp(user.value?.created_at) ?? ''
)
const updatedAt = computed(
  () => formatFirestoreTimestamp(user.value?.updated_at) ?? ''
)
</script>

<style scoped>
.profile-card {
  padding: 0;
  overflow: hidden;
}

.profile {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
}

.profile-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
}

.avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  box-shadow: 0 0 0 3px var(--ui-background-100, rgba(15, 23, 42, 0.05)),
    0 8px 30px -12px rgba(15, 23, 42, 0.35);
  border: 2px solid var(--ui-border-200, rgba(148, 163, 184, 0.4));
}

.identity {
  flex: 1;
  min-width: 14rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.identity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
}

.identity-meta .handle {
  font-weight: 600;
}

.status-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.bio {
  background: var(--ui-background-50, rgba(148, 163, 184, 0.1));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  border-radius: 0.75rem;
  padding: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ui-text-600, rgba(71, 85, 105, 0.95));
}

.section-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.section-card {
  background: var(--ui-background-100, rgba(148, 163, 184, 0.12));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.2));
  border-radius: 0.75rem;
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.section-count {
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.25rem 0.55rem;
  border-radius: 9999px;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.12));
}

.chip-subtitle {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
  margin-top: 0.35rem;
}

.with-border {
  border-top: 1px dashed var(--ui-border-200, rgba(148, 163, 184, 0.3));
  padding-top: 0.45rem;
  margin-top: 0.45rem;
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
  font-size: 0.95rem;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.detail-label {
  font-weight: 600;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
}

.detail-value {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--ui-text-600, rgba(71, 85, 105, 0.95));
}

.detail-value.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
  font-size: 0.92rem;
}

.icon {
  width: 1rem;
  height: 1rem;
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
}

@media (max-width: 640px) {
  .profile {
    padding: 1.25rem;
    gap: 1.25rem;
  }

  .name {
    font-size: 1.35rem;
  }
}
</style>
