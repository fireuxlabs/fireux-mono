<template>
  <header class="menu-header">
    <p v-if="kitchenName" class="kitchen-name">
      {{ kitchenName }}
    </p>
    <div v-if="$slots.language" class="menu-language">
      <slot name="language" />
    </div>
    <h1>{{ name }}</h1>
    <p v-if="description" class="description">
      {{ description }}
    </p>
  </header>
</template>

<script setup lang="ts">
// Menu detail title surface; richer section/item display lives beside this detail stack.
defineProps<{
  kitchenName: string
  name: string
  description?: string
}>()
</script>

<style scoped>
.menu-header {
  text-align: center;
  margin-bottom: calc(var(--spacing) * 6);
}

.menu-language {
  display: flex;
  justify-content: center;
  margin-bottom: calc(var(--spacing) * 4);
}

.kitchen-name,
.description {
  font-family: inherit;
}

.kitchen-name {
  margin: 0 0 calc(var(--spacing) * 2);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0;
  color: var(--menu-secondary);
}

.menu-header h1 {
  margin: 0;
  font-family: var(--menu-title-font);
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  color: var(--menu-title);
}

.description {
  margin: calc(var(--spacing) * 3) auto 0;
  max-width: 42rem;
  line-height: 1.55;
  color: var(--menu-muted);
}
</style>
