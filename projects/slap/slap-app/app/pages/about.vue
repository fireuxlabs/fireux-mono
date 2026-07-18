<template>
  <div class="fx-page-stack fx-page-stack--comfortable">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="fx-type-headline">
            {{ appMeta.about.label }}
          </p>
          <h1 class="fx-type-display-title">
            {{ appMeta.about.tagline }}
          </h1>
          <p class="fx-type-description text-toned">
            {{ appMeta.about.description }}
          </p>
          <p class="fx-type-caption text-toned">
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

        <div class="rounded-2xl border border-primary/20 bg-primary/10 p-6 text-sm text-primary shadow-sm dark:border-primary/25 dark:bg-primary/10 dark:text-primary">
          <p class="fx-type-label mb-4 text-primary">
            Boundary
          </p>
          <ul class="space-y-3">
            <li
              v-for="tick in appMeta.about.ticks"
              :key="tick"
              class="flex items-start gap-3"
            >
              <UIcon name="i-lucide-check" class="mt-0.5 text-primary" />
              <span>{{ tick }}</span>
            </li>
          </ul>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-3">
        <article
          v-for="item in appMeta.heroPanelItems"
          :key="item.title"
          class="rounded-2xl border border-default bg-default/80 p-6 shadow-sm"
        >
          <UIcon :name="item.icon" class="text-2xl text-primary" />
          <h2 class="fx-type-card-heading mt-4">
            {{ item.title }}
          </h2>
          <p class="fx-type-caption mt-2 text-toned">
            {{ item.description }}
          </p>
        </article>
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
