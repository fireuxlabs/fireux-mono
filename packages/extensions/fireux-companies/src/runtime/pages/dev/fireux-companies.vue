<template>
  <UPage>
    <UPageHeader
      title="Dev · Companies"
      description="Inspect the immutable Company role contract and its Place-backed projections."
    />

    <UPageBody class="pagebody">
      <div class="space-y-4">
        <UCard>
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold">Role defaults</div>
            <UButton variant="ghost" size="xs" @click="modelOpen = !modelOpen">
              {{ modelOpen ? 'Hide' : 'Show' }}
            </UButton>
          </div>
          <DevModel
            v-if="modelOpen"
            class="mt-4"
            title="Company · defaults"
            :model="CompanyDefaults"
          />
        </UCard>

        <CompanyCollectionManager
          title="Companies"
          description="Valid Company roles joined to their same-ID Place projections."
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CompanyDefaults } from '../../models/company.model'

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

const modelOpen = ref(false)
</script>
