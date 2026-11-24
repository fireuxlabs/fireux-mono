<template>
  <h1>Hello{{ family ? ` ${family}` : '' }} World</h1>
</template>

<script setup lang="ts">
defineProps<{ family?: string }>()
</script>
