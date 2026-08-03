<template>
  <section
    class="landing-product-proof"
    :class="{
      'landing-product-proof--reverse': reverse,
      'landing-product-proof--copy-emphasis': copyEmphasis,
    }"
    :aria-labelledby="sectionId"
  >
    <div
      class="landing-product-proof__surface"
      :data-landing-reveal="reverse ? 'right' : 'left'"
    >
      <slot />
    </div>

    <div
      class="landing-product-proof__copy"
      :data-landing-reveal="reverse ? 'left' : 'right'"
    >
      <p class="fx-type-headline">{{ eyebrow }}</p>
      <h2
        :id="sectionId"
        class="fx-type-section-display"
        :class="{ 'text-4xl sm:text-5xl': copyEmphasis }"
      >
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="fx-type-description"
        :class="{ 'text-xl': copyEmphasis }"
      >
        {{ description }}
      </p>

      <ul
        v-if="items?.length"
        class="landing-product-proof__items"
        :class="{ 'text-base sm:text-lg': copyEmphasis }"
        :aria-label="`${eyebrow} includes`"
      >
        <li v-for="item in items" :key="item">
          <UIcon name="i-lucide-check" aria-hidden="true" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <p v-if="supporting" class="fx-type-body">{{ supporting }}</p>

      <UButton
        v-if="action"
        :to="action.to"
        :size="copyEmphasis ? 'xl' : 'lg'"
        class="landing-product-proof__action"
        :trailing-icon="action.icon || 'i-lucide-arrow-right'"
      >
        {{ action.label }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { LandingProductAction } from '../../../types/landing-product'

withDefaults(
  defineProps<{
    sectionId: string
    eyebrow: string
    title: string
    description?: string
    supporting?: string
    items?: readonly string[]
    action?: LandingProductAction
    reverse?: boolean
    copyEmphasis?: boolean
  }>(),
  {
    items: () => [],
    reverse: false,
    copyEmphasis: false,
  }
)
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product-proof {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 8);
  align-items: center;
  padding-block: calc(var(--spacing) * 10);
}

.landing-product-proof__surface {
  min-width: 0;
}

.landing-product-proof__copy {
  display: grid;
  min-width: 0;
  max-width: 38rem;
  gap: calc(var(--spacing) * 4);
}

.landing-product-proof--copy-emphasis .landing-product-proof__copy {
  max-width: 44rem;
  gap: calc(var(--spacing) * 5);
}

.landing-product-proof__copy :where(h2, p) {
  margin: 0;
}

.landing-product-proof__items {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: 0;
  color: var(--ui-text);
  list-style: none;
}

.landing-product-proof__items li {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}

.landing-product-proof__items svg {
  flex: 0 0 auto;
  color: var(--ui-primary);
}

.landing-product-proof__action {
  justify-self: start;
}

@media (min-width: 640px) {
  .landing-product-proof {
    gap: calc(var(--spacing) * 12);
    padding-block: calc(var(--spacing) * 14);
  }

  .landing-product-proof__items {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .landing-product-proof {
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr);
    gap: calc(var(--spacing) * 16);
  }

  .landing-product-proof__copy {
    justify-self: end;
  }

  .landing-product-proof--copy-emphasis {
    grid-template-columns: minmax(0, 0.9fr) minmax(28rem, 1.1fr);
  }

  .landing-product-proof--reverse {
    grid-template-columns: minmax(22rem, 0.85fr) minmax(0, 1.15fr);
  }

  .landing-product-proof--reverse.landing-product-proof--copy-emphasis {
    grid-template-columns: minmax(28rem, 1.1fr) minmax(0, 0.9fr);
  }

  .landing-product-proof--reverse .landing-product-proof__surface {
    grid-column: 2;
    grid-row: 1;
  }

  .landing-product-proof--reverse .landing-product-proof__copy {
    grid-column: 1;
    grid-row: 1;
    justify-self: start;
  }
}
</style>
