<template>
  <aside class="hero-props" aria-label="Level One Hero variables">
    <strong>Level One · Hero</strong>
    <dl>
      <div><dt>Name</dt><dd>{{ name }}</dd></div>
      <div><dt>Wordmark</dt><dd>{{ wordmarkSrc ? 'Present' : 'Missing' }}</dd></div>
      <div><dt>Place primary</dt><dd><span :style="{ backgroundColor: placePrimaryColor }" /><code>{{ placePrimaryColor }}</code></dd></div>
      <div><dt>Present</dt><dd>{{ present }}</dd></div>
      <div><dt>Alignment</dt><dd>{{ identityAlignment }}</dd></div>
    </dl>
    <small>Header reuses Name + Wordmark. Links are Template One defaults.</small>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ name: string; wordmarkSrc?: string; placePrimaryColor: string; present: string; identityAlignment: string }>()
</script>

<style scoped>
.hero-props { display: flex; flex-wrap: nowrap; gap: calc(var(--spacing) * 4); align-items: center; padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 4); color: color-mix(in srgb, white 78%, transparent); font-size: var(--text-xs); background: rgb(0 0 0 / 55%); border-top: 1px solid rgb(255 255 255 / 10%); backdrop-filter: blur(calc(var(--spacing) * 3)); overflow-x: auto; scrollbar-width: none; }
.hero-props::-webkit-scrollbar { display: none; }
.hero-props > strong { flex: 0 0 auto; color: white; letter-spacing: var(--tracking-widest); text-transform: uppercase; }
.hero-props dl { display: flex; flex: 0 0 auto; flex-wrap: nowrap; gap: calc(var(--spacing) * 2) calc(var(--spacing) * 5); margin: 0; }
.hero-props dl > div { display: flex; gap: calc(var(--spacing) * 1.5); }
.hero-props dt { color: color-mix(in srgb, white 48%, transparent); }
.hero-props dd { display: flex; gap: calc(var(--spacing) * 1.5); align-items: center; margin: 0; color: white; }
.hero-props dd span { width: calc(var(--spacing) * 3); height: calc(var(--spacing) * 3); border: 1px solid rgb(255 255 255 / 35%); border-radius: 50%; }
.hero-props small { display: none; color: color-mix(in srgb, white 55%, transparent); }
@media (min-width: 40.0625rem) {
  .hero-props { margin-inline: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12)); flex-wrap: wrap; gap: calc(var(--spacing) * 3) calc(var(--spacing) * 6); overflow: visible; }
  .hero-props dl { flex: 1; flex-wrap: wrap; }
  .hero-props small { display: inline; }
}
</style>
