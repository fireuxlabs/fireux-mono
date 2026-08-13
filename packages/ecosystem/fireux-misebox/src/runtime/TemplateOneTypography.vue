<template>
  <section class="typography" :style="familyVars" aria-labelledby="template-one-typography-title">
    <header>
      <small>Template One · Typography</small>
      <h2 id="template-one-typography-title">Two families. Four roles.</h2>
    </header>

    <dl class="typography__inputs">
      <div><dt>Display family</dt><dd>{{ typography.display_family }}</dd></div>
      <div><dt>Body family</dt><dd>{{ typography.body_family }}</dd></div>
    </dl>

    <div class="typography__roles">
      <article><small>Display</small><p class="role-display">COMING SOON.</p></article>
      <article><small>Heading</small><p class="role-heading">HOUSE SPECIALS</p></article>
      <article><small>Body</small><p class="role-body">Coming soon to a location near you.</p></article>
      <article>
        <small>Label</small>
        <p class="role-label">03 · LOCATIONS</p>
        <p class="role-label">ORDER NOW</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppTypography } from './template-one'

const props = defineProps<{ typography: AppTypography }>()
const familyVars = computed(() => ({
  '--template-one-display-family': props.typography.display_family,
  '--template-one-body-family': props.typography.body_family,
}))
</script>

<style scoped>
.typography { display: grid; gap: calc(var(--spacing) * 6); padding: clamp(calc(var(--spacing) * 6), 6vw, calc(var(--spacing) * 12)); color: #181817; background: #f3e9d2; }
.typography header { display: grid; gap: calc(var(--spacing) * 2); }
.typography header small, article small, dt { color: color-mix(in srgb, currentColor 58%, transparent); font: 600 var(--text-xs)/1.2 var(--template-one-body-family); letter-spacing: .08em; text-transform: uppercase; }
.typography h2 { margin: 0; font: 700 clamp(var(--text-2xl), 5vw, var(--text-4xl))/1 var(--template-one-display-family); text-transform: uppercase; }
.typography__inputs, .typography__roles { display: grid; gap: calc(var(--spacing) * 3); margin: 0; }
.typography__inputs { grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); }
.typography__inputs div, article { display: grid; gap: calc(var(--spacing) * 2); padding: calc(var(--spacing) * 4); border: 1px solid color-mix(in srgb, currentColor 18%, transparent); }
dd, article p { margin: 0; }
dd { overflow-wrap: anywhere; font: var(--text-sm)/1.5 var(--template-one-body-family); }
.role-display { font: 900 clamp(3rem, 10vw, 7rem)/.86 var(--template-one-display-family); letter-spacing: -.04em; text-transform: uppercase; }
.role-heading { font: 700 clamp(var(--text-2xl), 5vw, var(--text-5xl))/.95 var(--template-one-display-family); letter-spacing: .02em; text-transform: uppercase; }
.role-body { font: 400 clamp(var(--text-base), 2vw, var(--text-xl))/1.6 var(--template-one-body-family); }
.role-label { font: 600 var(--text-sm)/1.2 var(--template-one-display-family); letter-spacing: .16em; text-transform: uppercase; }
@media (min-width: 48rem) { .typography__roles { grid-template-columns: repeat(2, minmax(0, 1fr)); } .typography__roles article:first-child { grid-column: 1 / -1; } }
</style>
