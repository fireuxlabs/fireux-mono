<template>
  <div>
    <UDashboardPanel id="workspace-kitchen-food-safety">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Food Safety">
          <template #right
            ><WorkspaceKitchenAICapabilityInfo capability="food-safety"
          /></template>
        </LayoutsWorkspaceNavbar>
      </template>

      <template #body>
        <section class="workspace-surface">
          <WorkspaceKitchenFoodSafety :view="view" />
          <MoleculesDisclosurePanel
            title="Food safety reference"
            :default-open="false"
          >
            <WorkspaceKitchenTools capability="food-safety" />
            <WorkspaceKitchenAICapability
              capability="food-safety"
              :show-suggestion-cards="false"
            />
            <WorkspaceKitchenResearchCapabilitySummary
              capability="food-safety"
            />
            <WorkspaceKitchenResearchGuide capability="food-safety" />
            <WorkspaceKitchenResearchSegue
              capability="Food Safety"
              base-path="/workspace/kitchen/food-safety/search-demand"
            />
          </MoleculesDisclosurePanel>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ view?: 'checks' | 'records' | 'actions' | 'procedures' }>(),
  { view: 'checks' }
)
</script>
