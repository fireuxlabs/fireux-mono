<template>
  <PublicSimplePage
    :title="appMeta.getStarted.title"
    :description="appMeta.getStarted.description"
    :eyebrow="appMeta.getStarted.eyebrow"
    back-label="FireUX"
  >
    <section class="grid gap-4 sm:grid-cols-2">
      <UCard variant="subtle">
        <p class="text-sm text-muted">Setup</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.setupPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">Branding, configuration, and launch.</p>
      </UCard>

      <UCard variant="subtle">
        <p class="text-sm text-muted">Maintenance</p>
        <p class="mt-1 text-3xl font-semibold text-highlighted">
          {{ appMeta.getStarted.monthlyPrice }}
        </p>
        <p class="mt-2 text-sm text-muted">Hosting, updates, and maintenance.</p>
      </UCard>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">Included</h2>
      <ul class="space-y-2 text-muted">
        <li
          v-for="item in appMeta.getStarted.included"
          :key="item"
          class="flex items-start gap-2"
        >
          <UIcon name="i-lucide-check" class="mt-1 shrink-0 text-primary" />
          <span>{{ item }}</span>
        </li>
      </ul>
    </section>

    <section class="space-y-3">
      <h2 class="text-xl font-semibold text-highlighted">What we need</h2>
      <ul class="list-disc fx-list-stack text-muted">
        <li v-for="item in appMeta.getStarted.requirements" :key="item">
          {{ item }}
        </li>
      </ul>
    </section>

    <template #actions>
      <UButton :to="appMeta.getStarted.action.to" icon="i-lucide-mail" size="lg">
        {{ appMeta.getStarted.action.label }}
      </UButton>
      <UButton to="/apps" color="neutral" variant="soft" size="lg">
        View FireUX apps
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Ignition',
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
