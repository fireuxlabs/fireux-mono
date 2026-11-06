<!-- Concurrent edit — 2026-07-20 23:33 CEST — Final app CSS pass: semantic colors. -->
<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.getStarted.hero.eyebrow }}
          </p>
          <h1 class="fx-type-display-title">
            {{ appMeta.getStarted.hero.title }}
          </h1>
          <p class="fx-type-description">
            {{ appMeta.getStarted.hero.description }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton :to="workspaceEntryHref" color="primary" size="lg">
              {{ appMeta.getStarted.hero.primaryAction.label }}
            </UButton>
            <UButton
              :to="appMeta.getStarted.hero.secondaryAction.to"
              color="neutral"
              variant="ghost"
              size="lg"
            >
              {{ appMeta.getStarted.hero.secondaryAction.label }}
            </UButton>
          </div>
        </div>
        <UCard>
          <p class="fx-type-label mb-4">
            {{ appMeta.getStarted.snapshotTitle }}
          </p>
          <ul class="space-y-3">
            <li
              v-for="tick in appMeta.getStarted.snapshotTicks"
              :key="tick"
              class="flex items-start gap-3"
            >
              <UIcon name="i-lucide-check" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="mb-10 space-y-2">
          <p class="fx-type-headline">
            {{ appMeta.getStarted.stepsHeading.eyebrow }}
          </p>
          <h2 class="fx-type-section-title">
            {{ appMeta.getStarted.stepsHeading.title }}
          </h2>
          <p class="fx-type-body">
            {{ appMeta.getStarted.stepsHeading.description }}
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <UCard as="article" v-for="step in steps" :key="step.title">
            <p class="fx-type-label">
              {{ step.badge }}
            </p>
            <h3 class="fx-type-card-title mt-3">
              {{ step.title }}
            </h3>
            <p class="fx-type-caption mt-2">
              {{ step.copy }}
            </p>
            <ul class="mt-4 space-y-2">
              <li v-for="item in step.items" :key="item" class="flex gap-2">
                <UIcon name="i-lucide-arrow-right" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </UCard>
        </div>
      </UContainer>
    </section>

    <section class="bg-muted/80 py-16">
      <UContainer>
        <div>
          <h2 class="fx-type-section-title">
            {{ appMeta.getStarted.afterSetup.title }}
          </h2>
          <dl class="mt-8 space-y-6">
            <UCard
              v-for="faq in appMeta.getStarted.afterSetup.faqs"
              :key="faq.title"
            >
              <dt class="fx-type-label">
                {{ faq.title }}
              </dt>
              <dd class="mt-2">
                {{ faq.copy }}
              </dd>
            </UCard>
          </dl>
        </div>
        <UCard>
          <p class="fx-type-label">
            {{ appMeta.getStarted.afterSetup.card.eyebrow }}
          </p>
          <p class="fx-type-card-heading mt-3">
            {{ appMeta.getStarted.afterSetup.card.title }}
          </p>
          <ul class="mt-5 space-y-2">
            <li
              v-for="bullet in appMeta.getStarted.afterSetup.card.bullets"
              :key="bullet"
              class="flex gap-2"
            >
              <UIcon name="i-lucide-zap" />
              <span>{{ bullet }}</span>
            </li>
          </ul>
          <UButton
            :to="appMeta.getStarted.afterSetup.card.action.to"
            block
            color="primary"
          >
            {{ appMeta.getStarted.afterSetup.card.action.label }}
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
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { appMeta } from '../meta'

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
    layouts: ['landing'],
  },
})

useSeo({
  title: appMeta.seoGetStarted.title,
  description: appMeta.seoGetStarted.description,
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

const { workspaceEntryHref } = useWorkspaceEntryCta('kitchen')
const steps = appMeta.getStarted.steps
</script>
