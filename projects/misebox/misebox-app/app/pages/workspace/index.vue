<template>
  <WorkspaceGreeting family="Kitchen" />
</template>

<script setup lang="ts">
import WorkspaceGreeting from 'fireux-workspace/runtime/workspace/components/Greeting.vue'

definePageMeta({ layout: false, requiresAuth: false })
</script>
