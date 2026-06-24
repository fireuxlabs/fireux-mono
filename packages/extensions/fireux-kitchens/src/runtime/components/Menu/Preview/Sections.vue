<template>
  <div class="menu-sections">
    <MenuStructuredSection
      v-for="section in sections"
      :key="section.id"
      :section="section"
    />
  </div>
</template>

<script setup lang="ts">
import type { MenuStructuredSection } from '../Structured/types'

defineProps<{
  sections: MenuStructuredSection[]
}>()
</script>

<style scoped>
.menu-sections {
  display: grid;
  gap: 2rem;
  width: min(88rem, 100%);
  margin: 0 auto;
  text-align: left;
}
</style>
