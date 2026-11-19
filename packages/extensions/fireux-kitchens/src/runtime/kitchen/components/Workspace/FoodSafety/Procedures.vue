<template>
  <WorkspacePageHeader
    title="Procedures"
    description="Keep the team’s working instructions easy to find."
    variant="child"
  />
  <UAlert
    icon="i-lucide-shield-check"
    color="warning"
    variant="subtle"
    title="Not connected yet"
    description="Kitchen-specific procedures are not connected yet. Product reference material below is not your approved food safety plan."
  />
  <FireDisclosurePanel title="Food safety reference" :default-open="false">
    <WorkspaceKitchenToolsToolbar capability="food-safety" />
  </FireDisclosurePanel>
  <details class="kitchen-record-assistant">
    <summary>Ask KitchenAI about procedures</summary>
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.food-safety.procedures"
      label="Procedures"
      context-label="Food Safety"
    />
  </details>
</template>

<style scoped>
@import '../record-tools.css';
</style>
