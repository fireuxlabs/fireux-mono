<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">{{ ecosystemName }} Pricing</UBadge>

        <h1 class="text-4xl font-semibold text-highlighted">
          {{ ecosystemName }} Partner
        </h1>

        <p class="max-w-3xl text-lg text-toned">
          Partners can bring customer apps into {{ ecosystemName }} and share setup and maintenance revenue.
        </p>

        <p class="max-w-3xl text-toned">
          Use Partner pricing for customer apps you bring into the ecosystem. Use Tenant App pricing when a business launches its own app.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard class="border-primary/40 ring-1 ring-primary/20">
          <template #header>
            <h2 class="text-lg font-semibold">{{ ecosystemName }} Partner</h2>
          </template>

          <p class="text-sm text-toned">
            Partner pricing applies when you bring a customer business into the ecosystem.
          </p>

          <div class="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-lg font-semibold">$300</p>
            </div>
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-lg font-semibold">$25/mo</p>
            </div>
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Seat share</p>
              <p class="text-lg font-semibold">$2.50/mo</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Tenant App</h2>
          </template>

          <p class="text-sm text-toned">
            Tenant App pricing is the normal path when a business launches its own app inside {{ ecosystemName }}.
          </p>

          <div class="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-lg font-semibold">$600</p>
            </div>
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-lg font-semibold">$50/mo</p>
            </div>
            <div class="rounded-lg border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Console seat</p>
              <p class="text-lg font-semibold">$5/mo</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section class="bg-gray-50/80 py-16 dark:bg-gray-900/40">
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Where it fits</h2>
          </template>

          <ul class="space-y-2 text-sm text-toned">
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>You introduce a new business to {{ ecosystemName }}</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>The business launches a tenant app in the ecosystem</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>You stay involved in setup, support, or maintenance</span></li>
          </ul>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Simple rule</h2>
          </template>

          <p class="text-sm text-toned">
            Partner pricing is the customer-app path for partners. Tenant App pricing is the direct launch path for a business.
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useEcosystemPricingPage } from '../../composables/fireux/pricing/useEcosystemPricingPage'

const { ecosystemName } = useEcosystemPricingPage()
</script>
