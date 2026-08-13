<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-assets-branding">
      <template #header>
        <LayoutsConsoleNavbar title="Branding" />
      </template>

      <template #body>
        <div class="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="soft" icon="i-lucide-sparkles">
                App Brand Asset
              </UBadge>
              <UBadge color="warning" variant="soft">
                Draft
              </UBadge>
            </div>
            <h1 class="text-2xl font-semibold text-highlighted sm:text-3xl">
              Friiites serving packaging
            </h1>
            <p class="max-w-2xl text-sm text-muted sm:text-base">
              Reusable branded objects owned by the Friiites App. These assets can be
              combined with Dish photography without redrawing the packaging.
            </p>
          </div>

          <UCard>
            <template #header>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="font-semibold text-highlighted">Empty serving carton</div>
                  <p class="text-sm text-muted">The shared base for Classic and future Friiites Dishes.</p>
                </div>
                <code class="text-xs text-dimmed">packaging.serving_carton_empty</code>
              </div>
            </template>

            <div class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]">
              <div class="asset-preview overflow-hidden rounded-xl border border-default">
                <img
                  v-if="asset?.media.url"
                  :src="asset.media.url"
                  alt="Empty black Friiites cardboard serving carton"
                  class="mx-auto block h-auto w-full max-w-3xl object-contain"
                >
                <div v-else class="grid min-h-80 place-items-center p-8 text-sm text-muted">
                  Loading serving carton…
                </div>
              </div>

              <dl class="grid content-start gap-4 text-sm">
                <div>
                  <dt class="text-dimmed">Status</dt>
                  <dd class="font-medium text-highlighted">Draft visual proof</dd>
                </div>
                <div>
                  <dt class="text-dimmed">Artwork</dt>
                  <dd class="font-medium text-highlighted">Canonical FR + III + TES wordmark</dd>
                </div>
                <div>
                  <dt class="text-dimmed">Master</dt>
                  <dd class="font-medium text-highlighted">Repository source · transparent PNG</dd>
                </div>
                <div>
                  <dt class="text-dimmed">Runtime</dt>
                  <dd class="font-medium text-highlighted">
                    Stored {{ asset?.media.width || 0 }} × {{ asset?.media.height || 0 }} transparent WebP
                  </dd>
                </div>
                <div>
                  <dt class="text-dimmed">Storage object</dt>
                  <dd class="break-all font-mono text-xs text-highlighted">
                    {{ asset?.media.object_path || 'Loading…' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-dimmed">Next use</dt>
                  <dd class="font-medium text-highlighted">Classic Dish composition</dd>
                </div>
              </dl>
            </div>

            <template #footer>
              <p class="text-xs text-dimmed">
                The carton form is provisional. Production dimensions, material and print placement
                remain a future branded-consumable specification.
              </p>
            </template>
          </UCard>
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
type BrandAsset = {
  id: string
  role: string
  name: string
  status: string
  media: {
    url: string
    object_path: string
    content_type: string
    width: number
    height: number
    has_alpha: boolean
  }
}

const { data: asset } = await useFetch<BrandAsset>(
  '/api/internal/app/brand-assets/serving-carton'
)

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'console-kitchen-assets-branding',
    label: 'Branding',
    icon: 'i-lucide-package',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
})
</script>

<style scoped>
.asset-preview {
  background-color: #242321;
  background-image:
    linear-gradient(45deg, rgb(255 255 255 / 4%) 25%, transparent 25%),
    linear-gradient(-45deg, rgb(255 255 255 / 4%) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgb(255 255 255 / 4%) 75%),
    linear-gradient(-45deg, transparent 75%, rgb(255 255 255 / 4%) 75%);
  background-position: 0 0, 0 12px, 12px -12px, -12px 0;
  background-size: 24px 24px;
}
</style>
