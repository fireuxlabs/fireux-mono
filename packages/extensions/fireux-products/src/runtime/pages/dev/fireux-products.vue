<template>
  <UPage>
    <UPageHeader
      title="Dev · Products (Ext)"
      description="Collection-first view; filter by extra fields (against the runtime Product model)."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Products</div>
            <UButton
              variant="ghost"
              size="xs"
              @click="toggleSection('products')"
            >
              {{ openSections.products ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <div v-show="openSections.products" class="mt-4">
            <DevProductSystem />
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const openSections = reactive({
  products: false,
})

const toggleSection = (key: keyof typeof openSections) => {
  openSections[key] = !openSections[key]
}

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
</script>
