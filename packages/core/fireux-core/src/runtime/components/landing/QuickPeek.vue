<template>
  <aside class="peek">
    <header class="peek__header">
      <h2 class="peek__title">Quick peek</h2>
      <UBadge variant="soft" color="primary">Live</UBadge>
    </header>

    <ul class="peek__items">
      <li v-for="item in items" :key="item.title" class="peek__item">
        <div class="peek__icon">
          <UIcon :name="item.icon" />
        </div>
        <div class="peek__content">
          <p class="peek__item-title">{{ item.title }}</p>
          <p class="peek__item-copy">{{ item.copy }}</p>
        </div>
      </li>
    </ul>

    <footer v-if="footerBadge" class="peek__footer">
      <UBadge variant="outline" color="neutral">{{ footerBadge }}</UBadge>
    </footer>
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    title: string
    copy: string
    icon: string
  }>
  footerBadge?: string
}>()
</script>

<style scoped>
.peek {
  border-radius: calc(var(--ui-radius) * 3);
  border: 1px solid var(--ui-border-muted);
  background: var(--ui-bg);
  padding: clamp(1.5rem, 4vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.peek__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.peek__title {
  font-weight: 600;
  font-size: 1.1rem;
}

.peek__items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.peek__item {
  display: flex;
  gap: 0.75rem;
}

.peek__icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--color-primary-50);
  color: var(--color-primary-500);
}

.peek__item-title {
  font-weight: 600;
  font-size: 0.95rem;
}

.peek__item-copy {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

.peek__footer {
  display: flex;
  justify-content: flex-start;
}
</style>
