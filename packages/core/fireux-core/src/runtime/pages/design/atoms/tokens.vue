<!-- app/pages/design/atoms/tokens.vue -->
<template>
  <div class="design">
    <UTabs :items="items">
      <!-- ✅ Shadows -->
      <template #shadows>
        <h2>Shadows</h2>
        <div class="grid">
          <div v-for="token in shadowTokens" :key="token.name" class="token-item">
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span class="stacked-value">{{ token.value }}</span>
            </div>
            <div class="shadow-block" :class="token.class"/>
          </div>
        </div>
      </template>

      <!-- ✅ Opacity -->
      <template #opacity>
        <h2>Opacity</h2>
        <div class="grid">
          <div v-for="token in opacityTokens" :key="token.name" class="token-item">
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="opacity-block" :style="{ opacity: token.value }"/>
          </div>
        </div>
      </template>

      <!-- ✅ Border Radius -->
      <template #borderRadius>
        <h2>Border Radius</h2>
        <div class="grid">
          <div v-for="token in radiusTokens" :key="token.name" class="token-item">
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="radius-block" :style="{ borderRadius: token.value }"/>
          </div>
        </div>
      </template>

      <!-- ✅ Spacing -->
      <template #spacing>
        <h2>Spacing</h2>
        <div class="grid spacing-mobile">
          <div v-for="token in spacingTokens" :key="token.name" class="token-item">
            <div class="token-header">
              <span class="token-name">{{ token.name }}</span>
              <span>{{ token.value }}</span>
            </div>
            <div class="spacing-block" :style="{ padding: token.value }"/>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup>
definePageMeta({ layout: "design" });

const items = [
  { icon: "i-lucide-cloudy", slot: "shadows" },
  { icon: "i-lucide-rainbow", slot: "opacity" },
  { icon: "i-lucide-radius", slot: "borderRadius" },
  { icon: "i-lucide-ruler", slot: "spacing" }
];

const shadowTokens = [
  { name: '--shadow-none', value: 'none', class: 'shadow-none' },
  { name: '--shadow-sm', value: 'var(--shadow-sm)', class: 'shadow-sm' },
  { name: '--shadow-md', value: 'var(--shadow-md)', class: 'shadow-md' },
  { name: '--shadow-lg', value: 'var(--shadow-lg)', class: 'shadow-lg' },
  { name: '--shadow-xl', value: 'var(--shadow-xl)', class: 'shadow-xl' },
  { name: '--shadow-2xl', value: 'var(--shadow-2xl)', class: 'shadow-2xl' }
];

const opacityTokens = [
  { name: '--opacity-0', value: '0' },
  { name: '--opacity-25', value: '0.25' },
  { name: '--opacity-50', value: '0.5' },
  { name: '--opacity-75', value: '0.75' },
  { name: '--opacity-100', value: '1' }
];

const radiusTokens = [
  { name: '--radius-xs', value: 'var(--radius-xs)' },
  { name: '--radius-sm', value: 'var(--radius-sm)' },
  { name: '--radius-md', value: 'var(--radius-md)' },
  { name: '--radius-lg', value: 'var(--radius-lg)' },
  { name: '--radius-xl', value: 'var(--radius-xl)' },
  { name: '--radius-2xl', value: 'var(--radius-2xl)' },
  { name: '--radius-3xl', value: 'var(--radius-3xl)' },
  { name: '--radius-4xl', value: 'var(--radius-4xl)' }
];

const spacingTokens = [
  { name: '--space-0', value: 'var(--space-0)' },
  { name: '--space-1', value: 'var(--space-1)' },
  { name: '--space-2', value: 'var(--space-2)' },
  { name: '--space-3', value: 'var(--space-3)' },
  { name: '--space-4', value: 'var(--space-4)' },
  { name: '--space-5', value: 'var(--space-5)' },
  { name: '--space-6', value: 'var(--space-6)' },
  { name: '--space-7', value: 'var(--space-7)' },
  { name: '--space-8', value: 'var(--space-8)' },
  { name: '--space-9', value: 'var(--space-9)' },
  { name: '--space-10', value: 'var(--space-10)' },
  { name: '--space-12', value: 'var(--space-12)' },
  { name: '--space-16', value: 'var(--space-16)' },
  { name: '--space-20', value: 'var(--space-20)' }
];
</script>

<style scoped>
/* ✅ Center Entire Page */
.design {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ✅ Center h2 Title */
h2 {
  text-align: center;
  width: 100%;
}

/* ✅ Grid Layout */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
  text-align: center;
  padding: var(--space-4);
}

/* ✅ Force Spacing Tokens to 1 Column on Mobile */
.spacing-mobile {
  grid-template-columns: 1fr;
}

/* ✅ Token Item */
.token-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ✅ Token Header */
.token-header {
  background: var(--ui-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  text-align: center;
}

/* ✅ Shadow Blocks */
.shadow-block {
  width: 100%;
  max-width: 140px;
  height: 100px;
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border-muted);
}

/* ✅ Opacity Blocks */
.opacity-block {
  background: var(--ui-primary);
}

/* ✅ Border Radius Blocks */
.radius-block {
  background: var(--ui-primary);
}

/* ✅ Spacing Blocks */
.spacing-block {
  background: var(--ui-primary);
  width: 100%;
}

/* ✅ Responsive Adjustments */
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