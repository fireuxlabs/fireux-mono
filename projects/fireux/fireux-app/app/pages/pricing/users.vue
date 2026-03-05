<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">FireUX Users</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Join FireUX
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300">
          Creating an account on FireUX is free.
        </p>

        <p class="text-gray-600 dark:text-gray-300">
          Accounts let people build profiles, explore ecosystems, use templates, and interact with apps.
        </p>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Free access</h2>
          </template>

          <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create a FireUX account</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create profiles</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Browse ecosystems and apps</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Access free templates and resources</span></li>
          </ul>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Console seats</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            A console seat is required only when someone needs private operational access.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $10 / month
          </div>

          <p class="mt-2 text-xs text-gray-500">
            FireUX recommended retail price (RRP)
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
  title: 'User Pricing · FireUX',
  description: 'FireUX accounts are free. Console seats are billed only for operational access.',
})
</script>
