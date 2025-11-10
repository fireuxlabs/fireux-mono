<template>
  <section class="solutions">
    <header class="solutions__header">
      <h2 class="solutions__title">{{ title }}</h2>
      <p class="solutions__subtitle">{{ subtitle }}</p>
    </header>

    <ul class="solutions__grid">
      <li v-for="item in items" :key="item.title" class="solutions__item">
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
export interface SolutionItem {
  title: string
  description: string
  to: string
  cta: string
  icon: string
}

defineProps<{
  title: string
  subtitle: string
  items: SolutionItem[]
}>()

defineOptions({ name: 'TenantLandingSolutions' })
</script>

<style scoped>
.solutions {
  padding: clamp(2rem, 6vw, 3rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 4vw, 2.5rem);
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
  gap: clamp(1rem, 3vw, 1.75rem);
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.solutions__item {
  border-radius: var(--radius-xl);
  border: 1px solid var(--ui-border-subtle);
  background: var(--ui-surface);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.solutions__icon {
  width: 2.75rem;
  height: 2.75rem;
  display: grid;
  place-items: center;
  border-radius: 0.9rem;
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
