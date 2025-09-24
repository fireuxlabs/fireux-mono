<template>
  <div class="dev-routes-debug">
    <h3 class="title">Navigation Debug</h3>
    <div class="grid">
      <div>
        <h4>Flags</h4>
        <ul class="mono small">
          <li>isAppUser: {{ isAppUser ? 'yes' : 'no' }}</li>
          <li>isAdmin: {{ isAdmin ? 'yes' : 'no' }}</li>
        </ul>
      </div>
      <div>
        <h4>All IDs (flat order)</h4>
        <ul class="mono small">
          <li v-for="id in allIds" :key="id">{{ id }}</li>
        </ul>
      </div>
      <div>
        <h4>Menu Bar IDs</h4>
        <ul class="mono small">
          <li v-for="id in menuIds" :key="id">{{ id }}</li>
        </ul>
      </div>
      <div>
        <h4>Mobile IDs</h4>
        <ul class="mono small">
          <li v-for="id in mobileIds" :key="id">{{ id }}</li>
        </ul>
      </div>
    </div>
    <details class="raw">
      <summary>Raw Route Objects</summary>
      <pre>{{ JSON.stringify(coreRoutes.links.value, null, 2) }}</pre>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// useCoreRoutes provided globally
declare function useCoreRoutes(): any
const coreRoutes = useCoreRoutes()

const allIds = computed(() => coreRoutes.links.value.map((l: any) => l.id))
const isAppUser = coreRoutes.isAppUser?.value
const isAdmin = coreRoutes.isAdmin?.value

// Reconstruct same filters as default layout for parity
const menuIds = computed(() =>
  coreRoutes.links.value
    .filter((r: any) => ['home', 'products', 'blog', 'users'].includes(r.id))
    .map((r: any) => r.id)
)
const mobileIds = computed(() =>
  coreRoutes.links.value
    .filter((r: any) =>
      ['home', 'products', 'blog', 'users', 'user', 'admin'].includes(r.id)
    )
    .map((r: any) => r.id)
)
</script>

<style scoped>
.dev-routes-debug {
  border: 1px solid var(--ui-border);
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--ui-bg-soft);
}
.title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}
.grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
.small {
  font-size: 0.75rem;
  line-height: 1.15;
}
.raw {
  margin-top: 1rem;
}
pre {
  max-height: 320px;
  overflow: auto;
  font-size: 0.7rem;
}
</style>
