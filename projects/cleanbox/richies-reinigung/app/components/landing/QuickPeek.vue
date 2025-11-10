<template>
  <aside class="peek">
    <header class="peek__header">
      <h2 class="peek__title">Today at a glance</h2>
      <UBadge variant="soft" color="primary">Live routes</UBadge>
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
export interface QuickPeekItem {
  title: string
  copy: string
  icon: string
}

defineProps<{
  items: QuickPeekItem[]
  footerBadge?: string
}>()

defineOptions({ name: 'RichiesLandingQuickPeek' })
</script>

<style scoped>
.peek {
  border-radius: var(--radius-xl);
  border: 1px solid var(--ui-border-subtle);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: clamp(1.5rem, 4vw, 2.25rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: var(--ui-shadow-md);
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
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: #14b8a61a;
  color: #0d4f49;
}

.peek__item-title {
  font-weight: 600;
}

.peek__item-copy {
  color: var(--ui-text-muted);
  font-size: 0.9rem;
}

.peek__footer {
  display: flex;
}
</style>
