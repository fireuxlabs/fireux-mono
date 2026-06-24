<template>
  <nav class="menu-section-nav" aria-label="Menu sections">
    <a
      v-for="section in sections"
      :key="section.id"
      :href="`#${sectionDomId(section.id)}`"
    >
      {{ section.label }}
    </a>
  </nav>
</template>

<script setup lang="ts">
type MenuSectionLink = {
  id: string
  label: string
}

defineProps<{
  sections: MenuSectionLink[]
}>()

const sectionDomId = (id: string) =>
  `menu-section-${String(id || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`
</script>

<style scoped>
.menu-section-nav {
  position: sticky;
  z-index: 2;
  top: 0.75rem;
  display: flex;
  gap: 0.45rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  padding: 0.45rem;
  overflow-x: auto;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 20%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-bg) 86%, transparent);
  backdrop-filter: blur(18px);
}

.menu-section-nav a {
  flex: 0 0 auto;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;
}
</style>
