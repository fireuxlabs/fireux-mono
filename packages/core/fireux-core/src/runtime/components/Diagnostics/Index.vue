<template>
  <UPage>
    <UPageHeader title="Diagnostics" description="Inspect the active App and its enabled domains." />
    <UPageBody>
      <UPageGrid>
        <UPageCard v-for="item in tools" :key="String(item.to)" :title="item.label" :icon="item.icon" :to="item.to" />
      </UPageGrid>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useDiagnosticsNav } from '../../composables/navigation/useDiagnosticsNav'
const { desktop } = useDiagnosticsNav()
const tools = computed(() => desktop.value.filter(item => item.to !== '/diagnostics'))
</script>
