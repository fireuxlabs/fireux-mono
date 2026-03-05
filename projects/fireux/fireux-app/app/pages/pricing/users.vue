<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">User Access</UBadge>

        <div class="space-y-2">
          <AppBrandWordmark
            size="large"
            class="h-9 w-auto max-w-full object-contain"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </div>
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

          <UButton to="/auth" variant="soft" trailing-icon="i-lucide-arrow-right" class="mt-4">
            Join now
          </UButton>
        </UCard>

        <UCard class="border-primary/30 bg-primary/5">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h2 class="text-lg font-semibold">Upgrade</h2>
              <div class="text-3xl font-semibold text-primary">
                $10 / month
              </div>
            </div>
          </template>

          <ul class="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Access all FireUX templates and paid resources</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Use the FireUX console</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Launch support via FireUX blog</span></li>
            <li class="flex gap-2"><UIcon name="i-lucide-check" /><span>Backlink from FireUX</span></li>
          </ul>

          <UButton to="/product/upgrade" color="primary" trailing-icon="i-lucide-arrow-right" class="mt-4">
            Upgrade
          </UButton>
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
