<template>
  <div>
    <p :role="overview.role">{{ overview.message }}</p>
    <ul v-if="overview.flags.length">
      <li v-for="flag in overview.flags" :key="flag">{{ flag }}</li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import type { OverviewSummary } from '../../../utils/overview-summary'
defineProps<{ overview: OverviewSummary }>()
</script>
