<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Portfolio"
      description="Create the public portfolio record. Console setup happens separately."
    />

    <UPageBody class="pagebody">
      <PortfolioCreateSystem mode="root" :cancel-to="cancelTo" :return-to="returnTo" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import PortfolioCreateSystem from '../../components/Portfolio/Create/System.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Portfolio',
  description: 'Create the public portfolio record.',
  nav: {
    key: 'portfolios-create',
    label: 'Create portfolio',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  name: 'PortfoliosCreatePage',
})

const route = useRoute()
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | Create Portfolio` })

const returnTo = computed(() => {
  const value = String(route.query.returnTo || '').trim()
  return value.startsWith('/') ? value : '/portfolios'
})

const cancelTo = computed(() => {
  return returnTo.value
})
</script>
