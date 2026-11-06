<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer>
        <div class="pagebody">
          <p class="fx-type-headline">
            {{ appMeta.about.label }}
          </p>
          <h1 class="fx-type-display-title">
            {{ appMeta.about.tagline }}
          </h1>
          <p class="fx-type-description">
            {{ appMeta.about.description }}
          </p>
          <p class="fx-type-caption">
            {{ appMeta.about.supportingCopy }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/get-started" color="primary" size="lg">
              Get started
            </UButton>
            <UButton to="/products" color="neutral" variant="ghost" size="lg">
              Browse drops
            </UButton>
          </div>
        </div>

        <UCard>
          <p class="fx-type-label mb-4">Boundary</p>
          <ul class="space-y-3">
            <li
              v-for="tick in appMeta.about.ticks"
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
        <UCard
          as="article"
          v-for="item in appMeta.heroPanelItems"
          :key="item.title"
        >
          <UIcon :name="item.icon" />
          <h2 class="fx-type-card-heading mt-4">
            {{ item.title }}
          </h2>
          <p class="fx-type-caption mt-2">
            {{ item.description }}
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: appMeta.seoAbout.title,
  description: appMeta.seoAbout.description,
})
</script>
