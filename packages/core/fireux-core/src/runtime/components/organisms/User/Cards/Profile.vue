<template>
  <UCard class="profile-card">
    <div class="profile">
      <div class="profile-header">
        <div class="avatar-wrap">
          <UAvatar
            :src="user?.avatar || ''"
            :alt="user?.display_name || user?.handle || user?.id || 'User'"
            size="xl"
            class="avatar"
          />
        </div>
        <div class="identity">
          <h2 class="name">
            {{ user?.display_name || user?.handle || user?.id || 'User' }}
          </h2>
          <div class="identity-meta">
            <span v-if="user?.handle" class="handle">@{{ user.handle }}</span>
            <span v-if="user?.email" class="email">{{ user.email }}</span>
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

      <div class="section-grid">
        <section class="section-card">
          <h3 class="section-title">Profiles</h3>
          <div class="chip-group">
            <template
              v-if="Array.isArray(user?.profiles) && user.profiles.length"
            >
              <UBadge
                v-for="profile in user.profiles"
                :key="`profile-${profile}`"
                size="xs"
                variant="soft"
              >
                {{ profile }}
              </UBadge>
            </template>
            <span v-else class="muted">No profiles yet</span>
          </div>
        </section>
        <section class="section-card">
          <h3 class="section-title">Admin Of</h3>
          <div class="chip-group">
            <template
              v-if="Array.isArray(user?.adminOf) && user.adminOf.length"
            >
              <UBadge
                v-for="app in user.adminOf"
                :key="`admin-${app}`"
                size="xs"
                variant="soft"
              >
                {{ app }}
              </UBadge>
            </template>
            <span v-else class="muted">No admin memberships</span>
          </div>
        </section>
        <section class="section-card">
          <h3 class="section-title">Member Of</h3>
          <div class="chip-group">
            <template v-if="Array.isArray(user?.userOf) && user.userOf.length">
              <UBadge
                v-for="membership in user.userOf"
                :key="`member-${membership}`"
                size="xs"
                variant="soft"
              >
                {{ membership }}
              </UBadge>
            </template>
            <span v-else class="muted">No memberships yet</span>
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

.muted {
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
  font-size: 0.85rem;
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
