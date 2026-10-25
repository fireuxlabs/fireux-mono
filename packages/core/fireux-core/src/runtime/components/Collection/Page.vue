<template>
  <UPage class="entity-collection-page">
    <header
      class="entity-collection-page__hero"
      :class="{ 'entity-collection-page__hero--background': $slots.background }"
    >
      <div
        v-if="$slots.background"
        class="entity-collection-page__hero-background"
      >
        <slot name="background" />
      </div>

      <div class="entity-collection-page__hero-copy">
        <p class="entity-collection-page__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>

        <div v-if="$slots.actions" class="entity-collection-page__hero-actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.hero" class="entity-collection-page__hero-content">
        <slot name="hero" />
      </div>

      <div v-else class="entity-collection-page__hero-mark" aria-hidden="true">
        <UIcon :name="icon" />
      </div>
    </header>

    <UPageBody class="entity-collection-page__body">
      <slot />

      <section
        v-if="$slots.secondary"
        class="entity-collection-page__secondary"
      >
        <p
          v-if="secondaryLabel"
          class="entity-collection-page__secondary-label"
        >
          {{ secondaryLabel }}
        </p>
        <slot name="secondary" />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineOptions({ name: 'FireCollectionPage' })

withDefaults(
  defineProps<{
    description: string
    eyebrow?: string
    icon: string
    secondaryLabel?: string
    title: string
  }>(),
  {
    eyebrow: 'Discover',
    secondaryLabel: '',
  }
)
</script>

<style scoped>
.entity-collection-page__hero {
  position: relative;
  display: grid;
  min-height: calc(var(--spacing) * 64);
  align-items: start;
  gap: calc(var(--spacing) * 8);
  padding: clamp(calc(var(--spacing) * 7), 7vw, calc(var(--spacing) * 12));
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
}

.entity-collection-page__hero-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.entity-collection-page__hero--background::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  content: '';
  pointer-events: none;
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
}

.entity-collection-page__hero-copy {
  position: relative;
  z-index: 1;
  max-width: calc(var(--spacing) * 172);
}

.entity-collection-page__eyebrow,
.entity-collection-page__secondary-label {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.entity-collection-page__eyebrow {
  margin: 0 0 calc(var(--spacing) * 3);
}

.entity-collection-page__hero h1 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 11vw, var(--text-6xl));
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  text-wrap: balance;
}

.entity-collection-page__hero-copy > p:last-child {
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2vw, var(--text-xl));
  line-height: var(--leading-relaxed);
  margin: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 8)) 0 0;
  max-width: calc(var(--spacing) * 144);
}

.entity-collection-page__hero-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  margin-top: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 10));
}

.entity-collection-page__hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: calc(var(--spacing) * 94);
}

.entity-collection-page__hero-mark {
  position: relative;
  z-index: 1;
  display: grid;
  width: calc(var(--spacing) * 18);
  height: calc(var(--spacing) * 18);
  justify-self: end;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  color: var(--ui-primary);
  font-size: var(--text-3xl);
}

.entity-collection-page__body {
  display: grid;
  gap: clamp(calc(var(--spacing) * 12), 6vw, calc(var(--spacing) * 20));
  padding-bottom: clamp(
    calc(var(--spacing) * 12),
    7vw,
    calc(var(--spacing) * 22)
  );
  padding-top: clamp(calc(var(--spacing) * 8), 4vw, calc(var(--spacing) * 14));
}

.entity-collection-page__secondary {
  border-top: 1px solid var(--ui-border);
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding-top: clamp(calc(var(--spacing) * 8), 4vw, calc(var(--spacing) * 12));
}

.entity-collection-page__secondary-label {
  margin: 0;
}

@media (min-width: 40rem) {
  .entity-collection-page__hero {
    min-height: clamp(
      calc(var(--spacing) * 56),
      24vw,
      calc(var(--spacing) * 72)
    );
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 16));
    padding: clamp(calc(var(--spacing) * 10), 6vw, calc(var(--spacing) * 16));
  }

  .entity-collection-page__hero-mark {
    width: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 28));
    height: clamp(calc(var(--spacing) * 20), 10vw, calc(var(--spacing) * 28));
    font-size: clamp(var(--text-3xl), 4vw, var(--text-5xl));
  }

  .entity-collection-page__hero-content {
    width: min(32vw, calc(var(--spacing) * 94));
  }

  .entity-collection-page__hero h1 {
    font-size: clamp(var(--text-5xl), 7vw, calc(var(--text-5xl) * 1.75));
  }
}
</style>
