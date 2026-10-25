<template>
  <div class="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
    <div class="space-y-2">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="primary" variant="soft" icon="i-lucide-sparkles">
          App Brand Asset
        </UBadge>
        <UBadge color="warning" variant="soft"> Draft </UBadge>
      </div>
      <h1 class="text-2xl font-semibold text-highlighted sm:text-3xl">
        Friiites serving packaging
      </h1>
      <p class="max-w-2xl text-sm text-muted sm:text-base">
        Reusable branded objects owned by the Friiites App. These assets can be
        combined with Dish photography without redrawing the packaging.
      </p>
    </div>

    <UCard v-for="brandObject in brandObjects" :key="brandObject.role">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="font-semibold text-highlighted">
              {{ brandObject.name }}
            </div>
            <p class="text-sm text-muted">{{ brandObject.description }}</p>
          </div>
          <code class="text-xs text-dimmed">{{ brandObject.role }}</code>
        </div>
      </template>

      <div
        class="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.7fr)]"
      >
        <div
          class="asset-preview overflow-hidden rounded-xl border border-default"
        >
          <img
            :src="brandObject.image"
            :alt="brandObject.alt"
            class="mx-auto block h-auto w-full max-w-3xl object-contain"
          />
        </div>

        <dl class="grid content-start gap-4 text-sm">
          <div>
            <dt class="text-dimmed">Status</dt>
            <dd class="font-medium text-highlighted">Available</dd>
          </div>
          <div>
            <dt class="text-dimmed">Artwork</dt>
            <dd class="font-medium text-highlighted">
              Canonical FR + III + TES wordmark
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Master</dt>
            <dd class="font-medium text-highlighted">
              Repository source · transparent PNG
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Runtime</dt>
            <dd class="font-medium text-highlighted">
              {{ brandObject.runtime }}
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Storage object</dt>
            <dd class="break-all font-mono text-xs text-highlighted">
              {{ brandObject.objectPath }}
            </dd>
          </div>
          <div>
            <dt class="text-dimmed">Next use</dt>
            <dd class="font-medium text-highlighted">{{ brandObject.use }}</dd>
          </div>
        </dl>
      </div>

      <template #footer>
        <p class="text-xs text-dimmed">
          Brand objects remain separate from Dish photography and landing
          compositions.
        </p>
      </template>
    </UCard>
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

const brandObjects = computed(() => [
  {
    name: 'Empty serving carton',
    description: 'The shared base for Classic and future Friiites Dishes.',
    role: 'packaging.serving_carton_empty',
    image: asset.value?.media.url || '/img/app/packaging/carton-empty.webp',
    alt: 'Empty black Friiites cardboard serving carton',
    runtime: asset.value
      ? `Stored ${asset.value.media.width} × ${asset.value.media.height} transparent WebP`
      : 'Transparent WebP',
    objectPath:
      asset.value?.media.object_path ||
      'apps/friiites/brand-assets/serving-carton',
    use: 'Dish composition',
  },
  {
    name: 'Takeaway bag',
    description:
      'Branded paper carry bag for collection and delivery presentation.',
    role: 'packaging.takeaway_bag',
    image: '/img/app/branding/takeaway-bag.png',
    alt: 'Black Friiites takeaway bag',
    runtime: 'Transparent PNG',
    objectPath: 'public/img/app/branding/takeaway-bag.png',
    use: 'Collection and delivery',
  },
  {
    name: 'Staff apron',
    description: 'Front-of-house and kitchen uniform treatment.',
    role: 'uniform.staff_apron',
    image: '/img/app/branding/staff-apron.png',
    alt: 'Black Friiites staff apron',
    runtime: 'Transparent PNG',
    objectPath: 'public/img/app/branding/staff-apron.png',
    use: 'Team and franchise presentation',
  },
  {
    name: 'Storefront fascia',
    description: 'Primary exterior location sign treatment.',
    role: 'place.storefront_fascia',
    image: '/img/app/branding/storefront-fascia.png',
    alt: 'Black Friiites storefront fascia sign',
    runtime: 'Transparent PNG',
    objectPath: 'public/img/app/branding/storefront-fascia.png',
    use: 'Location and franchise presentation',
  },
  {
    name: 'Table QR stand',
    description: 'Table ordering doorway with a location-specific QR code.',
    role: 'ordering.table_qr_stand',
    image: '/img/app/branding/table-qr-stand.png',
    alt: 'Black Friiites table QR ordering stand',
    runtime: 'Transparent PNG',
    objectPath: 'public/img/app/branding/table-qr-stand.png',
    use: 'Table ordering',
  },
])

definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  requiresAuth: true,
  requiresSelection: true,
  nav: {
    key: 'workspace-kitchen-assets-branding',
    label: 'Branding',
    icon: 'i-lucide-package',
    position: 'top',
    order: 4,
    desktop: true,
    mobile: true,
    layouts: ['workspace'],
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
  background-position:
    0 0,
    0 12px,
    12px -12px,
    -12px 0;
  background-size: 24px 24px;
}
</style>
