<template>
  <nav aria-label="Docs navigation">
    <ul class="space-y-1">
      <DocsNavigationItem
        v-for="item in items"
        :key="item.path || item._path || item.title"
        :item="item"
      />
    </ul>
  </nav>
</template>

<script setup lang="ts">
type NavigationItem = {
  title?: string
  label?: string
  path?: string
  _path?: string
  children?: NavigationItem[]
}

defineProps<{
  items?: NavigationItem[]
}>()
</script>
