<!-- Public design showcase (moved from /dev/design) -->
<script setup lang="ts">
useHead({ title: 'Design System' })
const sections = [
  {
    name: 'Atoms',
    icon: 'i-lucide-box',
    pages: ['colors', 'img', 'tokens', 'typography'],
  },
]
const getPagePath = (section: string, page: string) =>
  `/design/${section.toLowerCase()}/${page}`
</script>

<template>
  <div class="design-layout">
    <aside class="sidebar">
      <h2>Design System</h2>
      <nav v-for="section in sections" :key="section.name">
        <h3><UIcon :name="section.icon" class="icon" /> {{ section.name }}</h3>
        <ul>
          <li v-for="page in section.pages" :key="page">
            <NuxtLink :to="getPagePath(section.name, page)">
              {{ page.replace('-', ' ') }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.design-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 250px;
  background: var(--ui-bg-elevated);
  padding: calc(var(--spacing) * 4);
  border-right: 1px solid var(--ui-border-muted);
  overflow-y: auto;
}
.sidebar h2 {
  text-align: center;
  margin-bottom: calc(var(--spacing) * 4);
}
.sidebar h3 {
  margin-top: calc(var(--spacing) * 4);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}
.icon {
  margin-right: calc(var(--spacing) * 2);
}
ul {
  list-style: none;
  padding-left: calc(var(--spacing) * 4);
}
li {
  margin-bottom: calc(var(--spacing) * 2);
}
li a {
  text-decoration: none;
  color: var(--ui-text);
  font-weight: 500;
}
li a:hover {
  color: var(--ui-primary);
}
.content {
  flex-grow: 1;
  padding: calc(var(--spacing) * 8);
  overflow-y: auto;
}
</style>
