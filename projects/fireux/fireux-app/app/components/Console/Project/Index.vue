<!-- ConsoleProject.vue -->
<template>
  <pre>{{ projects }}</pre>
</template>

<script setup lang="ts">
const { projects } = useProjectConsole()
</script>