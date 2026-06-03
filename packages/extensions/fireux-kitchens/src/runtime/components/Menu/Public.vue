<template>
  <main class="public-menu">
    <section class="menu-page">
      <header class="menu-header">
        <p v-if="kitchenName" class="kitchen-name">
          {{ kitchenName }}
        </p>
        <h1>{{ menu.name }}</h1>
        <p v-if="menu.description" class="description">
          {{ menu.description }}
        </p>
      </header>

      <UAlert
        color="neutral"
        variant="soft"
        title="Published menu"
        description="This public route resolves a published menu from the kitchen. Sections, items, and dishes will be added next."
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import type { Menu } from '../../models/menu.model'

defineProps<{
  kitchenName: string
  menu: Menu
}>()
</script>

<style scoped>
.public-menu {
  --menu-bg: #fffaf2;
  --menu-text: #211915;
  --menu-muted: #4f4037;
  --menu-dimmed: #756a60;
  --menu-accent: var(--ui-primary);
  --menu-font: Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  background: var(--menu-bg);
  color: var(--menu-text);
  font-family: var(--menu-font);
}

.menu-page {
  width: min(100%, 72rem);
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 3rem);
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.kitchen-name,
.description {
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.kitchen-name {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--menu-dimmed);
}

.menu-header h1 {
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--menu-accent);
}

.description {
  margin: 0.75rem auto 0;
  max-width: 42rem;
  line-height: 1.55;
  color: var(--menu-muted);
}
</style>
