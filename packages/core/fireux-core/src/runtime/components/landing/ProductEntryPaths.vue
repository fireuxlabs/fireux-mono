<template>
  <section
    class="landing-product-entry-paths"
    :aria-labelledby="content.sectionId"
    data-landing-reveal="up"
  >
    <header class="landing-product-entry-paths__heading">
      <p class="fx-type-headline">{{ content.eyebrow }}</p>
      <h2 :id="content.sectionId" class="fx-type-section-title">
        {{ content.title }}
      </h2>
      <p v-if="content.description" class="fx-type-body">
        {{ content.description }}
      </p>
    </header>

    <ul
      class="landing-product-entry-paths__grid"
      :aria-label="`${content.title} choices`"
    >
      <li v-for="path in content.paths" :key="path.id">
        <UPageCard
          :title="path.title"
          :description="path.description"
          :icon="
            path.kind === 'start' ? 'i-lucide-rocket' : 'i-lucide-network'
          "
          :to="path.action.to"
          variant="subtle"
          class="landing-product-entry-paths__card"
          :data-entry-path="path.kind"
        >
          <template #footer>
            <span class="landing-product-entry-paths__card-action">
              {{ path.action.label }}
              <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
            </span>
          </template>
        </UPageCard>
      </li>
    </ul>

    <div v-if="content.tool" class="landing-product-entry-paths__tool">
      <div class="landing-product-entry-paths__tool-copy">
        <UIcon
          name="i-lucide-wrench"
          class="landing-product-entry-paths__tool-icon"
          aria-hidden="true"
        />
        <div>
          <h3 class="fx-type-card-title">{{ content.tool.title }}</h3>
          <p class="fx-type-caption">{{ content.tool.description }}</p>
        </div>
      </div>

      <UButton
        :to="content.tool.action.to"
        color="neutral"
        variant="soft"
        class="landing-product-entry-paths__tool-action"
        trailing-icon="i-lucide-arrow-up-right"
      >
        {{ content.tool.action.label }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingProductEntryContent } from '../../../types/landing-product'

defineProps<{
  content: LandingProductEntryContent
}>()
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product-entry-paths {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 6);
  padding-block: calc(var(--spacing) * 8);
}

.landing-product-entry-paths__heading {
  display: grid;
  max-width: 48rem;
  gap: calc(var(--spacing) * 2);
}

.landing-product-entry-paths__heading :where(h2, p),
.landing-product-entry-paths__tool-copy :where(h3, p) {
  margin: 0;
}

.landing-product-entry-paths__grid {
  display: grid;
  gap: calc(var(--spacing) * 4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.landing-product-entry-paths__grid > li {
  min-width: 0;
}

.landing-product-entry-paths__card {
  height: 100%;
}

.landing-product-entry-paths__card-action {
  display: inline-flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.landing-product-entry-paths__tool {
  display: grid;
  gap: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 5);
  border-top: 1px solid var(--ui-border);
}

.landing-product-entry-paths__tool-copy {
  display: flex;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  align-items: center;
}

.landing-product-entry-paths__tool-copy > div {
  display: grid;
  min-width: 0;
  gap: var(--spacing);
}

.landing-product-entry-paths__tool-icon {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
  flex: 0 0 auto;
  color: var(--ui-primary);
}

.landing-product-entry-paths__tool-action {
  justify-content: center;
  width: 100%;
}

@media (min-width: 640px) {
  .landing-product-entry-paths {
    gap: calc(var(--spacing) * 8);
    padding-block: calc(var(--spacing) * 12);
  }

  .landing-product-entry-paths__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-product-entry-paths__tool {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .landing-product-entry-paths__tool-action {
    width: auto;
  }
}
</style>
