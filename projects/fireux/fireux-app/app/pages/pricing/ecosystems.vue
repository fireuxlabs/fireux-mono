<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">Ecosystems</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Ecosystem ownership
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300">
          Create your own ecosystem when you want full platform ownership.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard class="border-primary/40 ring-1 ring-primary/20">
          <template #header>
            <h2 class="text-lg font-semibold">Ecosystem</h2>
          </template>

          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-xl font-semibold">$1000</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-xl font-semibold">$50 / month</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Additional apps</h2>
          </template>

          <div class="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs uppercase text-gray-500">Setup</p>
              <p class="text-xl font-semibold">$300</p>
            </div>

            <div>
              <p class="text-xs uppercase text-gray-500">Maintenance</p>
              <p class="text-xl font-semibold">$25 / month</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section>
      <UContainer class="max-w-xl">
        <UCard class="border-primary/20 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Console seats</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            Ecosystem ownership unlocks wholesale seat pricing.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $2.50 / month per seat
          </div>

          <p class="mt-2 text-xs text-gray-500">
            Half of app seat pricing
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
  title: 'Ecosystem Pricing · FireUX',
  description: 'Create and operate your own FireUX ecosystem with wholesale seat pricing.',
})
</script>
