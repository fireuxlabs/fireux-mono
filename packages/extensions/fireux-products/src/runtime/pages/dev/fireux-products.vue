<template>
  <UPage>
    <UPageHeader
      title="Dev · Products (Ext)"
      description="Model shape for Products collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Products · Model'"
          :model="productModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-products',
    label: 'Products (Ext)',
    icon: 'i-lucide-package',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const productModelRuntime = {
  id: '',
  name: '',
  description: '',
  images: [],
  features: [],
  prices: [],
  created_at: {},
  updated_at: {},
  slug: '',
  content: '',
  active: false,
  main_image: '',
  default_price: {
    id: '',
    unit_amount: 0,
    interval: 'enum:day|week|month|year',
  },
  stock: 0,
  product_type: 'enum:physical|digital|service|subscription',
  track_stock: false,
  creator_id: '',
  appId: '',
  metadata: {},
} satisfies Record<string, unknown>
</script>
