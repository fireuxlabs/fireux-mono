<template>
  <UCard class="profile-card">
    <div v-if="card" class="profile">
      <div class="profile-header">
        <div class="avatar-wrap">
          <UAvatar
            :src="card.image || undefined"
            :alt="card.title || 'User'"
            size="xl"
            class="avatar"
          />
        </div>

        <div class="identity">
          <h2 class="name">{{ card.title || 'User' }}</h2>
          <p v-if="card.subtitle" class="about">{{ card.subtitle }}</p>

          <div v-if="card.badges.length" class="status-chips">
            <UBadge v-for="badge in card.badges" :key="badge" size="sm" variant="soft">
              {{ badge }}
            </UBadge>
          </div>

          <NuxtLink
            v-if="card.href"
            :to="card.href"
            class="text-xs text-gray-500 no-underline"
          >
            {{ card.href }}
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <p>No user loaded.</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{ card: UserCard.Card | null }>()

const card = computed(() => props.card)
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
