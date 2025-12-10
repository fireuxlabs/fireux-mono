<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/chefs/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesChefPreview />

      <OrganismsProfilesChefSectionsLocalCollection v-if="isTenant" />

      <section class="space-y-2">
        <div v-if="isTenant" class="flex items-center justify-end">
          <UButton
            variant="ghost"
            @click="showGlobalDirectory = !showGlobalDirectory"
          >
            {{
              showGlobalDirectory ? 'Hide global chefs' : 'View global chefs'
            }}
          </UButton>
        </div>

        <OrganismsProfilesChefSectionsGlobalCollection
          v-if="showGlobalDirectory || !isTenant"
        />
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'

definePageMeta({
  nav: {
    key: 'chefs',
    label: 'Chefs',
    icon: 'i-lucide-egg-fried',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Chefs',
  description: 'Chef profiles resolved for this runtime.',
  layout: 'default',
  name: 'ChefsIndexPage',
})

const { isTenant } = useFireUXConfig()
const showGlobalDirectory = ref(!isTenant.value)

const pageTitle = 'Chefs'
const pageDescription =
  'Inspect your chef profile and browse all chefs resolved for this runtime.'

useHead({ title: pageTitle })
</script>
