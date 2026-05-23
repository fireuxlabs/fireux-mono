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

      <section v-if="plans.length">
        <UContainer>
          <UPricingPlans :plans="plans" />
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
import { computed, useSlots } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    eyebrow?: string
    plans?: ReadonlyArray<any>
    backTo?: string
    backLabel?: string
    showBack?: boolean
  }>(),
  {
    title: 'Pricing',
    description: '',
    eyebrow: '',
    plans: () => [],
    backTo: '/',
    backLabel: '',
    showBack: false,
  }
)

const slots = useSlots()
const fireux = useFireUXConfig()

const resolvedEyebrow = computed(() =>
  props.eyebrow || `${fireux.appName || 'App'} Pricing`
)
const resolvedBackTo = computed(() => props.backTo || '/')
const resolvedBackLabel = computed(() => props.backLabel || fireux.appName || 'Home')
const showBackLink = computed(() => props.showBack || Boolean(props.backLabel))
const hasIntro = computed(() => Boolean(slots.intro))
const hasDefaultSlot = computed(() => Boolean(slots.default))
const hasActions = computed(() => Boolean(slots.actions))
</script>
