<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">{{ appName }} Pricing</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Resellers
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300">
          Resellers buy at 50% of ecosystem pricing and sell at ecosystem rate.
        </p>

        <p class="text-gray-600 dark:text-gray-300">
          This gives industry operators a clear recurring business model while the platform stays consistent.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard class="border-primary/40 ring-1 ring-primary/20">
          <template #header>
            <h2 class="text-lg font-semibold">Reseller buy rates</h2>
          </template>

          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">App install</p>
              <p class="text-lg font-semibold">$300</p>
            </div>
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-lg font-semibold">$25/mo</p>
            </div>
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Console seat</p>
              <p class="text-lg font-semibold">$2.50/mo</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Ecosystem sell rates</h2>
          </template>

          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">App install</p>
              <p class="text-lg font-semibold">$600</p>
            </div>
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-lg font-semibold">$50/mo</p>
            </div>
            <div class="rounded-xl border border-gray-200/70 p-3 dark:border-gray-800/70">
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
            <h2 class="text-lg font-semibold">Reseller margin</h2>
          </template>

          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Install margin: $300</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Maintenance margin: $25/month per app</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Console seat margin: $2.50/month per seat</span></li>
          </ul>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Simple scaling example</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            At 100 active branches, maintenance margin alone is <strong>$2,500/month</strong>
            (100 × $25).
          </p>

          <p class="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Seats and installs add on top using the same 50% rule.
          </p>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UAlert
          color="neutral"
          variant="soft"
          title="Reseller rule"
          description="Resellers purchase apps, maintenance, and console seats at 50% of ecosystem pricing."
        />
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const appName = 'Misebox'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: `Reseller Pricing · ${appName}`,
  description: `Reseller pricing for ${appName}: 50% buy rates with clear recurring margin.`,
})
</script>
