<template>
  <div class="menu-structured-heading">
    <p v-if="kitchenName" class="menu-structured-heading__eyebrow">
      {{ kitchenName }}
    </p>
    <h1>{{ name }}</h1>
    <p v-if="description" class="menu-structured-heading__description">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
// Structured menu heading spine: shared by public menus and console menu-display preview.
defineProps<{
  kitchenName?: string
  name: string
  description?: string
}>()
</script>

<style scoped>
.menu-structured-heading {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.menu-structured-heading__eyebrow {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu-structured-heading h1 {
  max-width: 11ch;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}

.menu-structured-heading__description {
  margin: 0;
  color: var(--menu-secondary);
  font-size: 0.95rem;
  font-weight: 700;
}
</style>
