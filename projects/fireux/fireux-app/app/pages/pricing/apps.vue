<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">Apps</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          App pricing
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300">
          Apps are the primary FireUX product.
        </p>

        <p class="text-gray-600 dark:text-gray-300">
          Choose the app operating model that matches your ownership and speed requirements.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-3">
        <UCard class="border-primary/40 ring-1 ring-primary/20">
          <template #header>
            <h2 class="text-lg font-semibold">App in existing ecosystem</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Launch inside an ecosystem operated by FireUX.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-xl font-semibold">$600</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-xl font-semibold">$50 / month</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">FireUX hosted app</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Launch a new domain without creating an ecosystem yet.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-xl font-semibold">$700</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-xl font-semibold">$60 / month</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Self hosted app</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Client owns Firebase, hosting, and infrastructure.
          </p>

          <div class="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-xl font-semibold">$400</p>
            </div>
            <div>
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-xl font-semibold">$30 / month</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer class="max-w-xl">
        <UCard class="border-primary/20 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Console users</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            All end users are free. Only operational console users are billed.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $5 / month per seat
          </div>

          <p class="mt-2 text-xs text-gray-500">
            Half of FireUX seat RRP
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'App Pricing · FireUX',
  description: 'Start with an app. Choose ecosystem-hosted, FireUX-hosted, or self-hosted.',
})
</script>
