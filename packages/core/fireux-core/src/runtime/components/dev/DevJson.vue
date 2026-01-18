<template>
  <Json v-bind="$attrs" />
</template>

<script setup lang="ts">
import Json from './Json.vue';

defineOptions({ name: 'DevJson' })
</script>
