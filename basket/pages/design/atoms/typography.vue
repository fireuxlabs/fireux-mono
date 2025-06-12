<!-- app/pages/design/atoms/typography.vue -->
<template>
  <div class="design">
    <UTabs :items="items" class="custom-tabs">
      <template #fontSizes>
        <h2>Font Sizes</h2>
        <div class="grid">
          <div v-for="size in fontSizes" :key="size.class" class="typo-item" :class="size.class">
            <p>{{ size.label }}</p>
            <p class="class-name">{{ size.class }}</p>
          </div>
        </div>
      </template>

      <template #fontWeights>
        <h2>Font Weights</h2>
        <div class="grid">
          <div v-for="weight in fontWeights" :key="weight.class" class="typo-item" :class="weight.class">
            <p>{{ weight.label }}</p>
            <p class="class-name">{{ weight.class }}</p>
          </div>
        </div>
      </template>

      <template #lineHeights>
        <h2>Line Heights</h2>
        <div class="grid">
          <div v-for="line in lineHeights" :key="line.class" class="typo-item" :class="line.class">
            <p>{{ line.label }}</p>
            <p class="class-name">{{ line.class }}</p>
          </div>
        </div>
      </template>

      <template #tracking>
        <h2>Tracking</h2>
        <div class="grid">
          <div v-for="track in trackingTokens" :key="track.class" class="typo-item" :class="track.class">
            <p>{{ track.label }}</p>
            <p class="class-name">{{ track.class }}</p>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<script setup>
definePageMeta({ layout: "design" });

const items = [
  { icon: "i-lucide-type", slot: "fontSizes" },
  { icon: "i-lucide-bold", slot: "fontWeights" },
  { icon: "i-lucide-ruler", slot: "lineHeights" },
  { icon: "i-lucide-letter-spacing", slot: "tracking" }
];

const fontSizes = [
  { label: "Text XS", class: "text-xs" },
  { label: "Text SM", class: "text-sm" },
  { label: "Text BASE", class: "text-base" },
  { label: "Text LG", class: "text-lg" },
  { label: "Text XL", class: "text-xl" },
  { label: "Text 2XL", class: "text-2xl" },
  { label: "Text 3XL", class: "text-3xl" },
  { label: "Text 4XL", class: "text-4xl" },
  { label: "Text 5XL", class: "text-5xl" }
];

const fontWeights = [
  { label: "Font Thin", class: "font-thin" },
  { label: "Font ExtraLight", class: "font-extralight" },
  { label: "Font Light", class: "font-light" },
  { label: "Font Normal", class: "font-normal" },
  { label: "Font Medium", class: "font-medium" },
  { label: "Font SemiBold", class: "font-semibold" },
  { label: "Font Bold", class: "font-bold" },
  { label: "Font ExtraBold", class: "font-extrabold" },
  { label: "Font Black", class: "font-black" }
];

const lineHeights = [
  { label: "Leading None", class: "leading-none" },
  { label: "Leading Tight", class: "leading-tight" },
  { label: "Leading Snug", class: "leading-snug" },
  { label: "Leading Normal", class: "leading-normal" },
  { label: "Leading Relaxed", class: "leading-relaxed" },
  { label: "Leading Loose", class: "leading-loose" }
];

const trackingTokens = [
  { label: "Tracking Tighter", class: "tracking-tighter" },
  { label: "Tracking Tight", class: "tracking-tight" },
  { label: "Tracking Normal", class: "tracking-normal" },
  { label: "Tracking Wide", class: "tracking-wide" },
  { label: "Tracking Wider", class: "tracking-wider" },
  { label: "Tracking Widest", class: "tracking-widest" }
];
</script>

<style scoped>
/* ✅ Center Everything */
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
  margin-bottom: 1rem;
}

/* ✅ Mobile-Friendly Grid Layout */
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

/* ✅ Force a Single Column on Small Screens */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

/* ✅ Typography Item */
.typo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: var(--ui-bg-elevated);
  border-radius: 0.5rem;
  width: 100%;
}

/* ✅ Class Name Labels */
.class-name {
  font-size: 0.75rem;
  color: gray;
  margin-top: 0.5rem;
}

/* ✅ Font Sizes */
.text-xs { font-size: var(--text-xs); }
.text-sm { font-size: var(--text-sm); }
.text-base { font-size: var(--text-base); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }
.text-2xl { font-size: var(--text-2xl); }
.text-3xl { font-size: var(--text-3xl); }
.text-4xl { font-size: var(--text-4xl); }
.text-5xl { font-size: var(--text-5xl); }

/* ✅ Font Weights */
.font-thin { font-weight: var(--font-weight-thin); }
.font-extralight { font-weight: var(--font-weight-extralight); }
.font-light { font-weight: var(--font-weight-light); }
.font-normal { font-weight: var(--font-weight-normal); }
.font-medium { font-weight: var(--font-weight-medium); }
.font-semibold { font-weight: var(--font-weight-semibold); }
.font-bold { font-weight: var(--font-weight-bold); }
.font-extrabold { font-weight: var(--font-weight-extrabold); }
.font-black { font-weight: var(--font-weight-black); }

/* ✅ Line Heights */
.leading-none { line-height: var(--text-xs--line-height); }
.leading-tight { line-height: var(--leading-tight); }
.leading-snug { line-height: var(--leading-snug); }
.leading-normal { line-height: var(--leading-normal); }
.leading-relaxed { line-height: var(--leading-relaxed); }
.leading-loose { line-height: var(--leading-loose); }

/* ✅ Tracking */
.tracking-tighter { letter-spacing: var(--tracking-tighter); }
.tracking-tight { letter-spacing: var(--tracking-tight); }
.tracking-normal { letter-spacing: var(--tracking-normal); }
.tracking-wide { letter-spacing: var(--tracking-wide); }
.tracking-wider { letter-spacing: var(--tracking-wider); }
.tracking-widest { letter-spacing: var(--tracking-widest); }
</style>