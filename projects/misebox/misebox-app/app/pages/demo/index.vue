<!-- Concurrent edit — 2026-07-22 12:41 CEST — Product Demo app pass: introduce the public Misebox demonstration index. -->
<!-- Concurrent edit — 2026-07-22 13:11 CEST — Demo Kitchen identity pass: make Misebox Restaurant the default showroom path and Deanos the burger contrast. -->
<!-- Concurrent edit — 2026-07-22 14:20 CEST — Demo quick-link pass: expose the showroom in landing and default footer navigation. -->
<!-- Concurrent edit — 2026-07-23 09:32 CEST — Demo entry popup: open the Kiosk portrait preview in place instead of segueing to its route. -->
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
          Explore three fictional restaurants through the same Menu, Kiosk and
          Kitchen Order components used by Misebox. Everything here is local,
          deterministic and safe to reset.
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
        <UButton
          to="/demo/service"
          color="neutral"
          variant="soft"
          size="xl"
          icon="i-lucide-chef-hat"
        >
          Run Deanos Smash Burger
        </UButton>
      </div>

      <div v-if="productDemo" class="product-demo-index__world">
        <span>
          <UIcon name="i-lucide-store" aria-hidden="true" />
          Featured Demo Kitchens
        </span>
        <strong>{{ productDemo.menu.kitchenName }}</strong>
        <small>
          Default Demo Kitchen · Guest Menu & Kiosk ·
          {{ productDemo.menu.placeLabel }}
        </small>
        <strong>{{ productDemo.service.kitchenName }}</strong>
        <small>Smash Burger Kitchen · Kitchen service</small>
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

    <section class="product-demo-index__experiences" aria-label="Product demonstrations">
      <div class="product-demo-index__grid">
        <component
          v-for="experience in experiences"
          :key="experience.to"
          :is="experience.to === '/demo/kiosk' ? 'button' : NuxtLink"
          :to="experience.to === '/demo/kiosk' ? undefined : experience.to"
          :type="experience.to === '/demo/kiosk' ? 'button' : undefined"
          class="product-demo-index__link"
          @click="handleExperienceClick(experience.to)"
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
        </component>
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

    <MiseboxShowcaseKioskPreview
      v-if="productDemo"
      v-model:open="kioskPreviewOpen"
      v-model:kitchen-id="kioskPreviewKitchenId"
      :kitchens="productDemo.kiosk.kitchens"
    />
  </main>
</template>

<script setup lang="ts">
const {
  data: productDemo,
  error,
  experiences,
  refresh,
} = await useMiseboxProductDemo()

const kioskPreviewOpen = ref(false)
const kioskPreviewKitchenId = ref(productDemo.value?.kiosk.defaultId || '')
const NuxtLink = resolveComponent('NuxtLink')

function handleExperienceClick(to: string) {
  if (to !== '/demo/kiosk')
    return

  kioskPreviewOpen.value = true
}

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
    'Explore Misebox guest menus, touch-first Kiosk ordering and the Kitchen Order service board in a safe interactive demo.',
})
</script>

<style scoped src="./demo-index.css"></style>
