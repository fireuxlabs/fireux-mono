<template>
  <main>
    <UPageHero :title="props.title" :description="props.description" />

    <UContainer
      v-if="planGroups.length"
      class="flex flex-col gap-12 pb-16 sm:pb-24"
    >
      <section
        v-for="group in planGroups"
        :key="group.id || group.title || 'plans'"
        class="space-y-6"
      >
        <div v-if="group.title || group.description" class="space-y-2">
          <h2
            v-if="group.title"
            class="text-2xl font-semibold text-highlighted"
          >
            {{ group.title }}
          </h2>
          <p v-if="group.description" class="text-muted">
            {{ group.description }}
          </p>
        </div>

        <UPricingPlans :plans="[...group.plans]" />
      </section>
    </UContainer>

    <UPageSection v-if="$slots.intro || $slots.default || $slots.actions">
      <div class="mx-auto max-w-3xl space-y-6">
        <slot name="intro" />
        <slot />
        <div v-if="$slots.actions" class="flex flex-wrap gap-3">
          <slot name="actions" />
        </div>
      </div>
    </UPageSection>
  </main>
</template>

<script setup lang="ts">
import { useHead, useRequestURL } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  buildPricingOfferCatalog,
  normalizePricingPlanGroups,
  type PricingPlan,
  type PricingPlanGroup,
} from '../../utils/pricing/page'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    plans?: ReadonlyArray<PricingPlan>
    planGroups?: ReadonlyArray<PricingPlanGroup>
  }>(),
  {
    title: 'Pricing',
    description: '',
    plans: () => [],
    planGroups: () => [],
  }
)

const fireux = useFireUXConfig()
const requestUrl = useRequestURL()

const planGroups = computed(() =>
  normalizePricingPlanGroups(props.planGroups, props.plans)
)
const canonicalUrl = computed(() => {
  const origin = (fireux.siteUrl || requestUrl.origin).replace(/\/$/, '')
  return `${origin}${requestUrl.pathname}`
})
const jsonLdScript = computed(() =>
  JSON.stringify(
    buildPricingOfferCatalog({
      name: `${fireux.appName} Pricing`,
      description: props.description,
      groups: planGroups.value,
    })
  )
)

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: planGroups.value.length
    ? [
        {
          key: 'pricing-json-ld',
          type: 'application/ld+json',
          children: jsonLdScript.value,
        },
      ]
    : [],
}))
</script>
