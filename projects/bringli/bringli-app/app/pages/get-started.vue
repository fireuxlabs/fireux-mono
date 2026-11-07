<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section>
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
          <div class="fx-card__actions">
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
        <UCard>
          <p class="fx-type-label">
            {{ appMeta.getStarted.snapshotTitle }}
          </p>
          <ul class="fx-list-stack">
            <li v-for="tick in appMeta.getStarted.snapshotTicks" :key="tick">
              <UIcon name="i-lucide-check" /><span>{{ tick }}</span>
            </li>
          </ul>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <div class="pagebody">
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
        <UPageGrid>
          <UCard as="article" v-for="step in steps" :key="step.title">
            <p class="fx-type-label">{{ step.badge }}</p>
            <h3 class="fx-type-card-title">{{ step.title }}</h3>
            <p class="fx-type-caption">{{ step.copy }}</p>
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

const steps = appMeta.getStarted.steps
</script>
