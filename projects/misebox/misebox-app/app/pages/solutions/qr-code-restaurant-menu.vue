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

      <ClientOnly>
        <GoQrFoodMenuPlugin />

        <template #fallback>
          <UCard variant="subtle">
            <div class="fx-plugin-surface__skeleton">
              <USkeleton class="h-5 w-2/3" />
              <USkeleton class="h-32 w-full" />
              <USkeleton class="h-10 w-full" />
            </div>
          </UCard>
        </template>
      </ClientOnly>

      <section class="space-y-2">
        <h2 class="text-lg font-semibold text-highlighted">
          When to use Misebox next
        </h2>
        <p class="text-sm leading-6 text-muted">
          Use this quick plugin when the menu is just a finished file. Move into Misebox when the restaurant
          wants editable sections, dishes, prices, allergens, translations, prep, suppliers, or ordering later.
        </p>
      </section>
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

useSeoMeta({
  title: 'QR code restaurant menu',
  ogTitle: 'QR code restaurant menu',
  twitterTitle: 'QR code restaurant menu',
  description: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
  ogDescription: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
  twitterDescription: 'A simple public menu page for restaurants that want a QR menu before they need the full Misebox workflow.',
})
</script>
