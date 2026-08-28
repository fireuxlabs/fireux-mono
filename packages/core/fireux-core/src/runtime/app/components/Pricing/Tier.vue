<template>
  <main v-if="tier" class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/pricing" variant="link" class="px-0"> Pricing </UButton>
        <UPageHeader
          :title="tier.title"
          :description="tier.description"
          :headline="tier.eyebrow"
        />
        <UPageBody class="space-y-4">
          <UCard variant="subtle">
            <p class="text-sm text-muted">Price</p>
            <p class="mt-1 text-3xl font-semibold text-highlighted">
              {{ tier.price
              }}<small v-if="tier.billingCycle" class="text-base text-muted">{{
                tier.billingCycle
              }}</small>
            </p>
            <p class="mt-2 text-sm text-muted">{{ tier.priceNote }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold text-highlighted">
                What you get
              </h2>
            </template>
            <ul class="space-y-3">
              <li
                v-for="item in tier.included"
                :key="item"
                class="flex gap-2 text-sm text-muted"
              >
                <UIcon
                  name="i-lucide-check"
                  class="mt-0.5 shrink-0 text-primary"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </UCard>

          <UCard v-if="tier.id === 'your-ecosystem'">
            <template #header>
              <h2 class="text-lg font-semibold text-highlighted">
                Customer App revenue
              </h2>
            </template>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[34rem] text-left text-sm">
                <thead class="text-muted">
                  <tr>
                    <th class="pb-3 pr-4 font-medium">Customer purchase</th>
                    <th class="pb-3 pr-4 font-medium">Retail</th>
                    <th class="pb-3 pr-4 font-medium">FireUX</th>
                    <th class="pb-3 font-medium">Ecosystem owner</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default text-highlighted">
                  <tr v-for="row in ecosystemRevenue" :key="row.purchase">
                    <td class="py-3 pr-4">{{ row.purchase }}</td>
                    <td class="py-3 pr-4">{{ row.retail }}</td>
                    <td class="py-3 pr-4">{{ row.fireux }}</td>
                    <td class="py-3">{{ row.owner }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="mt-4 text-sm text-muted">
              The customer pays the standard retail price. FireUX invoices the
              ecosystem owner for half, leaving the other half as the owner’s
              sales margin.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold text-highlighted">
                Not included
              </h2>
            </template>
            <ul class="space-y-3">
              <li
                v-for="item in tier.notIncluded"
                :key="item"
                class="flex gap-2 text-sm text-muted"
              >
                <UIcon
                  name="i-lucide-minus"
                  class="mt-0.5 shrink-0 text-muted"
                />
                <span>{{ item }}</span>
              </li>
            </ul>
          </UCard>

          <UAlert
            color="neutral"
            variant="soft"
            title="Next step"
            :description="tier.nextStep"
          />

          <div class="flex flex-wrap gap-3">
            <UButton
              v-if="tier.id === 'your-app'"
              to="/apps/create"
              icon="i-lucide-app-window"
            >
              Create app
            </UButton>
            <UButton :href="contactHref" icon="i-lucide-mail"
              >Ask about {{ tier.title }}</UButton
            >
            <UButton to="/pricing" color="neutral" variant="ghost"
              >Compare plans</UButton
            >
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { createError } from '#imports'
import type { AppPricingTier } from '../../composables/pricing/usePricing'

const props = defineProps<{
  appName: string
  contactEmail: string
  tierId: string
  tiers: readonly AppPricingTier[]
}>()
const tier = computed(() =>
  props.tiers.find((item) => item.id === props.tierId)
)

if (!tier.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Pricing tier not found',
  })
}

const contactHref = computed(
  () =>
    `mailto:${props.contactEmail}?subject=${encodeURIComponent(`${props.appName} ${tier.value?.title || 'pricing'}`)}`
)

const ecosystemRevenue = [
  {
    purchase: 'App setup',
    retail: 'CHF 600',
    fireux: 'CHF 300',
    owner: 'CHF 300',
  },
  {
    purchase: 'Additional Entity setup',
    retail: 'CHF 100',
    fireux: 'CHF 50',
    owner: 'CHF 50',
  },
  {
    purchase: 'Monthly Entity',
    retail: 'CHF 50/month',
    fireux: 'CHF 25/month',
    owner: 'CHF 25/month',
  },
] as const
</script>
