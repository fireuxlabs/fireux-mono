<template>
  <section v-if="init" class="space-y-2">
    <pre>ConsoleKitchenTargetsTest</pre>

    <UPageCard
      title="Test target ready"
      description="Kitchen test target setup can render here."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  init?: boolean
}>()
</script>
