<template>
  <section class="typography" aria-labelledby="typography-title">
    <div>
      <small>Typography</small>
      <h2 id="typography-title">Font families</h2>
    </div>

    <div class="typography__layers">
      <article>
        <strong>Root</strong>
        <FontValue label="Misebox default" value="system-ui, sans-serif" />
      </article>

      <article v-if="kitchen.consoleProps">
        <strong>Console</strong>
        <FontValue label="Display" :value="consoleDisplay" />
        <FontValue label="Body" :value="consoleBody" />
      </article>

      <article v-if="kitchen.appProps">
        <strong>App</strong>
        <FontValue label="Display" :value="kitchen.appProps.typography.display_family" />
        <FontValue label="Body" :value="kitchen.appProps.typography.body_family" />
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateOneKitchenSpecimen } from 'fireux-misebox/runtime/template-one'
import FontValue from './FontValue.vue'

const props = defineProps<{ kitchen: TemplateOneKitchenSpecimen }>()
const consoleDisplay = computed(() => props.kitchen.consoleProps?.pageStyle.title_font_family || '')
const consoleBody = computed(() => props.kitchen.consoleProps?.pageStyle.font_family || '')
</script>

<style scoped>
.typography { display: grid; gap: calc(var(--spacing) * 6); }
.typography > div:first-child small { color: var(--ui-primary); font-size: var(--text-xs); font-weight: var(--font-weight-extrabold); letter-spacing: var(--tracking-widest); text-transform: uppercase; }
.typography h2 { margin: calc(var(--spacing) * 1) 0 0; }
.typography__layers { display: grid; gap: calc(var(--spacing) * 3); }
article { display: grid; gap: calc(var(--spacing) * 4); padding: calc(var(--spacing) * 5); background: var(--ui-bg-muted); border: 1px solid var(--ui-border); border-radius: var(--ui-radius); }
@media (min-width: 48rem) { .typography__layers { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); } }
</style>
