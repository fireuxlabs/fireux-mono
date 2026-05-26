<template>
  <PublicSimplePage
    title="QR code restaurant menu"
    description="A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow."
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-6">
      <section class="space-y-3">
        <UBadge color="primary" variant="soft">
          Very easy
        </UBadge>
        <p class="text-base leading-7 text-muted">
          This is the simplest hospitality version: no ordering, no translation, no dish setup.
          Start with a public menu page, then move into richer Misebox workflows when the venue needs
          editable sections, dishes, prices, allergens, translations, prep, suppliers, or ordering later.
        </p>
      </section>

      <UCard variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            Roadmap
          </h2>
        </template>
        <p class="text-sm leading-6 text-muted">
          This page is reserved for the hospitality-specific QR menu path. The first useful version should
          create or connect to a public menu, then make it easy to add restaurant identity and richer Misebox
          menu features over time.
        </p>
      </UCard>
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

const reservedDocumentSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'blog',
  'console',
  'dashboard',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'solutions',
  'terms',
]

useSeoMeta({
  title: 'QR code restaurant menu',
  ogTitle: 'QR code restaurant menu',
  twitterTitle: 'QR code restaurant menu',
  description: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
  ogDescription: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
  twitterDescription: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
})
</script>
