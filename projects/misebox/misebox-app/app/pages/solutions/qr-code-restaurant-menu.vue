<template>
  <PublicSimplePage
    title="QR code restaurant menu"
    description="Upload a menu file and get a scannable Food Menu QR page powered by Go QR."
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
          Upload a public menu file, choose a short path, and get a QR page labelled Food Menu.
        </p>
      </section>

      <UCard variant="subtle">
        <template #header>
          <div>
            <h2 class="text-lg font-semibold text-highlighted">
              Create a food menu QR
            </h2>
            <p class="text-sm text-muted">
              Anonymous upload for one public menu file.
            </p>
          </div>
        </template>

        <ClientOnly>
          <PublicQrFileUploadTool
            endpoint="/api/go-qr/food-menu/create"
            upload-type="food-menu"
            upload-label="Drop your menu here"
            cta-label="Create food menu QR"
            loading-label="Creating menu QR..."
            safety-copy="Menu QR files are public. Anyone with the link or QR code can view the menu."
            upsell-copy="Your QR page will say Food Menu. Sign in later to add your restaurant logo."
            slug-label="Menu path"
            slug-validation-label="Menu path"
            slug-placeholder="my-restaurant-menu"
            min-height-class="min-h-64"
            success-title="Your menu QR is ready"
            open-target-label="Open menu"
            open-qr-label="Open QR page"
            :reserved-slugs="reservedDocumentSlugs"
          />

          <template #fallback>
            <div class="rounded-md border border-default bg-muted/20 p-6 text-sm text-muted">
              Loading menu QR tool...
            </div>
          </template>
        </ClientOnly>
      </UCard>

      <UCard variant="subtle">
        <template #header>
          <h2 class="text-lg font-semibold text-highlighted">
            When to use Misebox next
          </h2>
        </template>
        <p class="text-sm leading-6 text-muted">
          Use this quick tool when the menu is just a finished file. Move into Misebox when the restaurant
          wants editable sections, dishes, prices, allergens, translations, prep, suppliers, or ordering later.
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
  description: 'Upload a menu file and get a scannable Food Menu QR page powered by Go QR.',
  ogDescription: 'Upload a menu file and get a scannable Food Menu QR page powered by Go QR.',
  twitterDescription: 'Upload a menu file and get a scannable Food Menu QR page powered by Go QR.',
})
</script>
