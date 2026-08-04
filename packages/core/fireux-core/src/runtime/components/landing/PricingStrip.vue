<template>
  <section
    class="landing-pricing-strip"
    :aria-label="ariaLabel"
    data-landing-reveal="up"
  >
    <ul class="landing-pricing-strip__plans" :aria-label="ariaLabel">
      <li v-for="plan in plans" :key="plan.id">
        <NuxtLink
          :to="plan.to || to || '/pricing'"
          class="landing-pricing-strip__plan"
          data-landing-pricing-plan
        >
          <span class="landing-pricing-strip__summary">
            <strong>{{ plan.title }}</strong>
            <span class="landing-pricing-strip__price">
              {{ plan.price }}<small v-if="plan.billingCycle">{{ plan.billingCycle }}</small>
            </span>
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </span>
          <small
            class="landing-pricing-strip__description"
            data-landing-pricing-detail
          >
            {{ plan.description }}
          </small>
          <ul
            class="landing-pricing-strip__features"
            data-landing-pricing-detail
          >
            <li v-for="feature in plan.features" :key="feature">
              <UIcon name="i-lucide-check" aria-hidden="true" />
              <span>{{ feature }}</span>
            </li>
          </ul>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { LandingPricingPlan } from '../../../types/landing-product'

defineProps<{
  ariaLabel: string
  plans: readonly LandingPricingPlan[]
  to?: string
}>()
</script>

<style scoped>
.landing-pricing-strip {
  position: sticky;
  z-index: 35;
  top: var(--ui-header-height, 4rem);
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: color-mix(in srgb, var(--ui-bg-elevated) 74%, transparent);
  backdrop-filter: blur(calc(var(--spacing) * 3));
  will-change: padding;
}

.landing-pricing-strip__plans,
.landing-pricing-strip__features {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.landing-pricing-strip__plans {
  gap: calc(var(--spacing) * 2);
}

.landing-pricing-strip__plan {
  display: grid;
  height: 100%;
  gap: calc(var(--spacing) * 2);
  align-content: start;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-elevated);
}

.landing-pricing-strip__summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: calc(var(--spacing) * 3);
  align-items: center;
}

.landing-pricing-strip__summary strong,
.landing-pricing-strip__price {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.landing-pricing-strip__price,
.landing-pricing-strip__price small {
  white-space: nowrap;
}

.landing-pricing-strip__price small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.landing-pricing-strip__summary svg,
.landing-pricing-strip__features svg {
  color: var(--ui-primary);
}

.landing-pricing-strip__description,
.landing-pricing-strip__features {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

[data-landing-pricing-detail] {
  overflow: hidden;
  will-change: height, opacity;
}

.landing-pricing-strip__features {
  gap: calc(var(--spacing) * 1.5);
}

.landing-pricing-strip__features li {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: flex-start;
}

.landing-pricing-strip__features svg {
  width: calc(var(--spacing) * 3.5);
  height: calc(var(--spacing) * 3.5);
  flex: 0 0 auto;
}

@media (min-width: 40rem) {
  .landing-pricing-strip__plans {
    grid-template-columns: repeat(auto-fit, minmax(min(13rem, 100%), 1fr));
  }

  .landing-pricing-strip__summary > svg {
    display: none;
  }
}
</style>
