<template>
  <UPage class="public-index">
    <header
      class="public-index__hero"
      :class="{ 'public-index__hero--background': $slots.background }"
    >
      <div v-if="$slots.background" class="public-index__hero-background">
        <slot name="background" />
      </div>

      <div class="public-index__hero-copy">
        <p class="public-index__eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p>{{ description }}</p>

        <div v-if="$slots.actions" class="public-index__hero-actions">
          <slot name="actions" />
        </div>
      </div>

      <div v-if="$slots.hero" class="public-index__hero-content">
        <slot name="hero" />
      </div>

      <div v-else class="public-index__hero-mark" aria-hidden="true">
        <UIcon :name="icon" />
      </div>
    </header>

    <UPageBody class="public-index__body">
      <slot />

      <section v-if="$slots.secondary" class="public-index__secondary">
        <p v-if="secondaryLabel" class="public-index__secondary-label">
          {{ secondaryLabel }}
        </p>
        <slot name="secondary" />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
defineOptions({ name: 'PublicIndexSurface' })

withDefaults(defineProps<{
  description: string
  eyebrow?: string
  icon: string
  secondaryLabel?: string
  title: string
}>(), {
  eyebrow: 'Discover',
  secondaryLabel: '',
})
</script>

<style scoped>
.public-index__hero {
  align-items: end;
  background:
    radial-gradient(
      circle at 85% 18%,
      color-mix(in srgb, var(--ui-primary) 22%, transparent),
      transparent 34%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg)) 0%,
      var(--ui-bg) 68%
    );
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 16));
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: clamp(
    calc(var(--spacing) * 68),
    38vw,
    calc(var(--spacing) * 100)
  );
  overflow: hidden;
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20));
  position: relative;
}

.public-index__hero-background {
  inset: 0;
  overflow: hidden;
  position: absolute;
  z-index: 0;
}

.public-index__hero--background::before {
  background:
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--ui-bg) 98%, transparent) 0%,
      color-mix(in srgb, var(--ui-bg) 88%, transparent) 40%,
      color-mix(in srgb, var(--ui-bg) 34%, transparent) 72%,
      color-mix(in srgb, var(--ui-bg) 16%, transparent) 100%
    ),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--ui-bg) 46%, transparent),
      transparent 48%
    );
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 1;
}

.public-index__hero::after {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 15%, transparent);
  border-radius: 9999px;
  bottom: calc(var(--spacing) * -32);
  content: '';
  height: calc(var(--spacing) * 88);
  position: absolute;
  right: calc(var(--spacing) * -20);
  width: calc(var(--spacing) * 88);
}

.public-index__hero-copy {
  max-width: calc(var(--spacing) * 172);
  position: relative;
  z-index: 1;
}

.public-index__eyebrow,
.public-index__secondary-label {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.public-index__eyebrow {
  margin: 0 0 calc(var(--spacing) * 3);
}

.public-index__hero h1 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-5xl), 9vw, calc(var(--text-5xl) * 2));
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  margin: 0;
}

.public-index__hero-copy > p:last-child {
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2vw, var(--text-xl));
  line-height: var(--leading-relaxed);
  margin: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 8)) 0 0;
  max-width: calc(var(--spacing) * 144);
}

.public-index__hero-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  margin-top: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 10));
}

.public-index__hero-content {
  max-width: calc(var(--spacing) * 94);
  position: relative;
  width: min(32vw, calc(var(--spacing) * 94));
  z-index: 1;
}

.public-index__hero-mark {
  align-items: center;
  backdrop-filter: blur(calc(var(--spacing) * 3));
  background: color-mix(in srgb, var(--ui-bg) 80%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 22%, var(--ui-border));
  border-radius: 9999px;
  color: var(--ui-primary);
  display: flex;
  font-size: clamp(var(--text-3xl), 5vw, var(--text-5xl));
  height: clamp(calc(var(--spacing) * 18), 11vw, calc(var(--spacing) * 28));
  justify-content: center;
  position: relative;
  width: clamp(calc(var(--spacing) * 18), 11vw, calc(var(--spacing) * 28));
  z-index: 1;
}

.public-index__body {
  display: grid;
  gap: clamp(calc(var(--spacing) * 14), 8vw, calc(var(--spacing) * 28));
  padding-bottom: clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 22));
  padding-top: clamp(calc(var(--spacing) * 12), 7vw, calc(var(--spacing) * 22));
}

.public-index__secondary {
  border-top: 1px solid var(--ui-border);
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding-top: clamp(calc(var(--spacing) * 8), 4vw, calc(var(--spacing) * 12));
}

.public-index__secondary-label {
  margin: 0;
}

@media (max-width: 40rem) {
  .public-index__hero {
    align-items: start;
    grid-template-columns: minmax(0, 1fr);
    min-height: calc(var(--spacing) * 96);
  }

  .public-index__hero-mark {
    justify-self: end;
  }

  .public-index__hero-content {
    max-width: none;
    width: 100%;
  }

  .public-index__hero--background::before {
    background:
      linear-gradient(
        180deg,
        color-mix(in srgb, var(--ui-bg) 94%, transparent) 0%,
        color-mix(in srgb, var(--ui-bg) 74%, transparent) 55%,
        color-mix(in srgb, var(--ui-bg) 92%, transparent) 100%
      ),
      linear-gradient(
        90deg,
        color-mix(in srgb, var(--ui-bg) 88%, transparent),
        color-mix(in srgb, var(--ui-bg) 34%, transparent)
      );
  }
}
</style>
