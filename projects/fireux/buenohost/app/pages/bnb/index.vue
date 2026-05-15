<template>
  <section class="max-w-2xl space-y-8" aria-labelledby="bnb-title">
    <NuxtLink to="/" class="inline-flex items-center gap-2 text-sm font-semibold text-primary">
      <Icon name="i-lucide-arrow-left" class="size-4" />
      BuenoHost
    </NuxtLink>

    <div class="space-y-3">
      <p class="text-sm font-semibold uppercase text-primary">
        BNB
      </p>
      <h1 id="bnb-title" class="text-4xl font-semibold tracking-normal text-highlighted sm:text-5xl">
        BNB guest guides
      </h1>
      <p class="text-base leading-7 text-muted">
        Guest information pages for BNB and holiday apartment hosts.
      </p>
    </div>

    <UCard v-for="guide in bnbGuides" :key="guide.slug">
      <UButton
        :to="`/bnb/${guide.slug}`"
        icon="i-lucide-house"
        size="xl"
        color="primary"
        block
      >
        {{ guide.title }}
      </UButton>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { bnbGuides } from '../../content/bnbGuides'

definePageMeta({
  layout: 'bnb',
})

useSeoMeta({
  title: 'BNB · BuenoHost',
  description: 'Guest information pages for BNB and holiday apartment hosts.',
})
</script>
