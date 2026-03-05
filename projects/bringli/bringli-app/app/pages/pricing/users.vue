<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">{{ appName }} Pricing</UBadge>

        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
          Users
        </h1>

        <p class="text-lg text-gray-600 dark:text-gray-300">
          Joining {{ appName }} is free.
        </p>

        <p class="text-gray-600 dark:text-gray-300">
          People can create profiles and interact with the ecosystem. Operational access is billed only when someone uses the console.
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
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create an account</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Create profiles</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Browse public pages</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Use ecosystem features</span></li>
          </ul>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <h2 class="text-lg font-semibold">Console seats</h2>
          </template>

          <p class="text-sm text-gray-600 dark:text-gray-300">
            A console seat is required only when a user manages private operational records.
          </p>

          <div class="mt-4 text-3xl font-semibold text-primary">
            $5 / month
          </div>

          <p class="mt-2 text-xs text-gray-500">
            Per console user
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
const appName = 'Bringli'

definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: `User Pricing · ${appName}`,
  description: `${appName} users are free. Console seats are billed only when operational access is required.`,
})
</script>
