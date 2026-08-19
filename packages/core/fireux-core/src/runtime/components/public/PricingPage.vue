<template>
  <main class="min-h-screen bg-default text-default">
    <div class="fx-page-stack fx-page-stack--responsive">
      <section class="border-b border-default py-12 sm:py-16">
        <UContainer class="space-y-5">
          <UBadge color="primary" variant="soft">
            {{ fireux.appName }} Pricing
          </UBadge>

          <div class="max-w-3xl space-y-4">
            <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
              {{ props.title }}
            </h1>

            <p
              v-if="props.description"
              class="text-lg text-muted"
            >
              {{ props.description }}
            </p>
          </div>

          <div
            v-if="$slots.intro"
            class="max-w-3xl"
          >
            <slot name="intro" />
          </div>
        </UContainer>
      </section>

      <section v-if="planGroups.length">
        <UContainer class="space-y-10">
          <div
            v-for="group in planGroups"
            :key="group.id || group.title || 'plans'"
            class="space-y-5"
          >
            <div
              v-if="group.title || group.description"
              class="max-w-3xl space-y-2"
            >
              <h2
                v-if="group.title"
                class="text-2xl font-semibold text-highlighted"
              >
                {{ group.title }}
              </h2>

              <p
                v-if="group.description"
                class="text-sm text-muted"
              >
                {{ group.description }}
              </p>
            </div>

            <UPricingPlans :plans="[...group.plans]" />
          </div>
        </UContainer>
      </section>

      <section v-if="$slots.default">
        <UContainer>
          <div class="mx-auto max-w-3xl space-y-4">
            <slot />
          </div>
        </UContainer>
      </section>

      <section v-if="$slots.actions">
        <UContainer>
          <div class="mx-auto flex max-w-3xl flex-wrap gap-3">
            <slot name="actions" />
          </div>
        </UContainer>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useHead, useRequestURL } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  buildPricingOfferCatalog,
  normalizePricingPlanGroups,
  type PricingPlan,
  type PricingPlanGroup,
} from '../../utils/pricingPage'

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
