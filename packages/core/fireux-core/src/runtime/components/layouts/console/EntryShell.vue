<template>
  <div class="min-h-[100dvh] bg-elevated/40">
    <div class="mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
      <div class="w-full">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

provide('fireux-console-entry-close', {
  to: '/',
  ariaLabel: 'Close console entry',
})
</script>
