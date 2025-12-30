<template>
  <UCard class="profile-card">
    <div v-if="card" class="profile">
      <div class="profile-header">
        <div class="avatar-wrap">
          <UAvatar
            :src="card.image || undefined"
            :alt="card.title || 'App'"
            size="xl"
            class="avatar"
          />
        </div>

        <div class="identity">
          <h2 class="name">{{ card.title || 'App' }}</h2>

          <p v-if="card.subtitle" class="about">
            {{ card.subtitle }}
          </p>

          <div v-if="card.badges.length" class="badge-row">
            <UBadge v-for="badge in card.badges" :key="badge" size="sm" variant="soft">
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty">
      <UIcon name="i-lucide-app-window" class="icon-xxl" />
      <p>No app loaded.</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

type Props = { card: AppCard.Card | null }
const props = defineProps<Props>()

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
  gap: 1.25rem;
  padding: 1.5rem;
}

.profile-header {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1.25rem;
  align-items: center;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar {
  box-shadow: 0 0 0 3px var(--ui-background-100, rgba(15, 23, 42, 0.05)),
    0 8px 30px -12px rgba(15, 23, 42, 0.25);
  border: 2px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  border-radius: 1rem;
}

.identity {
  display: grid;
  gap: 0.6rem;
  min-width: 14rem;
}

.name {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.identity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.id-chip {
  background: var(--ui-background-100, rgba(148, 163, 184, 0.1));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.3));
  border-radius: 0.5rem;
  padding: 0.15rem 0.5rem;
  font-size: 0.78rem;
  color: var(--ui-text-600, #475569);
}

.about {
  margin-top: 0.25rem;
  color: var(--ui-text-600, #475569);
  font-size: 0.98rem;
  line-height: 1.55;
}

.section-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.section-card {
  background: var(--ui-background-100, rgba(148, 163, 184, 0.1));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.25));
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  display: grid;
  gap: 0.6rem;
}

.section-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--ui-text-500, #64748b);
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.admin-grid {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.kv {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 0.75rem;
  align-items: center;
}

.kv + .kv {
  margin-top: 0.35rem;
}

.kv-key {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: var(--ui-text-500, #64748b);
  font-weight: 600;
}

.kv-val {
  font-size: 0.95rem;
  color: var(--ui-text-700, #334155);
}

.link {
  text-decoration: none;
  border-bottom: 1px dashed rgba(100, 116, 139, 0.5);
}
.link:hover {
  color: var(--ui-text-900, #0f172a);
  border-bottom-style: solid;
}

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    'Liberation Mono', 'Courier New', monospace;
}

.icon {
  width: 1rem;
  height: 1rem;
  color: var(--ui-text-400, rgba(148, 163, 184, 0.9));
}

.icon-xxl {
  width: 3rem;
  height: 3rem;
  color: var(--ui-text-300, rgba(203, 213, 225, 0.9));
}

.empty {
  display: grid;
  place-items: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--ui-text-500, #64748b);
}

@media (max-width: 640px) {
  .profile {
    padding: 1.25rem;
    gap: 1rem;
  }
  .profile-header {
    grid-template-columns: 1fr;
    justify-items: start;
  }
  .name {
    font-size: 1.4rem;
  }
}
</style>
