<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <OrganismsProfilesSupplierPreview />

      <OrganismsProfilesSupplierSectionsLocalCollection v-if="isTenant" />

      <section class="space-y-2">
        <div v-if="isTenant" class="flex items-center justify-end">
          <UButton
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{
              showGlobalDirectory
                ? 'Hide global suppliers'
                : 'View global suppliers'
            }}
          </UButton>
        </div>

        <OrganismsProfilesSupplierSectionsGlobalCollection
          v-if="showGlobalDirectory || !isTenant"
        />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'

definePageMeta({
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Suppliers',
  description: 'Supplier profiles resolved for this runtime.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant.value)

const pageTitle = 'Suppliers'
const pageDescription =
  'Inspect your supplier profile and browse suppliers resolved for this runtime.'

useHead({ title: pageTitle })
</script>
