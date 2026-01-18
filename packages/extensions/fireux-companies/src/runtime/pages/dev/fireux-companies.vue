<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies (Ext)"
      description="Model shape for Companies collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Companies · Model'"
          :model="companyModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { Company as CompanyModelRuntime } from '../../models/objects/company.model';

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-companies',
    label: 'Companies (Ext)',
    icon: 'i-lucide-building-2',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const companyModelRuntime = CompanyModelRuntime as unknown as Record<string, unknown>
</script>
