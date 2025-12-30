<template>
  <component :is="wrapperTag" v-bind="wrapperBindings" :class="wrapperClass">
    <UCard class="cell">
      <div class="row">
        <UAvatar
          :src="card?.image || undefined"
          :alt="card?.title || '—'"
          size="md"
          class="avatar"
        />

        <div class="main">
          <h3 class="title">{{ card?.title || '—' }}</h3>
          <p v-if="card?.subtitle" class="subtitle">{{ card.subtitle }}</p>

          <div v-if="card?.badges?.length" class="badges">
            <UBadge
              v-for="badge in card.badges"
              :key="badge"
              size="xs"
              variant="soft"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { UserCard } from '../../../../models/core/user.model'

const props = defineProps<{
  card?: UserCard.Card | null
}>()

const card = computed(() => props.card ?? null)

const wrapperTag = computed(() => (card.value?.href ? 'NuxtLink' : 'div'))
const wrapperBindings = computed(() =>
  card.value?.href ? { to: card.value.href } : {}
)
const wrapperClass = computed(() =>
  card.value?.href ? 'block no-underline text-inherit' : undefined
)
</script>

<style scoped>
.cell {
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease;
}

.cell:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: center;
}

.avatar {
  border-radius: 9999px;
  box-shadow: 0 0 0 1px var(--ui-border-200, rgba(148, 163, 184, 0.45)) inset;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.title {
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}
</style>
