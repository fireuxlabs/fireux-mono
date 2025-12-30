<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue -->
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
        </div>
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const props = defineProps<{
  card?: AppCard.Card | null
}>()

const wrapperTag = computed(() => (props.card?.href ? 'NuxtLink' : 'div'))
const wrapperBindings = computed(() =>
  props.card?.href ? { to: props.card.href } : {}
)
const wrapperClass = computed(() =>
  props.card?.href ? 'block no-underline text-inherit' : undefined
)

const card = computed(() => props.card ?? null)
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
}

.title {
  font-weight: 600;
  line-height: 1.2;
}

.subtitle {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}
</style>
