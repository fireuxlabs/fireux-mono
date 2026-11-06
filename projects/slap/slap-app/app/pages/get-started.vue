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
            <UButton
              :to="appMeta.getStarted.hero.primaryAction.to"
              color="primary"
              size="lg"
            >
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

        <div class="pagebody">
          <UCard
            as="article"
            v-for="step in appMeta.getStarted.steps"
            :key="step.title"
          >
            <p class="fx-type-label">
              {{ step.badge }}
            </p>
            <h2 class="fx-type-card-heading mt-2">
              {{ step.title }}
            </h2>
            <p class="fx-type-caption mt-2">
              {{ step.copy }}
            </p>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
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

useSeoMeta({
  title: appMeta.seoGetStarted.title,
  description: appMeta.seoGetStarted.description,
})
</script>
