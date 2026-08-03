<template>
  <div
    ref="landingRoot"
    class="landing-product"
    :class="{
      'landing-product--full-hero': heroLayout === 'proof-wide',
      'landing-product--hero-onboarding': onboardingPlacement === 'hero',
    }"
  >
    <section
      class="landing-product__hero"
      :class="{
        'landing-product__hero--proof-wide': heroLayout === 'proof-wide',
        'landing-product__hero--with-onboarding':
          onboardingPlacement === 'hero',
      }"
      aria-labelledby="landing-product-title"
    >
      <div class="landing-product__hero-copy">
        <UBadge
          color="primary"
          variant="soft"
          size="lg"
          class="landing-product__hero-badge"
        >
          {{ content.hero.badge }}
        </UBadge>

        <div class="landing-product__hero-heading">
          <p>{{ content.hero.kicker }}</p>
          <h1 id="landing-product-title">
            {{ content.hero.title }}<br />
            <span>{{ content.hero.accent }}</span>
          </h1>
        </div>

        <p class="landing-product__hero-description">
          {{ content.hero.description }}
        </p>

        <div v-if="heroMode === 'full'" class="landing-product__hero-actions">
          <UButton
            :to="content.hero.primaryAction.to"
            size="xl"
            :trailing-icon="
              content.hero.primaryAction.icon || 'i-lucide-arrow-right'
            "
          >
            {{ content.hero.primaryAction.label }}
          </UButton>
          <UButton
            :to="content.hero.secondaryAction.to"
            size="xl"
            color="neutral"
            variant="soft"
            :icon="content.hero.secondaryAction.icon"
          >
            {{ content.hero.secondaryAction.label }}
          </UButton>
        </div>

        <NuxtLink
          v-if="heroMode === 'full' && content.hero.quietAction"
          :to="content.hero.quietAction.to"
          class="landing-product__quiet-link"
        >
          {{ content.hero.quietAction.label }}
          <UIcon
            :name="content.hero.quietAction.icon || 'i-lucide-arrow-up-right'"
            aria-hidden="true"
          />
        </NuxtLink>

        <ul
          v-if="heroMode === 'full' && content.hero.trustItems.length"
          class="landing-product__trust-list"
          aria-label="Product principles"
        >
          <li v-for="item in content.hero.trustItems" :key="item">
            <UIcon name="i-lucide-check" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="landing-product__hero-preview">
        <slot name="hero-preview" />
      </div>

      <div
        v-if="onboardingPlacement === 'hero' && $slots.onboarding"
        class="landing-product__hero-onboarding"
      >
        <slot name="onboarding" />
      </div>
    </section>

    <slot v-if="onboardingPlacement === 'section'" name="onboarding" />

    <div
      v-if="$slots.console"
      class="landing-product__region landing-product__console"
    >
      <slot name="console" />
    </div>

    <div
      v-if="$slots.specifics"
      class="landing-product__region landing-product__specifics"
    >
      <slot name="specifics" />
    </div>

    <div
      v-if="$slots.ecosystems"
      class="landing-product__region landing-product__ecosystems"
    >
      <slot name="ecosystems" />
    </div>

    <div
      v-if="$slots.apps"
      class="landing-product__region landing-product__apps"
    >
      <slot name="apps" />
    </div>

    <div
      v-if="$slots.tools"
      class="landing-product__region landing-product__tools"
    >
      <slot name="tools" />
    </div>

    <div
      v-if="$slots.solutions"
      class="landing-product__region landing-product__solutions"
    >
      <slot name="solutions" />
    </div>

    <div
      v-if="$slots.operations"
      class="landing-product__region landing-product__operations"
    >
      <slot name="operations" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  useTemplateRef,
} from 'vue'
import type { LandingProductIndexContent } from '../../../types/landing-product'

type RevealDirection = 'up' | 'left' | 'right' | 'scale'

withDefaults(
  defineProps<{
    content: LandingProductIndexContent
    heroLayout?: 'balanced' | 'proof-wide'
    heroMode?: 'full' | 'copy-proof'
    onboardingPlacement?: 'section' | 'hero'
  }>(),
  {
    heroLayout: 'balanced',
    heroMode: 'full',
    onboardingPlacement: 'section',
  }
)

const activeRevealObservers = new Set<IntersectionObserver>()
const landingRoot = useTemplateRef<HTMLElement>('landingRoot')

function observeReveal(
  element: HTMLElement,
  direction: RevealDirection = 'up'
) {
  element.dataset.reveal = direction

  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    element.classList.add('is-reveal-visible')
    return
  }

  element.classList.add('is-reveal-ready')
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      element.classList.add('is-reveal-visible')
      observer.disconnect()
      activeRevealObservers.delete(observer)
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
  )

  activeRevealObservers.add(observer)
  requestAnimationFrame(() => {
    if (!element.isConnected) return
    element.classList.add('is-reveal-armed')
    observer.observe(element)
  })
}

onMounted(async () => {
  await nextTick()

  landingRoot.value
    ?.querySelectorAll<HTMLElement>('[data-landing-reveal]')
    .forEach((element) => {
      const direction = element.dataset.landingReveal as RevealDirection
      observeReveal(element, direction || 'up')
    })
})

onBeforeUnmount(() => {
  activeRevealObservers.forEach((observer) => observer.disconnect())
  activeRevealObservers.clear()
})
</script>

<style scoped src="./ProductIndex.css"></style>
