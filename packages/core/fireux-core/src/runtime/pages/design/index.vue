<!-- COMMENT: app/pages/design/index.vue -->
<script setup>
const sections = [
  { name: "Atoms", icon: "i-lucide-box", pages: ["colors", "img", "tokens", "typography"] },
  // { name: "Molecules", icon: "i-lucide-grid", pages: ["buttons", "cards"] }, // Future expansion
  // { name: "Organisms", icon: "i-lucide-layout", pages: ["headers", "footers"] }, // Future expansion
];

const getPagePath = (section, page) => `/design/${section.toLowerCase()}/${page}`;
</script>

<template>
  <div class="design-layout">
    <!-- ✅ Sidebar Navigation -->
    <aside class="sidebar">
      <h2>Design System</h2>
      <nav v-for="section in sections" :key="section.name">
        <h3>
          <UIcon :name="section.icon" class="icon" /> {{ section.name }}
        </h3>
        <ul>
          <li v-for="page in section.pages" :key="page">
            <NuxtLink :to="getPagePath(section.name, page)">
              {{ page.replace("-", " ") }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </aside>

    <!-- ✅ Main Content -->
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
  padding: 1rem;
  border-right: 1px solid var(--ui-border-muted);
  overflow-y: auto;
}

.sidebar h2 {
  text-align: center;
  margin-bottom: 1rem;
}

.sidebar h3 {
  margin-top: 1rem;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
}

.icon {
  margin-right: 0.5rem;
}

ul {
  list-style: none;
  padding-left: 1rem;
}

li {
  margin-bottom: 0.5rem;
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
  padding: 2rem;
  overflow-y: auto;
}
</style>