<template>
  <div class="space-y-12 pb-16">
    <section class="border-b border-gray-200/60 bg-white/70 py-16 dark:border-gray-800/50 dark:bg-gray-900/40">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Misebox Dev Guide</UBadge>
        <h1 class="text-4xl font-semibold text-gray-900 dark:text-white">Learn More: Dev</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Operator reference for Misebox entities, routes, and reseller implementation flow.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/learn-more" color="primary" icon="i-lucide-book-open">Public learn more</UButton>
          <UButton to="/console/kitchen/overview" color="neutral" variant="soft" icon="i-lucide-terminal">Kitchen console</UButton>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Primary entities</h2>
          </template>
          <ul class="list-disc space-y-2 pl-5 text-sm">
            <li>Kitchen, Menu, Dish, Ingredient, KitchenRecipe, KitchenMiseTask, KitchenTeamMember</li>
            <li>Job, Chef, Professional, Agent</li>
            <li>Supplier and Company links</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Operational endpoints</h2>
          </template>
          <div class="space-y-2 text-sm">
            <div class="rounded border border-default p-3">
              <p class="font-mono">GET /pricing/users</p>
              <p class="text-dimmed">User access model for ecosystem onboarding.</p>
            </div>
            <div class="rounded border border-default p-3">
              <p class="font-mono">GET /pricing/apps</p>
              <p class="text-dimmed">App operating model for ecosystem buyers.</p>
            </div>
            <div class="rounded border border-default p-3">
              <p class="font-mono">GET /pricing/resellers</p>
              <p class="text-dimmed">Reseller economics and operator path.</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  name: 'MiseboxLearnMoreDevPage',
})

useSeoMeta({
  title: 'Learn More: Dev · Misebox',
  description: 'Operator reference for Misebox entities, routes, and reseller implementation.',
})
</script>
