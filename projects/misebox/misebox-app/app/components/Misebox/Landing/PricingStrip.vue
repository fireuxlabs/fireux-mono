<template>
  <section
    class="misebox-pricing-strip"
    aria-label="Misebox pricing"
    data-landing-reveal="up"
  >
    <p class="misebox-pricing-strip__label">Monthly subscriptions</p>

    <ul class="misebox-pricing-strip__plans" aria-label="Misebox plans">
      <li v-for="plan in miseboxLandingPlans" :key="plan.id">
        <NuxtLink to="/pricing" class="misebox-pricing-strip__plan">
          <span class="misebox-pricing-strip__summary">
            <strong>{{ plan.shortTitle }}</strong>
            <span
              class="misebox-pricing-strip__price"
              :aria-label="`${plan.price} per month`"
            >
              {{ plan.price }}
            </span>
            <UIcon
              name="i-lucide-arrow-right"
              class="misebox-pricing-strip__arrow"
              aria-hidden="true"
            />
          </span>

          <small class="misebox-pricing-strip__description">
            {{ plan.description }}
          </small>

          <ul class="misebox-pricing-strip__features">
            <li v-for="feature in plan.landingFeatures" :key="feature">
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
import { miseboxLandingPlans } from '../../../content/pricing'
</script>

<style scoped>
.misebox-pricing-strip {
  position: relative;
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: color-mix(in srgb, var(--ui-bg-elevated) 74%, transparent);
  backdrop-filter: blur(calc(var(--spacing) * 3));
}

.misebox-pricing-strip__label {
  position: absolute;
  top: 0;
  left: calc(var(--spacing) * 3);
  margin: 0;
  padding-inline: var(--spacing);
  transform: translateY(-50%);
  background: var(--ui-bg);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.misebox-pricing-strip__plans {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.misebox-pricing-strip__plans > li {
  min-width: 0;
}

.misebox-pricing-strip__plan {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
  align-content: start;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-elevated);
}

.misebox-pricing-strip__summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  min-width: 0;
  gap: calc(var(--spacing) * 3);
  align-items: center;
}

.misebox-pricing-strip__summary strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
}

.misebox-pricing-strip__description {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.misebox-pricing-strip__price {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.misebox-pricing-strip__arrow {
  color: var(--ui-primary);
}

.misebox-pricing-strip__features {
  display: grid;
  gap: calc(var(--spacing) * 1.5);
  margin: calc(var(--spacing) * 1) 0 0;
  padding: 0;
  color: var(--ui-text-toned);
  font-size: var(--text-xs);
  list-style: none;
}

.misebox-pricing-strip__features li {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: flex-start;
}

.misebox-pricing-strip__features svg {
  width: calc(var(--spacing) * 3.5);
  height: calc(var(--spacing) * 3.5);
  flex: 0 0 auto;
  margin-top: 0.1rem;
  color: var(--ui-primary);
}

@media (min-width: 640px) {
  .misebox-pricing-strip__plans {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .misebox-pricing-strip__plan {
    height: 100%;
  }

  .misebox-pricing-strip__arrow {
    display: none;
  }
}
</style>
