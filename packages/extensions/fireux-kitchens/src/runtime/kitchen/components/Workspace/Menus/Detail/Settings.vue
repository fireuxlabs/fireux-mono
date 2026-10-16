<template>
  <section class="menu-settings">
    <div class="menu-settings__body">
      <WorkspaceKitchenMenusEditDetails />
      <WorkspaceKitchenMenusDetailSummary />
    </div>
    <WorkspaceKitchenMenusDetailAudience />
    <WorkspaceKitchenMenusDetailOfferings />
    <UButton
      to="/workspace/kitchen/promotions"
      label="Promotions"
      icon="i-lucide-badge-percent"
      color="neutral"
      variant="soft"
      class="justify-self-start"
    />
    <WorkspaceKitchenMenusDetailRemove />
  </section>
</template>
<style scoped>
.menu-settings {
  width: 100%;
  max-width: 72rem;
  margin-inline: auto;
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.menu-settings__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 17rem;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg);
  box-shadow: 0 8px 28px
    color-mix(in srgb, var(--ui-text-highlighted) 3%, transparent);
}
@media (max-width: 700px) {
  .menu-settings__body {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
