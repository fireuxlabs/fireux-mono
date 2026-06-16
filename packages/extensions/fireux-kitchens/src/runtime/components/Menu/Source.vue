<template>
  <main class="source-menu">
    <section class="source-menu__page">
      <slot name="breadcrumbs" />

      <header class="source-menu__header">
        <p v-if="kitchenName" class="source-menu__kitchen">
          {{ kitchenName }}
        </p>
        <h1>{{ menu.name }}</h1>
        <p v-if="menu.description" class="source-menu__description">
          {{ menu.description }}
        </p>
      </header>

      <MenuAllergenNotice />

      <section class="source-menu__document" aria-label="Menu source document">
        <iframe
          v-if="sourceUrl"
          :src="sourceUrl"
          :title="menu.name || 'Menu source'"
          class="source-menu__frame"
        />
        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="Menu source unavailable"
          description="This menu source is missing."
        />
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Menu } from '../../models/menu/menu.model'

defineProps<{
  kitchenName: string
  menu: Menu
  sourceUrl: string
}>()
</script>

<style scoped>
.source-menu {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--ui-bg);
  color: var(--ui-text);
}

.source-menu__page {
  display: grid;
  gap: 1.25rem;
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem);
}

.source-menu__header {
  text-align: center;
}

.source-menu__kitchen,
.source-menu__description {
  color: var(--ui-text-muted);
}

.source-menu__kitchen {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.source-menu__header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.15;
}

.source-menu__description {
  margin: 0.75rem auto 0;
  max-width: 42rem;
  line-height: 1.55;
}

.source-menu__document {
  min-height: 60vh;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
  background: white;
}

.source-menu__frame {
  display: block;
  width: 100%;
  min-height: 72vh;
  border: 0;
}
</style>
