<template>
  <section class="solutions">
    <header class="solutions__header">
      <h2 class="solutions__title">{{ resolvedTitle }}</h2>
      <p v-if="resolvedSubtitle" class="solutions__subtitle">{{ resolvedSubtitle }}</p>
    </header>

    <ul class="solutions__grid">
      <li v-for="item in resolvedItems" :key="`${item.title}:${item.to}`" class="solutions__item">
        <div class="solutions__icon">
          <UIcon :name="item.icon" />
        </div>
        <div class="solutions__body">
          <p class="solutions__item-title">{{ item.title }}</p>
          <p class="solutions__item-copy">{{ item.description }}</p>
          <UButton size="xs" variant="ghost" :to="item.to">
            {{ item.cta }}
          </UButton>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type LandingCardGridInput = {
  title: string
  description?: string
  copy?: string
  to?: string
  href?: string
  cta?: string
  icon: string
}

const props = defineProps<{
  title?: string
  subtitle?: string
  items?: LandingCardGridInput[]
  cards?: LandingCardGridInput[]
}>()

const resolvedTitle = computed(() => props.title || 'Get started')
const resolvedSubtitle = computed(() => props.subtitle || '')
const resolvedItems = computed(() =>
  (props.items || props.cards || []).map((item) => ({
    title: item.title,
    description: item.description || item.copy || '',
    to: item.to || item.href || '/',
    cta: item.cta || 'Open',
    icon: item.icon,
  }))
)
</script>

<style scoped>
.solutions {
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 12)) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 10));
}

.solutions__title {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 700;
}

.solutions__subtitle {
  color: var(--ui-text-muted);
  font-size: 1rem;
  max-width: 40rem;
}

.solutions__grid {
  display: grid;
  gap: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 7));
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.solutions__item {
  border-radius: calc(var(--ui-radius) * 3);
  border: 1px solid var(--ui-border-muted);
  background: var(--ui-bg);
  padding: calc(var(--spacing) * 5);
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 3);
}

.solutions__icon {
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.solutions__item-title {
  font-weight: 600;
}

.solutions__item-copy {
  color: var(--ui-text-muted);
  font-size: 0.95rem;
  flex-grow: 1;
}
</style>
