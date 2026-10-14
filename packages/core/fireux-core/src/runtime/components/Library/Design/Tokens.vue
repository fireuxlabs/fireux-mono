<template>
  <div class="design">
    <UTabs :items="items">
      <!-- ✅ Shadows -->
      <template #shadows>
        <h2>Shadows</h2>
        <div class="grid">
          <div
            v-for="token in shadowTokens"
            :key="token.name"
            class="token-item"
          >
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span class="stacked-value">{{ token.value }}</span>
            </div>
            <div class="shadow-block" :class="token.class" />
          </div>
        </div>
      </template>

      <!-- ✅ Opacity -->
      <template #opacity>
        <h2>Opacity</h2>
        <div class="grid">
          <div
            v-for="token in opacityTokens"
            :key="token.name"
            class="token-item"
          >
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="opacity-block" :style="{ opacity: token.value }" />
          </div>
        </div>
      </template>

      <!-- ✅ Border Radius -->
      <template #borderRadius>
        <h2>Border Radius</h2>
        <div class="grid">
          <div
            v-for="token in radiusTokens"
            :key="token.name"
            class="token-item"
          >
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="radius-block" :style="{ borderRadius: token.value }" />
          </div>
        </div>
      </template>

      <!-- ✅ Spacing -->
      <template #spacing>
        <h2>Spacing</h2>
        <div class="grid spacing-mobile">
          <div
            v-for="token in spacingTokens"
            :key="token.name"
            class="token-item"
          >
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="spacing-block" :style="{ padding: token.value }" />
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">

const items = [
  { icon: 'i-lucide-cloudy', label: 'Shadows', slot: 'shadows' },
  { icon: 'i-lucide-rainbow', label: 'Opacity', slot: 'opacity' },
  { icon: 'i-lucide-radius', label: 'Radius', slot: 'borderRadius' },
  { icon: 'i-lucide-ruler', label: 'Spacing', slot: 'spacing' },
]

const shadowTokens = [
  { name: '--shadow-none', value: 'none', class: 'shadow-none' },
  { name: '--shadow-sm', value: 'var(--shadow-sm)', class: 'shadow-sm' },
  { name: '--shadow-md', value: 'var(--shadow-md)', class: 'shadow-md' },
  { name: '--shadow-lg', value: 'var(--shadow-lg)', class: 'shadow-lg' },
  { name: '--shadow-xl', value: 'var(--shadow-xl)', class: 'shadow-xl' },
  { name: '--shadow-2xl', value: 'var(--shadow-2xl)', class: 'shadow-2xl' },
]

const opacityTokens = [
  { name: '--opacity-0', value: '0' },
  { name: '--opacity-25', value: '0.25' },
  { name: '--opacity-50', value: '0.5' },
  { name: '--opacity-75', value: '0.75' },
  { name: '--opacity-100', value: '1' },
]

const radiusTokens = [
  { name: 'rounded-xs', value: 'calc(var(--ui-radius) * 0.5)' },
  { name: 'rounded-sm', value: 'var(--ui-radius)' },
  { name: 'rounded-md', value: 'calc(var(--ui-radius) * 1.5)' },
  { name: 'rounded-lg', value: 'calc(var(--ui-radius) * 2)' },
  { name: 'rounded-xl', value: 'calc(var(--ui-radius) * 3)' },
  { name: 'rounded-2xl', value: 'calc(var(--ui-radius) * 4)' },
  { name: 'rounded-3xl', value: 'calc(var(--ui-radius) * 6)' },
]

const spacingTokens = [
  { name: 'spacing × 1', value: 'var(--spacing)' },
  { name: 'spacing × 2', value: 'calc(var(--spacing) * 2)' },
  { name: 'spacing × 3', value: 'calc(var(--spacing) * 3)' },
  { name: 'spacing × 4', value: 'calc(var(--spacing) * 4)' },
  { name: 'spacing × 6', value: 'calc(var(--spacing) * 6)' },
  { name: 'spacing × 8', value: 'calc(var(--spacing) * 8)' },
  { name: 'spacing × 12', value: 'calc(var(--spacing) * 12)' },
  { name: 'spacing × 16', value: 'calc(var(--spacing) * 16)' },
]
</script>

<style scoped>
.design {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
h2 {
  text-align: center;
  width: 100%;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: calc(var(--spacing) * 4);
  text-align: center;
  padding: calc(var(--spacing) * 4);
}
.spacing-mobile {
  grid-template-columns: 1fr;
}
.token-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.token-header {
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: calc(var(--spacing) * 2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: calc(var(--ui-radius) * 1.5);
  text-align: center;
}
.shadow-block {
  width: 100%;
  max-width: 140px;
  height: 100px;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border-muted);
}
.opacity-block {
  background: var(--ui-primary);
}
.radius-block {
  background: var(--ui-primary);
}
.spacing-block {
  background: var(--ui-primary);
  width: 100%;
}
@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
