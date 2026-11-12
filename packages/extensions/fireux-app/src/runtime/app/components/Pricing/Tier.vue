<template>
  <div v-if="tier">
    <UContainer>
      <UPage>
        <UButton to="/pricing" variant="link"> Pricing </UButton>
        <UPageHeader
          :title="tier.title"
          :description="tier.description"
          :headline="tier.eyebrow"
        />
        <UPageBody>
          <UCard variant="subtle">
            <p>Price</p>
            <p>
              {{ tier.price
              }}<small v-if="tier.billingCycle">{{ tier.billingCycle }}</small>
            </p>
            <p>{{ tier.priceNote }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h2>What you get</h2>
            </template>
            <ul class="fx-list-stack">
              <li v-for="item in tier.included" :key="item">
                <span>{{ item }}</span>
              </li>
            </ul>
          </UCard>

          <UCard v-if="tier.id === 'your-ecosystem'">
            <template #header>
              <h2>Customer App revenue</h2>
            </template>
            <UTable
              :data="ecosystemRevenue"
              :columns="ecosystemRevenueColumns"
            />
            <p>
              The customer pays the standard retail price. FireUX invoices the
              ecosystem owner for half, leaving the other half as the owner’s
              sales margin.
            </p>
          </UCard>

          <UCard>
            <template #header>
              <h2>Not included</h2>
            </template>
            <ul class="fx-list-stack">
              <li v-for="item in tier.notIncluded" :key="item">
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

          <div class="fx-card__actions">
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
  </div>
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

const ecosystemRevenueColumns = [
  { accessorKey: 'purchase', header: 'Customer purchase' },
  { accessorKey: 'retail', header: 'Retail' },
  { accessorKey: 'fireux', header: 'FireUX' },
  { accessorKey: 'owner', header: 'Ecosystem owner' },
]

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
]
</script>
