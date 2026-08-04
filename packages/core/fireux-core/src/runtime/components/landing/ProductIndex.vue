<template>
  <div
    ref="landingRoot"
    class="landing-product"
    :class="{
      'landing-product--full-hero': heroLayout === 'proof-wide',
      'landing-product--hero-onboarding': onboardingPlacement === 'hero',
      'landing-product--immersive': presentation === 'immersive',
      'landing-product--section-dwell': sectionDwell,
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
          v-if="content.hero.badge"
          data-landing-hero-part="badge"
          color="primary"
          variant="soft"
          size="lg"
          class="landing-product__hero-badge"
        >
          {{ content.hero.badge }}
        </UBadge>

        <div
          ref="heroHeading"
          class="landing-product__hero-heading"
          data-landing-hero-part="heading"
        >
          <p v-if="content.hero.kicker">{{ content.hero.kicker }}</p>
          <h1 id="landing-product-title">
            {{ content.hero.title }}<br />
            <span>
              <template v-if="Array.isArray(content.hero.accent)">
                <template
                  v-for="(line, index) in content.hero.accent"
                  :key="line"
                >
                  {{ line }}<br v-if="index < content.hero.accent.length - 1" />
                </template>
              </template>
              <template v-else>{{ content.hero.accent }}</template>
            </span>
          </h1>
        </div>

        <p
          class="landing-product__hero-description"
          data-landing-hero-part="description"
        >
          {{ content.hero.description }}
        </p>

        <div
          v-if="heroMode === 'full'"
          class="landing-product__hero-actions"
          data-landing-hero-part="actions"
        >
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
          data-landing-hero-part="quiet-action"
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
          data-landing-hero-part="trust"
        >
          <li v-for="item in content.hero.trustItems" :key="item">
            <UIcon name="i-lucide-check" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div
        ref="heroPreview"
        class="landing-product__hero-preview"
        data-landing-hero-part="preview"
      >
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

    <template v-for="region in regionOrder" :key="region">
      <div
        v-if="$slots[region]"
        class="landing-product__region"
        :class="`landing-product__${region}`"
        :data-landing-motion-stage="region"
      >
        <div class="landing-product__region-dwell">
          <slot :name="region" />
        </div>
        <div class="landing-product__region-dwell-spacer" aria-hidden="true" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import type { LandingProductIndexContent } from '../../../types/landing-product'
import { useLandingMotion } from '../../composables/fireux/motion/useLandingMotion'

type LandingProductRegion =
  | 'surfaces'
  | 'console'
  | 'specifics'
  | 'ecosystems'
  | 'apps'
  | 'tools'
  | 'solutions'
  | 'operations'

withDefaults(
  defineProps<{
    content: LandingProductIndexContent
    heroLayout?: 'balanced' | 'proof-wide'
    heroMode?: 'full' | 'copy-proof'
    onboardingPlacement?: 'section' | 'hero'
    presentation?: 'standard' | 'immersive'
    regionOrder?: readonly LandingProductRegion[]
    sectionDwell?: boolean
  }>(),
  {
    heroLayout: 'balanced',
    heroMode: 'full',
    onboardingPlacement: 'section',
    presentation: 'standard',
    regionOrder: () => [
      'surfaces',
      'console',
      'specifics',
      'ecosystems',
      'apps',
      'tools',
      'solutions',
      'operations',
    ],
    sectionDwell: true,
  }
)

const landingRoot = useTemplateRef<HTMLElement>('landingRoot')
const heroHeading = useTemplateRef<HTMLElement>('heroHeading')
const heroPreview = useTemplateRef<HTMLElement>('heroPreview')

let heroOverlapObserver: ResizeObserver | undefined

function syncHeroOverlap() {
  const heading = heroHeading.value
  const preview = heroPreview.value
  if (!heading || !preview) return

  const headingRect = heading.getBoundingClientRect()
  const previewRect = preview.getBoundingClientRect()
  const overlapWidth = Math.max(
    0,
    Math.min(headingRect.right, previewRect.right) -
      Math.max(headingRect.left, previewRect.left)
  )
  const overlapHeight = Math.max(
    0,
    Math.min(headingRect.bottom, previewRect.bottom) -
      Math.max(headingRect.top, previewRect.top)
  )
  const hasOverlap = overlapWidth > 0 && overlapHeight > 0
  const fallback = Math.min(128, Math.max(80, window.innerWidth * 0.07))
  const feather = Math.min(192, Math.max(112, window.innerWidth * 0.1))
  const blurWidth = hasOverlap ? overlapWidth + feather : fallback

  preview.style.setProperty(
    '--landing-hero-overlap-width',
    `${Math.ceil(blurWidth)}px`
  )
}

onMounted(async () => {
  await nextTick()
  syncHeroOverlap()
  heroOverlapObserver = new ResizeObserver(syncHeroOverlap)
  if (heroHeading.value) heroOverlapObserver.observe(heroHeading.value)
  if (heroPreview.value) heroOverlapObserver.observe(heroPreview.value)
  window.addEventListener('resize', syncHeroOverlap, { passive: true })
  void document.fonts?.ready.then(syncHeroOverlap)
})

onBeforeUnmount(() => {
  heroOverlapObserver?.disconnect()
  window.removeEventListener('resize', syncHeroOverlap)
})

useLandingMotion(landingRoot)
</script>

<style scoped src="./ProductIndex.css"></style>
