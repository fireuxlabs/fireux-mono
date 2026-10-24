<template>
  <section
    class="landing-product-entry-paths"
    :class="{
      'landing-product-entry-paths--hero-strip': variant === 'hero-strip',
    }"
    :aria-labelledby="content.sectionId"
    data-landing-reveal="up"
  >
    <header class="landing-product-entry-paths__heading">
      <p class="fx-type-headline">{{ content.eyebrow }}</p>
      <h2
        :id="content.sectionId"
        :class="
          variant === 'hero-strip'
            ? 'fx-type-card-title'
            : 'fx-type-section-title'
        "
      >
        {{ content.title }}
      </h2>
      <p
        v-if="content.description && variant !== 'hero-strip'"
        class="fx-type-body"
      >
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
          :description="
            variant === 'hero-strip' ? undefined : path.description
          "
          :icon="
            path.kind === 'start' ? 'i-lucide-rocket' : 'i-lucide-network'
          "
          :to="path.action.to"
          variant="subtle"
          class="landing-product-entry-paths__card"
          :ui="
            variant === 'hero-strip'
              ? {
                  container: 'p-3 sm:p-3',
                  wrapper: 'flex-row items-center gap-x-3 gap-y-0',
                  leading: 'mb-0',
                  body: 'min-w-0',
                  footer: 'pt-0 mt-0 ml-auto',
                }
              : undefined
          "
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
import type { LandingProductEntryContent } from './product.types'

defineProps<{
  content: LandingProductEntryContent
  variant?: 'section' | 'hero-strip'
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

.landing-product-entry-paths--hero-strip {
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: color-mix(in srgb, var(--ui-bg-elevated) 74%, transparent);
  backdrop-filter: blur(calc(var(--spacing) * 3));
}

.landing-product-entry-paths--hero-strip
  .landing-product-entry-paths__heading {
  gap: var(--spacing);
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

  .landing-product-entry-paths--hero-strip {
    grid-template-columns: minmax(13rem, 0.6fr) minmax(0, 1.4fr);
    gap: calc(var(--spacing) * 4);
    align-items: center;
    padding: calc(var(--spacing) * 3);
  }
}
</style>
