<template>
  <UPage>
    <UPageHeader
      :title="moduleTitle"
      :description="moduleTagline"
    />

    <UPageBody class="pagebody space-y-8">
      <UCard>
        <div class="space-y-4">
          <p class="text-sm text-muted-foreground">{{ moduleDescription }}</p>
          <div v-if="moduleFeatures.length" class="flex flex-wrap gap-2">
            <UBadge
              v-for="feature in moduleFeatures"
              :key="feature"
              variant="soft"
              color="neutral"
              size="sm"
            >
              {{ feature }}
            </UBadge>
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Roadmap
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              What exists now and what we are building next.
            </p>
          </div>
        </template>

        <UTimeline :items="timelineItems" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductFetch } from 'fireux-products/runtime/composables/fireux/firestore/objects/product/useProduct'

definePageMeta({
  nav: {
    key: 'modules-view',
    label: 'Module',
    icon: 'i-lucide-puzzle',
    desktop: false,
  },
})

const route = useRoute()
const slug = computed(() => String(route.params.id || '').trim())

const { products } = useProductFetch()

const moduleProduct = computed(() => {
  const items = products.value ?? []
  return items.find((product) => {
    const id = String(product.id ?? '').trim()
    const productSlug = String(product.slug ?? '').trim()
    const type = String(product.product_type ?? '').trim()
    const category = String((product as any)?.metadata?.category ?? '').trim()
    return (
      (id === slug.value || productSlug === slug.value) &&
      (type === 'module' || category === 'module')
    )
  })
})

const moduleTitle = computed(() => moduleProduct.value?.name || 'Module')
const moduleTagline = computed(() => moduleProduct.value?.tagline || 'FireUX module')
const moduleDescription = computed(() => moduleProduct.value?.description || '')
const moduleFeatures = computed(() =>
  moduleProduct.value?.features?.map((feature) => feature.title).filter(Boolean) ?? []
)

const roadmapBySlug: Record<
  string,
  { title: string; description: string; icon?: string; color?: string }[]
> = {
  'fireux-kitchens': [
    {
      title: 'Now',
      description: 'Kitchen profile plus menus, ingredients, mise, team, and costs sections.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Structured prep lists, inventory workflows, and kitchen ops tooling.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Station workflows, touch-friendly order handling, and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-jobs': [
    {
      title: 'Now',
      description: 'Jobs list/detail pages, create/edit posts, and professional profiles.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Applicant workflow, messaging, and status tracking.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Payments, verified applicants, and advanced analytics.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-places': [
    {
      title: 'Now',
      description: 'Places list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Map views, search filters, and richer discovery.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Multi-location analytics and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-companies': [
    {
      title: 'Now',
      description: 'Company list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Team pages, org charts, and richer company data.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'B2B verification and partner tooling.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-drop': [
    {
      title: 'Now',
      description: 'Module scaffold only (no UI yet).',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Launch pages, drop schedules, and basic campaign flow.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Timed releases, inventory hooks, and marketing automations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
}

const timelineItems = computed(
  () => roadmapBySlug[slug.value] ?? []
)
</script>
