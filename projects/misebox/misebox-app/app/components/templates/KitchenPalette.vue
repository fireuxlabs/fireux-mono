<template>
  <section class="palette" aria-labelledby="palette-title">
    <div>
      <small>Stored colour ownership</small>
      <h2 id="palette-title">What comes from where</h2>
    </div>

    <div class="palette__layers">
      <article>
        <header>
          <strong>Place</strong>
          <small>{{ kitchen.rootProps.source }}</small>
        </header>
        <ColorValue label="Identity backdrop" :value="kitchen.rootProps.placePrimaryColor" />
      </article>

      <article>
        <header>
          <strong>Kitchen</strong>
          <small>{{ kitchen.rootProps.kitchenSource || 'Kitchen root' }}</small>
        </header>
        <p>No override stored. Contributes no colour at this layer.</p>
      </article>

      <article v-if="kitchen.consoleProps">
        <header>
          <strong>Console</strong>
          <small>{{ kitchen.consoleProps.source }}</small>
        </header>
        <div class="palette__values">
          <ColorValue v-for="key in consoleKeys" :key="key" :label="label(key)" :value="consoleValues[key]" />
        </div>
      </article>

      <article v-if="kitchen.appProps">
        <header>
          <strong>App</strong>
          <small>{{ kitchen.appProps.source }}</small>
        </header>
        <div class="palette__values">
          <ColorValue v-for="key in appKeys" :key="key" :label="label(key)" :value="appValues[key]" />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPaletteLayer, ConsolePalette, TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/template-one'
import ColorValue from './ColorValue.vue'

const props = defineProps<{ kitchen: TemplateOneKitchenSpecimen }>()

const consoleKeys = ['canvas', 'text', 'accent', 'accent_contrast'] as const
const appKeyOrder = ['canvas', 'surface', 'canvas_inverted', 'text', 'text_muted', 'ink', 'accent', 'accent_contrast'] as const
const consoleValues = computed<Partial<ConsolePalette>>(
  () => props.kitchen.consoleProps?.palette || {}
)
const appValues = computed<AppPaletteLayer>(
  () => props.kitchen.appProps?.palette || {}
)
const appKeys = computed(() =>
  appKeyOrder.filter(key => Boolean(appValues.value[key]))
)
const label = (key: string) => key.replaceAll('_', ' ')
</script>

<style scoped>
.palette { display: grid; gap: calc(var(--spacing) * 6); }
.palette > div:first-child small { color: var(--ui-primary); font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }
.palette h2 { margin: calc(var(--spacing) * 1) 0 0; }
.palette__layers { display: grid; gap: calc(var(--spacing) * 3); }
article { display: grid; gap: calc(var(--spacing) * 4); padding: calc(var(--spacing) * 5); background: var(--ui-bg-muted); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); }
article header { display: flex; justify-content: space-between; gap: calc(var(--spacing) * 3); }
article header small { color: var(--ui-text-muted); }
article p { margin: 0; color: var(--ui-text-muted); }
.palette__values { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: calc(var(--spacing) * 3); }
@media (min-width: 64rem) { .palette__layers { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
