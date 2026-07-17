<template>
  <div class="menu-order-intro">
    <header class="menu-order-intro__identity">
      <p v-if="kitchenName" class="menu-order-intro__kitchen">
        {{ kitchenName }}
      </p>

      <h1 id="menu-order-title">
        {{ menuName }}
      </h1>

      <p v-if="description" class="menu-order-intro__description">
        {{ description }}
      </p>

      <p v-if="currencyCode" class="menu-order-intro__currency">
        Prices in {{ currencyCode }}
      </p>
    </header>

    <section class="menu-order-intro__mode" aria-labelledby="menu-order-mode-title">
      <span class="menu-order-intro__mode-icon" aria-hidden="true">
        <UIcon :name="contextIcon" />
      </span>

      <div class="menu-order-intro__mode-copy">
        <p class="menu-order-intro__eyebrow">
          {{ contextLabel }}
        </p>
        <h2 id="menu-order-mode-title">
          Collection ordering
        </h2>
        <p>{{ message }}</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  menuName: string
  description?: string
  kitchenName?: string
  currencyCode?: string
  contextLabel: string
  contextIcon: string
  message: string
}>(), {
  description: '',
  kitchenName: '',
  currencyCode: '',
})
</script>

<style scoped>
.menu-order-intro {
  display: grid;
  gap: clamp(2rem, 5vw, 3rem);
}

.menu-order-intro p,
.menu-order-intro h1,
.menu-order-intro h2 {
  margin: 0;
}

.menu-order-intro__identity {
  display: grid;
  justify-items: center;
  gap: 0.85rem;
  min-width: 0;
  text-align: center;
}

.menu-order-intro__kitchen,
.menu-order-intro__currency,
.menu-order-intro__eyebrow {
  color: var(--menu-muted);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.menu-order-intro__identity h1 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(2.35rem, 8vw, 5rem);
  letter-spacing: -0.04em;
  line-height: 1;
  overflow-wrap: anywhere;
}

.menu-order-intro__kitchen {
  max-width: 100%;
  overflow-wrap: anywhere;
}

.menu-order-intro__description {
  max-width: 42rem;
  color: var(--menu-muted);
  line-height: 1.6;
  white-space: pre-line;
}

.menu-order-intro__currency {
  letter-spacing: 0.06em;
}

.menu-order-intro__mode {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  width: min(100%, 40rem);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid color-mix(in srgb, var(--menu-secondary) 30%, transparent);
  border-radius: var(--menu-radius);
  background: color-mix(in srgb, var(--menu-secondary) 7%, var(--menu-bg));
  text-align: left;
}

.menu-order-intro__mode-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--menu-primary) 16%, var(--menu-bg));
  color: var(--menu-primary);
}

.menu-order-intro__mode-icon :deep(.iconify) {
  width: 1.35rem;
  height: 1.35rem;
}

.menu-order-intro__mode-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.menu-order-intro__mode h2 {
  color: var(--menu-title);
  font-family: var(--menu-title-font);
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  line-height: 1.15;
}

.menu-order-intro__mode-copy > p:last-child {
  color: var(--menu-muted);
  line-height: 1.55;
}

@media (max-width: 35rem) {
  .menu-order-intro__mode {
    grid-template-columns: 1fr;
  }
}
</style>
