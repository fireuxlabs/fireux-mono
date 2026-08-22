<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section class="border-b border-default bg-default/70 py-16">
      <UContainer class="space-y-4">
        <UBadge color="primary" variant="soft">Misebox Dev Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More: Dev</h1>
        <p class="fx-type-description text-toned">
          Operator reference for Misebox entities, routes, and partner implementation flow.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/learn-more" color="primary" icon="i-lucide-book-open">Public learn more</UButton>
          <UButton to="/" color="neutral" variant="soft" icon="i-lucide-terminal">Kitchen workspace</UButton>
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 md:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary entities</h2>
          </template>
          <ul class="list-disc fx-list-stack text-sm">
            <li>Kitchen, Menu, Dish, Ingredient, KitchenRecipe, KitchenMiseTask, KitchenTeamMember</li>
            <li>Job, Chef, Professional, Agent</li>
            <li>Supplier and Company links</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Operational endpoints</h2>
          </template>
          <div class="space-y-2 text-sm">
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/free</p>
              <p class="text-dimmed">Functional Kitchen Workspace access.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/your-app</p>
              <p class="text-dimmed">Branded Misebox App setup and monthly plan.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="font-mono">GET /pricing/managed</p>
              <p class="text-dimmed">Managed product and assistance.</p>
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
  description: 'Operator reference for Misebox entities, routes, and partner implementation.',
})
</script>
