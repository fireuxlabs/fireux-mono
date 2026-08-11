<template>
  <fieldset class="template-brand-switcher">
    <legend>Kitchen comparison</legend>
    <div class="template-brand-switcher__groups">
      <section v-for="group in groupedBrands" :key="group.tier">
        <p>{{ group.label }}</p>
        <div>
          <NuxtLink
            v-for="brand in group.brands"
            :key="brand.id"
            replace
            :to="{ query: { ...route.query, brand: brand.id } }"
            :aria-pressed="brand.id === modelValue"
          >
            <span class="template-brand-switcher__swatch" :style="swatch(brand)" />
            <span class="template-brand-switcher__label">
              <strong>{{ brand.name }}</strong>
              <small>{{ sourceLabel(brand) }}</small>
            </span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TemplateOneKitchenSpecimen } from './template-one'
const route = useRoute()

const props = defineProps<{
  brands: readonly TemplateOneKitchenSpecimen[]
  modelValue: TemplateOneKitchenSpecimen['id']
}>()

const groupedBrands = computed(() => [
  {
    tier: 'root',
    label: 'Root',
    brands: props.brands.filter((brand) => brand.tier === 'root'),
  },
  {
    tier: 'console',
    label: 'Console',
    brands: props.brands.filter((brand) => brand.tier === 'console'),
  },
  {
    tier: 'app',
    label: 'App Kitchens · inherited base',
    brands: props.brands.filter((brand) => brand.tier === 'app'),
  },
])

const swatch = (brand: TemplateOneKitchenSpecimen) => ({
  '--swatch-canvas': brand.rootProps.placePrimaryColor,
})

const sourceLabel = (brand: TemplateOneKitchenSpecimen) => {
  return brand.demo ? 'Demo' : 'Live'
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

.template-brand-switcher__groups {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.template-brand-switcher section {
  display: grid;
  gap: 0.4rem;
}

.template-brand-switcher section > p {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.template-brand-switcher section > div {
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
  background: var(--swatch-canvas);
  border: 1px solid rgb(127 127 127 / 25%);
  border-radius: 50%;
}
</style>
