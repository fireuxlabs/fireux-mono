<template>
  <fieldset class="template-brand-switcher">
    <legend>Kitchen toggle</legend>
    <div>
      <NuxtLink
        v-for="brand in brands"
        :key="brand.id"
        replace
        :to="{ query: { ...route.query, brand: brand.id } }"
        :aria-pressed="brand.id === modelValue"
      >
        <span class="template-brand-switcher__swatch" :style="swatch(brand)" />
        <span class="template-brand-switcher__label">
          <strong>{{ brand.name }}</strong>
          <small>{{ tierLabel(brand) }}</small>
        </span>
      </NuxtLink>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import type { TemplateOneBrandInjection } from './template-one'
const route = useRoute()

defineProps<{
  brands: readonly TemplateOneBrandInjection[]
  modelValue: TemplateOneBrandInjection['id']
}>()

const swatch = (brand: TemplateOneBrandInjection) => ({
  '--swatch-canvas': brand.rootProps.palette.secondary_color,
  '--swatch-accent': brand.rootProps.palette.primary_color,
})

const tierLabel = (brand: TemplateOneBrandInjection) => {
  if (brand.tier === 'root') return 'Root Kitchen · unassigned example'
  if (brand.tier === 'console') {
    return brand.appProps
      ? 'Console Kitchen · Demo · App preview'
      : 'Console Kitchen · Demo'
  }
  return brand.demo ? 'App Kitchen · Demo preview' : 'App Kitchen'
}
</script>

<style scoped>
.template-brand-switcher {
  display: grid;
  gap: 0.65rem;
  min-width: 0;
}

legend {
  margin-bottom: 0.65rem;
  color: var(--ui-text-muted);
  font-size: 0.72rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

fieldset > div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.template-brand-switcher a {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  min-height: 2.6rem;
  padding: 0.55rem 0.8rem;
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  font-weight: 650;
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  cursor: pointer;
}

.template-brand-switcher__label {
  display: grid;
  gap: calc(var(--spacing) * 0.5);
  text-align: left;
}

.template-brand-switcher__label strong {
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-bold);
}

.template-brand-switcher__label small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-normal);
  letter-spacing: normal;
  text-transform: none;
}

.template-brand-switcher a[aria-pressed='true'] {
  color: var(--ui-text-highlighted);
  border-color: var(--ui-text-highlighted);
  box-shadow: inset 0 0 0 1px var(--ui-text-highlighted);
}

.template-brand-switcher__swatch {
  width: 1.1rem;
  height: 1.1rem;
  background: linear-gradient(
    135deg,
    var(--swatch-canvas) 50%,
    var(--swatch-accent) 50%
  );
  border: 1px solid rgb(127 127 127 / 25%);
  border-radius: 50%;
}
</style>
