<template>
  <nav class="component-docs-nav" aria-label="FireUX Core component docs">
    <ULink to="/components" class="component-docs-nav__link">
      Component library
    </ULink>
    <section
      v-for="group in groups"
      :key="group.label"
      class="component-docs-nav__group"
    >
      <h2>{{ group.label }}</h2>
      <ULink
        v-for="link in group.links"
        :key="link.to"
        :to="link.to"
        :aria-current="route.path === link.to ? 'page' : undefined"
        :class="{ 'component-docs-nav__link--active': route.path === link.to }"
        class="component-docs-nav__link"
      >
        {{ link.label }}
      </ULink>
    </section>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const groups = [
  {
    label: 'Collections',
    links: [{ label: 'Collection components', to: '/components/collections' }],
  },
  {
    label: 'State and feedback',
    links: [{ label: 'State and feedback', to: '/components/state-feedback' }],
  },
  {
    label: 'Selection',
    links: [{ label: 'Selection components', to: '/components/selection' }],
  },
  {
    label: 'Surfaces and disclosure',
    links: [
      {
        label: 'Action surface and disclosure panel',
        to: '/components/surfaces',
      },
      { label: 'Disclosure Card', to: '/components/disclosure-card' },
    ],
  },
  {
    label: 'Developer diagnostics',
    links: [{ label: 'Debug panel', to: '/components/diagnostics' }],
  },
  {
    label: 'Guides and patterns',
    links: [{ label: 'Page composition', to: '/components/page' }],
  },
]
</script>

<style scoped>
.component-docs-nav {
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding-block: calc(var(--spacing) * 4);
}

.component-docs-nav__group {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.component-docs-nav__group h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.component-docs-nav__link {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}

.component-docs-nav__link:hover,
.component-docs-nav__link:focus-visible,
.component-docs-nav__link--active {
  color: var(--ui-text-highlighted);
}
</style>
