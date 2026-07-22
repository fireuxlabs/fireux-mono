<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: introduce the public Misebox demonstration index. -->
<template>
  <main class="product-demo-index" data-misebox-product-demo="index">
    <section class="product-demo-index__hero">
      <UBadge color="primary" variant="soft" size="lg">
        Misebox Product Demo
      </UBadge>

      <div class="product-demo-index__intro">
        <p class="fx-type-headline">From guest choice to Kitchen handoff</p>
        <h1>See the restaurant system working.</h1>
        <p>
          Explore a coherent fictional service through the same Menu, Kiosk and
          Kitchen Order components used by Misebox. Everything here is local,
          deterministic and safe to reset.
        </p>
      </div>

      <div v-if="productDemo" class="product-demo-index__world">
        <span>
          <UIcon name="i-lucide-store" aria-hidden="true" />
          Featured Demo Kitchens
        </span>
        <strong>{{ productDemo.menu.kitchenName }}</strong>
        <small>Guest Menu & Kiosk · {{ productDemo.menu.placeLabel }}</small>
        <strong>{{ productDemo.service.kitchenName }}</strong>
        <small>Kitchen service</small>
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="The Product Demo could not be prepared"
        description="No live data was touched. Try loading the local Demo World again."
      >
        <template #actions>
          <UButton color="error" variant="soft" @click="refresh()">
            Try again
          </UButton>
        </template>
      </UAlert>
    </section>

    <section class="product-demo-index__experiences" aria-labelledby="demo-experiences-title">
      <div class="product-demo-index__section-heading">
        <p class="fx-type-headline">Choose a perspective</p>
        <h2 id="demo-experiences-title">Three parts of one service</h2>
      </div>

      <div class="product-demo-index__grid">
        <NuxtLink
          v-for="experience in experiences"
          :key="experience.to"
          :to="experience.to"
          class="product-demo-index__link"
        >
          <UCard class="product-demo-index__card" :ui="{ body: 'h-full' }">
            <div class="product-demo-index__card-body">
              <span
                class="product-demo-index__icon"
                :data-accent="experience.accent"
                aria-hidden="true"
              >
                <UIcon :name="experience.icon" />
              </span>

              <div>
                <p>{{ experience.eyebrow }}</p>
                <h3>{{ experience.title }}</h3>
              </div>

              <p>{{ experience.description }}</p>

              <ul>
                <li v-for="highlight in experience.highlights" :key="highlight">
                  {{ highlight }}
                </li>
              </ul>

              <span class="product-demo-index__open">
                Open demo
                <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
              </span>
            </div>
          </UCard>
        </NuxtLink>
      </div>
    </section>

    <aside class="product-demo-index__boundary">
      <UIcon name="i-lucide-shield-check" aria-hidden="true" />
      <div>
        <strong>A real interface over a fictional world</strong>
        <p>
          These demonstrations perform no Firestore writes, create no live
          Orders and never borrow a user’s Test Kitchen.
        </p>
      </div>
    </aside>
  </main>
</template>

<script setup lang="ts">
const {
  data: productDemo,
  error,
  experiences,
  refresh,
} = await useMiseboxProductDemo()

definePageMeta({
  layout: 'landing',
  name: 'MiseboxProductDemoIndexPage',
})

useSeoMeta({
  title: 'Interactive Product Demo · Misebox',
  description:
    'Explore Misebox guest menus, touch-first Kiosk ordering and the Kitchen Order service board in a safe interactive demo.',
})
</script>

<style scoped>
.product-demo-index {
  display: grid;
  gap: clamp(calc(var(--spacing) * 16), 8vw, calc(var(--spacing) * 28));
  padding: clamp(calc(var(--spacing) * 8), 6vw, calc(var(--spacing) * 20)) 0;
}

.product-demo-index__hero,
.product-demo-index__experiences {
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 3vw, calc(var(--spacing) * 10));
}

.product-demo-index__hero {
  max-width: 66rem;
}

.product-demo-index__intro {
  display: grid;
  gap: calc(var(--spacing) * 4);
}

.product-demo-index__intro p,
.product-demo-index__intro h1,
.product-demo-index__section-heading p,
.product-demo-index__section-heading h2,
.product-demo-index__boundary p {
  margin: 0;
}

.product-demo-index__intro h1 {
  max-width: 12ch;
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-5xl), 8vw, 6.5rem);
  font-weight: 950;
  letter-spacing: -0.065em;
  line-height: 0.9;
  text-wrap: balance;
}

.product-demo-index__intro > p:last-child {
  max-width: 46rem;
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 2vw, 1.2rem);
  line-height: 1.75;
}

.product-demo-index__world {
  display: grid;
  width: min(100%, 32rem);
  gap: var(--spacing);
  padding: calc(var(--spacing) * 4) calc(var(--spacing) * 5);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.product-demo-index__world span {
  display: flex;
  gap: calc(var(--spacing) * 1.8);
  align-items: center;
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-demo-index__world strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
}

.product-demo-index__world small {
  color: var(--ui-text-muted);
}

.product-demo-index__section-heading {
  display: grid;
  gap: calc(var(--spacing) * 1.8);
}

.product-demo-index__section-heading h2 {
  color: var(--ui-text-highlighted);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 950;
  letter-spacing: -0.045em;
}

.product-demo-index__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);
}

.product-demo-index__link {
  min-width: 0;
  color: inherit;
  text-decoration: none;
}

.product-demo-index__card {
  height: 100%;
  transition: translate 160ms ease, box-shadow 160ms ease;
}

.product-demo-index__link:hover .product-demo-index__card,
.product-demo-index__link:focus-visible .product-demo-index__card {
  translate: 0 -0.25rem;
  box-shadow: 0 1.5rem 4rem rgb(15 23 42 / 12%);
}

.product-demo-index__link:focus-visible {
  border-radius: calc(var(--ui-radius) * 2);
  outline: 3px solid var(--ui-primary);
  outline-offset: 0.25rem;
}

.product-demo-index__card-body {
  display: grid;
  height: 100%;
  gap: calc(var(--spacing) * 5);
  align-content: start;
}

.product-demo-index__icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: calc(var(--ui-radius) * 2);
  background: color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg));
  color: var(--ui-primary);
  font-size: var(--text-2xl);
}

.product-demo-index__icon[data-accent='warning'] {
  background: color-mix(in srgb, var(--ui-warning) 15%, var(--ui-bg));
  color: var(--ui-warning);
}

.product-demo-index__icon[data-accent='success'] {
  background: color-mix(in srgb, var(--ui-success) 15%, var(--ui-bg));
  color: var(--ui-success);
}

.product-demo-index__card-body p,
.product-demo-index__card-body h3,
.product-demo-index__card-body ul {
  margin: 0;
}

.product-demo-index__card-body > div p {
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.product-demo-index__card-body h3 {
  margin-top: var(--spacing);
  color: var(--ui-text-highlighted);
  font-size: 1.45rem;
  font-weight: 950;
}

.product-demo-index__card-body > p,
.product-demo-index__card-body li {
  color: var(--ui-text-muted);
  line-height: 1.6;
}

.product-demo-index__card-body ul {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.6);
  padding: 0;
  list-style: none;
}

.product-demo-index__card-body li {
  padding: var(--spacing) calc(var(--spacing) * 2);
  border-radius: 9999px;
  background: var(--ui-bg-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.product-demo-index__open {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  margin-top: auto;
  padding-top: calc(var(--spacing) * 4);
  color: var(--ui-primary);
  font-weight: var(--font-weight-black);
}

.product-demo-index__boundary {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: calc(var(--spacing) * 4);
  align-items: start;
  padding: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 8));
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
}

.product-demo-index__boundary > :deep(.iconify) {
  width: 1.75rem;
  height: 1.75rem;
  color: var(--ui-success);
}

.product-demo-index__boundary strong {
  color: var(--ui-text-highlighted);
}

.product-demo-index__boundary p {
  margin-top: calc(var(--spacing) * 1.4);
  color: var(--ui-text-muted);
  line-height: 1.6;
}

@media (max-width: 58rem) {
  .product-demo-index__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
