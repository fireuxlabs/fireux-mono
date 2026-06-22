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
defineProps<{
  kitchenName: string
  name: string
  description?: string
}>()
</script>

<style scoped>
.menu-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.menu-language {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.kitchen-name,
.description {
  font-family: inherit;
}

.kitchen-name {
  margin: 0 0 0.5rem;
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
  margin: 0.75rem auto 0;
  max-width: 42rem;
  line-height: 1.55;
  color: var(--menu-muted);
}
</style>
