<template>
  <ClientOnly>
    <div class="h-screen flex items-center justify-center px-4">
      <UPageCard variant="subtle" class="max-w-sm w-full">
        <slot />
      </UPageCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({ name: 'CoreAuth' })
</script>
