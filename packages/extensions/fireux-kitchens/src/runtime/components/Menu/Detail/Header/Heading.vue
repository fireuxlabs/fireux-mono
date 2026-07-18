<template>
  <div
    class="menu-detail-heading"
    :class="{ 'menu-detail-heading--start': align === 'start' }"
  >
    <p v-if="kitchenName" class="menu-detail-heading__eyebrow">
      {{ kitchenName }}
    </p>
    <h1>{{ name }}</h1>
    <p v-if="description" class="menu-detail-heading__description">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
// Menu detail hero spine: shared by menu detail and console menu-display preview.
withDefaults(
  defineProps<{
    kitchenName?: string
    name: string
    description?: string
    align?: 'center' | 'start'
  }>(),
  {
    align: 'center',
  }
)
</script>

<style scoped>
.menu-detail-heading {
  display: grid;
  gap: calc(var(--spacing) * 3);
  justify-items: center;
  text-align: center;
}

.menu-detail-heading--start {
  justify-items: start;
  text-align: left;
}

.menu-detail-heading__eyebrow {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu-detail-heading h1 {
  max-width: 11ch;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.86;
}

.menu-detail-heading--start h1 {
  max-width: min(100%, 13ch);
}

.menu-detail-heading__description {
  margin: 0;
  color: var(--menu-secondary);
  font-size: 0.95rem;
  font-weight: 700;
}

.menu-detail-heading--start .menu-detail-heading__description {
  max-width: 36rem;
  line-height: 1.45;
}
</style>
