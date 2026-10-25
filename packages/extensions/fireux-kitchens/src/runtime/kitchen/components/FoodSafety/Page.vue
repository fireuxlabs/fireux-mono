<template>
  <div>
    <WorkspaceKitchenAICapabilityInfo capability="food-safety" />
    <section class="workspace-surface">
      <KitchenFoodSafety :view="view" />
      <MoleculesDisclosurePanel
        title="Food safety reference"
        :default-open="false"
      >
        <WorkspaceKitchenToolsToolbar capability="food-safety" />
        <WorkspaceKitchenAICapability
          capability="food-safety"
          :show-suggestion-cards="false"
        />
        <WorkspaceKitchenResearchCapabilitySummary capability="food-safety" />
        <WorkspaceKitchenResearchGuide capability="food-safety" />
        <WorkspaceKitchenResearchSegue
          capability="Food Safety"
          base-path="/workspace/kitchen/food-safety/search-demand"
        />
      </MoleculesDisclosurePanel>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ view?: 'checks' | 'records' | 'actions' | 'procedures' }>(),
  { view: 'checks' }
)
</script>
