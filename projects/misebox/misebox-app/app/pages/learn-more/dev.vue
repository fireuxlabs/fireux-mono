<template>
  <div class="fx-page-stack fx-page-stack--compact">
    <section>
      <UContainer>
        <UBadge color="primary" variant="soft">Misebox Dev Guide</UBadge>
        <h1 class="fx-type-display-title">Learn More: Dev</h1>
        <p class="fx-type-description">
          Operator reference for Misebox entities, routes, and partner
          implementation flow.
        </p>
        <div class="fx-card__actions">
          <UButton to="/learn-more" color="primary" icon="i-lucide-book-open"
            >Public learn more</UButton
          >
          <UButton
            to="/"
            color="neutral"
            variant="soft"
            icon="i-lucide-terminal"
            >Kitchen workspace</UButton
          >
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer>
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Primary entities</h2>
          </template>
          <ul class="fx-list-stack">
            <li>
              Kitchen, Menu, Item, Ingredient, KitchenRecipe, KitchenTeamMember
            </li>
            <li>Job, Chef, Professional, Agent</li>
            <li>Supplier and Company links</li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Operational endpoints</h2>
          </template>
          <div class="pagebody">
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/free</p>
              <p class="fx-type-body">Functional Kitchen Workspace access.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/pro</p>
              <p class="fx-type-body">
                Complete self-managed Kitchen Workspace.
              </p>
            </div>
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /pricing/business</p>
              <p class="fx-type-body">Multiple-Kitchen operating capacity.</p>
            </div>
            <div class="fx-inset-panel">
              <p class="fx-type-code">GET /product</p>
              <p class="fx-type-body">Misebox product landing.</p>
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
  description:
    'Operator reference for Misebox entities, routes, and partner implementation.',
})
</script>
