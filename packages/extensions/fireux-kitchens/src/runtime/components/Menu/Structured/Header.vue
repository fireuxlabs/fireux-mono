<template>
  <header class="menu-header">
    <p v-if="menu.presentation.kitchenName" class="menu-header__eyebrow">
      {{ menu.presentation.kitchenName }}
    </p>
    <h1>{{ menu.content.name }}</h1>
    <p v-if="menu.content.description" class="menu-header__description">
      {{ menu.content.description }}
    </p>

    <MenuStructuredViewToggle
      v-if="viewModes.length > 1"
      :model-value="modelValue"
      :options="viewModes"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </header>
</template>

<script setup lang="ts">
import type { MenuManifest } from '../../../composables/fireux/public/menu/useMenuManifest'
import type { MenuView } from '../../../models/menu/menu.model'

defineProps<{
  menu: MenuManifest
  modelValue: MenuView
  viewModes: MenuView[]
}>()

defineEmits<{
  (event: 'update:modelValue', value: MenuView): void
}>()
</script>

<style scoped>
.menu-header {
  display: grid;
  gap: 0.75rem;
  justify-items: center;
}

.menu-header__eyebrow {
  margin: 0;
  color: var(--menu-primary);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.menu-header h1 {
  max-width: 11ch;
  margin: 0;
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}

.menu-header__description {
  margin: 0;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: 700;
}
</style>
