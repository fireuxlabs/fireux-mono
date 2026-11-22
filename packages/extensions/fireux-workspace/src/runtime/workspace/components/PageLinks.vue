<template>
  <nav class="workspace-surface__grid" :aria-label="title + ' pages'">
    <UPageCard
      v-for="item in children"
      :key="item.key || item.to"
      :title="item.label"
      :to="item.to"
      :icon="item.icon"
    />
  </nav>
</template>
<script setup lang="ts">
import { useWorkspacePageNavigation } from '../composables/useWorkspacePageNavigation'
const { title, children } = useWorkspacePageNavigation()
</script>
