<template>
  <div class="space-y-14 pb-20">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="grid gap-10 md:grid-cols-2">
        <div class="space-y-4">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
            Join the Programme
          </p>
          <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">
            Get your own Misebox tenant
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Launch your own `misebox-app` tenant for your team and kitchens.
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton to="/contact" color="primary" size="lg">
              Join the programme
            </UButton>
            <UButton to="/get-started" color="neutral" variant="ghost" size="lg">
              See onboarding
            </UButton>
          </div>
        </div>

        <UCard class="h-full">
          <template #header>
            <div class="text-sm font-semibold">No duplicate menu work</div>
          </template>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            This is not another menu to maintain. With Google menu sync enabled,
            your updates in Misebox can update your Google menu.
          </p>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'programme',
    label: 'Programme',
    icon: 'i-lucide-handshake',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Programme · Misebox',
  description:
    'Join the Misebox programme and get your own tenant with Google menu sync support.',
})
</script>
