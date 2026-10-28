<template>
  <main class="product-demo-index" data-misebox-product-demo="index">
    <section class="product-demo-index__hero">
      <UBadge color="primary" variant="soft" size="lg">
        Misebox Product Demo
      </UBadge>

      <div class="product-demo-index__intro">
        <p class="fx-type-headline">A guest view of Misebox</p>
        <h1>Explore Misebox’s guest menu.</h1>
        <p>
          Browse a fictional restaurant through the same guest Menu components
          used by Misebox. This read-only preview sends no orders and takes no
          payments.
        </p>
      </div>

      <div class="product-demo-index__actions">
        <UButton
          to="/demo/menu"
          color="primary"
          size="xl"
          trailing-icon="i-lucide-arrow-right"
        >
          Explore Misebox Restaurant
        </UButton>
      </div>

      <div v-if="productDemo" class="product-demo-index__world">
        <span>
          <UIcon name="i-lucide-store" aria-hidden="true" />
          Featured Demo Kitchen
        </span>
        <strong>{{ productDemo.menu.kitchenName }}</strong>
        <small>
          Guest Menu ·
          {{ productDemo.menu.placeLabel }}
        </small>
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

    <section
      class="product-demo-index__experiences"
      aria-label="Product demonstrations"
    >
      <div class="product-demo-index__grid">
        <NuxtLink
          v-for="experience in experiences"
          :key="experience.to"
          :to="experience.to"
          class="product-demo-index__link"
        >
          <UCard class="product-demo-index__card">
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
          This demonstration performs no Firestore writes and creates no live
          Orders. Its fictional records remain separate from your Workspace.
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
  nav: {
    key: 'demo',
    label: 'Demo',
    icon: 'i-lucide-monitor-play',
    order: 29,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})

useSeoMeta({
  title: 'Interactive Product Demo · Misebox',
  description:
    'Explore Misebox’s guest Menu through a read-only fictional restaurant demo.',
})
</script>

<style scoped src="./demo-index.css"></style>
