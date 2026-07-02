<template>
  <section class="menu-order-card">
    <header v-if="title" class="menu-order-header">
      <div>
        <p class="menu-order-step-label">
          {{ number }} of {{ total }}
        </p>
        <h2>{{ title }}</h2>
      </div>
    </header>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  number?: number | string
  title?: string
  total?: number | string
}>()
</script>
