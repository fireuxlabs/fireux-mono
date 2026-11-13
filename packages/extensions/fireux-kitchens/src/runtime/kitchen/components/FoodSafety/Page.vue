<template>
  <div>
    <section class="workspace-surface">
      <KitchenFoodSafety :view="view" />
      <FireDisclosurePanel title="Food safety reference" :default-open="false">
        <WorkspaceKitchenToolsToolbar capability="food-safety" />
      </FireDisclosurePanel>
    </section>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ view?: 'checks' | 'records' | 'actions' | 'procedures' }>(),
  { view: 'checks' }
)
</script>
