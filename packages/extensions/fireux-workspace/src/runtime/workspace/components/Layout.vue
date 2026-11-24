<template>
  <div>
    <UHeader :title="title" :toggle="false" />
    <div class="workspace-body">
      <aside class="workspace-sidebar" aria-hidden="true" />
      <UMain class="workspace-main">
        <slot />
      </UMain>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<style scoped>
.workspace-sidebar {
  display: none;
}

.workspace-main {
  min-width: 0;
  padding: 1rem;
}

@media (min-width: 64rem) {
  .workspace-body {
    display: grid;
    grid-template-columns: 14rem minmax(0, 1fr);
  }

  .workspace-sidebar {
    display: block;
    border-inline-end: 1px solid var(--ui-border);
    background: var(--ui-bg-elevated);
  }

  .workspace-main {
    padding: 1.5rem;
  }
}
</style>
