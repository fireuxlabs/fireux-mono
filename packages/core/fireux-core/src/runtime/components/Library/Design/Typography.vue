<template>
  <div class="design">
    <UTabs :items="items" class="custom-tabs">
      <template #roles>
        <h2 class="fx-type-card-title">Semantic Roles</h2>
        <div class="role-grid">
          <div
            v-for="role in semanticRoles"
            :key="role.class"
            class="role-item"
          >
            <p :class="role.class">{{ role.sample }}</p>
            <code class="fx-type-code text-muted">{{ role.class }}</code>
          </div>
        </div>
      </template>

      <template #fontSizes>
        <h2 class="fx-type-card-title">Font Sizes</h2>
        <div class="grid">
          <div
            v-for="size in fontSizes"
            :key="size.class"
            class="typo-item"
            :class="size.class"
          >
            <p>{{ size.label }}</p>
            <p class="class-name">{{ size.class }}</p>
          </div>
        </div>
      </template>

      <template #fontWeights>
        <h2 class="fx-type-card-title">Font Weights</h2>
        <div class="grid">
          <div
            v-for="weight in fontWeights"
            :key="weight.class"
            class="typo-item"
            :class="weight.class"
          >
            <p>{{ weight.label }}</p>
            <p class="class-name">{{ weight.class }}</p>
          </div>
        </div>
      </template>

      <template #lineHeights>
        <h2 class="fx-type-card-title">Line Heights</h2>
        <div class="grid">
          <div
            v-for="line in lineHeights"
            :key="line.class"
            class="typo-item"
            :class="line.class"
          >
            <p>{{ line.label }}</p>
            <p class="class-name">{{ line.class }}</p>
          </div>
        </div>
      </template>

      <template #tracking>
        <h2 class="fx-type-card-title">Tracking</h2>
        <div class="grid">
          <div
            v-for="track in trackingTokens"
            :key="track.class"
            class="typo-item"
            :class="track.class"
          >
            <p>{{ track.label }}</p>
            <p class="class-name">{{ track.class }}</p>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">

const items = [
  { icon: 'i-lucide-book-type', label: 'Roles', slot: 'roles' },
  { icon: 'i-lucide-type', label: 'Sizes', slot: 'fontSizes' },
  { icon: 'i-lucide-bold', label: 'Weights', slot: 'fontWeights' },
  { icon: 'i-lucide-ruler', label: 'Line heights', slot: 'lineHeights' },
  { icon: 'i-lucide-letter-spacing', label: 'Tracking', slot: 'tracking' },
]

const semanticRoles = [
  { class: 'fx-type-headline', sample: 'Page or section headline' },
  { class: 'fx-type-display-title', sample: 'Landing display title' },
  { class: 'fx-type-page-title', sample: 'Page title' },
  { class: 'fx-type-section-title', sample: 'Section title' },
  { class: 'fx-type-section-display', sample: 'Marketing section display' },
  { class: 'fx-type-card-title', sample: 'Card title' },
  { class: 'fx-type-card-heading', sample: 'Large card heading' },
  { class: 'fx-type-description', sample: 'Page description copy' },
  { class: 'fx-type-body', sample: 'Body copy for general reading.' },
  { class: 'fx-type-caption', sample: 'Caption and supporting copy' },
  { class: 'fx-type-label', sample: 'Metadata label' },
  { class: 'fx-type-code', sample: 'const role = "code"' },
]

const fontSizes = [
  { label: 'Text XS', class: 'text-xs' },
  { label: 'Text SM', class: 'text-sm' },
  { label: 'Text BASE', class: 'text-base' },
  { label: 'Text LG', class: 'text-lg' },
  { label: 'Text XL', class: 'text-xl' },
  { label: 'Text 2XL', class: 'text-2xl' },
  { label: 'Text 3XL', class: 'text-3xl' },
  { label: 'Text 4XL', class: 'text-4xl' },
  { label: 'Text 5XL', class: 'text-5xl' },
]

const fontWeights = [
  { label: 'Font Thin', class: 'font-thin' },
  { label: 'Font ExtraLight', class: 'font-extralight' },
  { label: 'Font Light', class: 'font-light' },
  { label: 'Font Normal', class: 'font-normal' },
  { label: 'Font Medium', class: 'font-medium' },
  { label: 'Font SemiBold', class: 'font-semibold' },
  { label: 'Font Bold', class: 'font-bold' },
  { label: 'Font ExtraBold', class: 'font-extrabold' },
  { label: 'Font Black', class: 'font-black' },
]

const lineHeights = [
  { label: 'Leading None', class: 'leading-none' },
  { label: 'Leading Tight', class: 'leading-tight' },
  { label: 'Leading Snug', class: 'leading-snug' },
  { label: 'Leading Normal', class: 'leading-normal' },
  { label: 'Leading Relaxed', class: 'leading-relaxed' },
  { label: 'Leading Loose', class: 'leading-loose' },
]

const trackingTokens = [
  { label: 'Tracking Tighter', class: 'tracking-tighter' },
  { label: 'Tracking Tight', class: 'tracking-tight' },
  { label: 'Tracking Normal', class: 'tracking-normal' },
  { label: 'Tracking Wide', class: 'tracking-wide' },
  { label: 'Tracking Wider', class: 'tracking-wider' },
  { label: 'Tracking Widest', class: 'tracking-widest' },
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
  margin-bottom: calc(var(--spacing) * 4);
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 4);
}
.role-grid {
  display: grid;
  gap: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 4);
}
.role-item {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 4);
  border-bottom: 1px solid var(--ui-border);
}
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
.typo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: calc(var(--spacing) * 4);
  background: var(--ui-bg-elevated);
  border-radius: calc(var(--ui-radius) * 2);
  width: 100%;
}
.class-name {
  font-size: var(--text-xs);
  color: gray;
  margin-top: calc(var(--spacing) * 2);
}
</style>
