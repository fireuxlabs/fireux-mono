<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Create Portfolio"
      description="Create a portfolio once, then enter the same portfolio console from anywhere."
    />

    <UPageBody class="pagebody">
      <UCard>
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold">Portfolio details</div>
            <div class="text-xs text-dimmed">
              Portfolios group property operations, finance, compliance, and documents.
            </div>
          </div>
        </template>

        <PortfolioCreateForm :cancel-to="cancelTo" :return-to="returnTo" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import PortfolioCreateForm from '../../components/organisms/Portfolio/Create/Form.vue'

definePageMeta({
  layout: 'default',
  requiresAuth: true,
  title: 'Create Portfolio',
  description: 'Create a portfolio.',
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
  return value.startsWith('/') ? value : '/console/portfolio/overview'
})

const cancelTo = computed(() => {
  return returnTo.value === '/console/portfolio/overview' ? '/portfolios' : returnTo.value
})
</script>
