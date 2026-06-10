<template>
  <section v-if="show" class="space-y-2">
    <pre>ConsoleBlankTargetsDemo</pre>

    <UPageCard
      title="Demo target enabled"
      description="Blank demo targets can render here."
      variant="subtle"
    />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  show?: boolean
}>()
</script>
