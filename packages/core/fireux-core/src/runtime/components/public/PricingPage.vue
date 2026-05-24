<template>
  <main class="min-h-screen bg-default text-default">
    <div class="space-y-12 pb-16 sm:space-y-16 sm:pb-20">
      <section class="border-b border-default py-12 sm:py-16">
        <UContainer class="space-y-5">
          <NuxtLink
            v-if="showBackLink"
            :to="resolvedBackTo"
            class="text-sm font-semibold text-primary hover:underline"
          >
            {{ resolvedBackLabel }}
          </NuxtLink>

          <UBadge
            v-if="resolvedEyebrow"
            color="primary"
            variant="soft"
          >
            {{ resolvedEyebrow }}
          </UBadge>

          <div class="max-w-3xl space-y-4">
            <h1 class="text-4xl font-semibold tracking-normal text-highlighted">
              {{ title }}
            </h1>

            <p
              v-if="description"
              class="text-lg text-muted"
            >
              {{ description }}
            </p>
          </div>

          <div
            v-if="hasIntro"
            class="max-w-3xl"
          >
            <slot name="intro" />
          </div>
        </UContainer>
      </section>

      <section v-if="resolvedPlanGroups.length">
        <UContainer class="space-y-10">
          <div
            v-for="group in resolvedPlanGroups"
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

            <UPricingPlans :plans="group.plans" />
          </div>
        </UContainer>
      </section>

      <section v-if="hasDefaultSlot">
        <UContainer>
          <div class="mx-auto max-w-3xl space-y-4">
            <slot />
          </div>
        </UContainer>
      </section>

      <section v-if="hasActions">
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
import { computed, useSlots } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    eyebrow?: string
    plans?: ReadonlyArray<any>
    planGroups?: ReadonlyArray<any>
    jsonLd?: Record<string, unknown> | null
    backTo?: string
    backLabel?: string
    showBack?: boolean
  }>(),
  {
    title: 'Pricing',
    description: '',
    eyebrow: '',
    plans: () => [],
    planGroups: () => [],
    jsonLd: null,
    backTo: '/',
    backLabel: '',
    showBack: false,
  }
)

const slots = useSlots()
const fireux = useFireUXConfig()
const requestUrl = useRequestURL()

const resolvedEyebrow = computed(() =>
  props.eyebrow || `${fireux.appName || 'App'} Pricing`
)
const canonicalUrl = computed(() => {
  const origin = (fireux.siteUrl || requestUrl.origin).replace(/\/$/, '')
  return `${origin}${requestUrl.pathname}`
})
const resolvedBackTo = computed(() => props.backTo || '/')
const resolvedBackLabel = computed(() => props.backLabel || fireux.appName || 'Home')
const showBackLink = computed(() => props.showBack || Boolean(props.backLabel))
const hasIntro = computed(() => Boolean(slots.intro))
const hasDefaultSlot = computed(() => Boolean(slots.default))
const hasActions = computed(() => Boolean(slots.actions))
const resolvedPlanGroups = computed(() => {
  if (props.planGroups.length) return props.planGroups
  if (!props.plans.length) return []

  return [
    {
      id: 'plans',
      plans: props.plans,
    },
  ]
})
const jsonLdScript = computed(() =>
  props.jsonLd ? JSON.stringify(props.jsonLd) : ''
)

useHead(() => ({
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
  script: jsonLdScript.value
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
