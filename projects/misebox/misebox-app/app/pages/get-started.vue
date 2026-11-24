<!-- Concurrent edit — 2026-07-20 23:33 CEST — Final app CSS pass: semantic colors. -->
<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ getStartedContent.hero.eyebrow }}
          </p>
          <h1 class="fx-type-display-title">
            {{ getStartedContent.hero.title }}
          </h1>
          <p class="fx-type-description">
            {{ getStartedContent.hero.description }}
          </p>
          <div class="fx-card__actions">
            <UButton to="/workspace" color="primary" size="lg">
              {{ getStartedContent.hero.primaryAction.label }}
            </UButton>
            <UButton
              :to="getStartedContent.hero.secondaryAction.to"
              color="neutral"
              variant="ghost"
              size="lg"
            >
              {{ getStartedContent.hero.secondaryAction.label }}
            </UButton>
          </div>
        </div>
        <UCard>
          <p class="fx-type-label">
            {{ getStartedContent.snapshotTitle }}
          </p>
          <ul class="fx-list-stack">
            <li v-for="tick in getStartedContent.snapshotTicks" :key="tick">
              <UIcon name="i-lucide-check" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ getStartedContent.stepsHeading.eyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ getStartedContent.stepsHeading.title }}
          </h2>
          <p class="fx-type-body">
            {{ getStartedContent.stepsHeading.description }}
          </p>
        </div>
        <UPageGrid>
          <UCard as="article" v-for="step in steps" :key="step.title">
            <p class="fx-type-label">
              {{ step.badge }}
            </p>
            <h3 class="fx-type-card-title">
              {{ step.title }}
            </h3>
            <p class="fx-type-caption">
              {{ step.copy }}
            </p>
            <ul class="fx-list-stack">
              <li v-for="item in step.items" :key="item">
                <UIcon name="i-lucide-arrow-right" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </UCard>
        </UPageGrid>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div>
          <h2 class="fx-type-section-title">
            {{ getStartedContent.afterSetup.title }}
          </h2>
          <dl>
            <UCard
              v-for="faq in getStartedContent.afterSetup.faqs"
              :key="faq.title"
            >
              <dt class="fx-type-label">
                {{ faq.title }}
              </dt>
              <dd>
                {{ faq.copy }}
              </dd>
            </UCard>
          </dl>
        </div>
        <UCard>
          <p class="fx-type-label">
            {{ getStartedContent.afterSetup.card.eyebrow }}
          </p>
          <p class="fx-type-card-heading">
            {{ getStartedContent.afterSetup.card.title }}
          </p>
          <ul class="fx-list-stack">
            <li
              v-for="bullet in getStartedContent.afterSetup.card.bullets"
              :key="bullet"
            >
              <UIcon name="i-lucide-zap" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
          <UButton
            :to="getStartedContent.afterSetup.card.action.to"
            block
            color="primary"
          >
            {{ getStartedContent.afterSetup.card.action.label }}
          </UButton>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  buildPublicPageJsonLd,
  useSeo,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { getStartedContent } from '../content/get-started'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    menus: ['landing'],
  },
})

useSeo({
  title: getStartedContent.seo.title,
  description: getStartedContent.seo.description,
  path: '/get-started',
  image: '/img/app/cover.png',
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      description: context.description,
      image: context.image,
      title: context.title,
    }),
})

const steps = getStartedContent.steps
</script>
