<template>
  <section
    class="landing-product-catalogue"
    :aria-labelledby="content.sectionId"
    data-landing-reveal="up"
  >
    <div class="landing-product-catalogue__heading">
      <div>
        <p class="fx-type-headline">{{ content.eyebrow }}</p>
        <h2 :id="content.sectionId" class="fx-type-section-display">
          {{ content.title }}
        </h2>
      </div>

      <div v-if="content.description || content.action">
        <p v-if="content.description" class="fx-type-body">
          {{ content.description }}
        </p>
        <UButton
          v-if="content.action"
          :to="content.action.to"
          color="neutral"
          variant="soft"
          :trailing-icon="content.action.icon || 'i-lucide-arrow-right'"
        >
          {{ content.action.label }}
        </UButton>
      </div>
    </div>

    <ul class="landing-product-catalogue__grid">
      <li v-for="item in content.items" :key="item.id">
        <UPageCard
          :title="item.title"
          :description="item.description"
          :icon="item.icon || 'i-lucide-circle-dot'"
          :to="item.to"
          variant="subtle"
          class="landing-product-catalogue__card"
        >
          <template #footer>
            <span class="landing-product-catalogue__item-action">
              {{ item.action || 'Open' }}
              <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
            </span>
          </template>
        </UPageCard>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { LandingProductCatalogueContent } from './product.types'

defineProps<{
  content: LandingProductCatalogueContent
}>()
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product-catalogue {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 8);
  padding-block: calc(var(--spacing) * 10);
}

.landing-product-catalogue__heading {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.landing-product-catalogue__heading > div {
  display: grid;
  align-content: start;
  gap: calc(var(--spacing) * 3);
}

.landing-product-catalogue__heading :where(h2, p) {
  margin: 0;
}

.landing-product-catalogue__grid {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding: 0;
  list-style: none;
}

.landing-product-catalogue__grid > li {
  min-width: 0;
}

.landing-product-catalogue__card {
  height: 100%;
}

.landing-product-catalogue__item-action {
  display: inline-flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

@media (min-width: 640px) {
  .landing-product-catalogue {
    gap: calc(var(--spacing) * 12);
    padding-block: calc(var(--spacing) * 14);
  }

  .landing-product-catalogue__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 768px) {
  .landing-product-catalogue__heading {
    grid-template-columns: minmax(0, 1.25fr) minmax(18rem, 0.75fr);
  }
}

@media (min-width: 1024px) {
  .landing-product-catalogue__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
