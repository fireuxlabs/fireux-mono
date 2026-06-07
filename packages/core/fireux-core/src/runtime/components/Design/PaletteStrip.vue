<template>
  <ul class="design-palette-strip" :aria-label="ariaLabel">
    <li
      v-for="colour in palette"
      :key="colour.role ?? colour.name"
      class="design-palette-strip__item"
    >
      <span
        class="design-palette-strip__swatch"
        :style="{ backgroundColor: colour.color }"
        aria-hidden="true"
      />
      <span class="design-palette-strip__copy">
        <span>{{ colour.name }}</span>
        <strong>{{ colour.label ?? colour.color }}</strong>
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { PaletteStripColour } from '../../types/design'

withDefaults(defineProps<{
  palette: readonly PaletteStripColour[]
  ariaLabel?: string
}>(), {
  ariaLabel: 'Colour palette',
})
</script>

<style scoped>
.design-palette-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.55rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.design-palette-strip__item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
  padding: 0.55rem;
  border: 1px solid rgb(255 255 255 / 24%);
  border-radius: 999px;
  background: rgb(42 14 7 / 62%);
  color: #f2e8d8;
  box-shadow: 0 18px 48px rgb(42 14 7 / 28%);
  backdrop-filter: blur(16px);
}

.design-palette-strip__swatch {
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border: 1px solid rgb(255 255 255 / 36%);
  border-radius: 999px;
}

.design-palette-strip__copy {
  display: grid;
  min-width: 0;
  gap: 0.08rem;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  line-height: 1.1;
  text-transform: uppercase;
}

.design-palette-strip__copy strong {
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-transform: none;
}

@media (max-width: 760px) {
  .design-palette-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 440px) {
  .design-palette-strip {
    grid-template-columns: 1fr;
  }
}
</style>
