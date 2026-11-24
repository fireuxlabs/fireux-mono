<template>
  <WorkspaceGreeting />
</template>

<script setup lang="ts">
import WorkspaceGreeting from '../../workspace/components/Greeting.vue'

definePageMeta({ layout: false, requiresAuth: false })
</script>
