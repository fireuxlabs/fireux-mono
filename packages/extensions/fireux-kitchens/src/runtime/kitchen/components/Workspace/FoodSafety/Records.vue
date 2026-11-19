<template>
  <WorkspacePageHeader
    title="Food safety records"
    description="Find completed checks and their supporting evidence."
    variant="child"
  />
  <UAlert
    icon="i-lucide-shield-check"
    color="warning"
    variant="subtle"
    title="Not connected yet"
    description="No safety record source is connected. Missing information must not be treated as a passed check."
  />
  <FireDisclosurePanel title="Food safety reference" :default-open="false">
    <WorkspaceKitchenToolsToolbar capability="food-safety" />
  </FireDisclosurePanel>
  <details class="kitchen-record-assistant">
    <summary>Ask KitchenAI about records</summary>
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.food-safety.records"
      label="Records"
      context-label="Food Safety"
    />
  </details>
</template>

<style scoped>
@import '../record-tools.css';
</style>
