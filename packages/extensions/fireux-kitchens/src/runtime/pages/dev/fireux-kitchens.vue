<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens (Ext)"
      description="Model shape for Kitchens collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Kitchens · Model'"
          :model="kitchenModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { Kitchen as KitchenModelRuntime } from '../../models/objects/kitchen.model';

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const kitchenModelRuntime = KitchenModelRuntime as unknown as Record<string, unknown>
</script>
