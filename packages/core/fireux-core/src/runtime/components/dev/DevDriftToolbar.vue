<template>
  <DriftToolbar v-bind="$attrs" />
</template>

<script setup lang="ts">
import DriftToolbar from './DriftToolbar.vue';

defineOptions({ name: 'DevDriftToolbar' })
</script>
