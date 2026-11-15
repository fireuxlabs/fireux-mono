<template>
  <section class="prep-overview">
    <WorkspacePageHeader
      title="Prep & Production"
      description="Manage preparations, recipes, ingredients and production."
    />
    <WorkspaceKitchenAIFocus
      focus="kitchen-ai.prep"
      label="Prep &amp; Production"
      context-label="Prep"
      spacious
    />
    <nav class="prep-overview__shortcuts" aria-label="Prep tools">
      <FireActionSurface
        v-for="tool in tools"
        :key="tool.label"
        :to="tool.to"
        class="prep-overview__shortcut"
      >
        <UIcon :name="tool.icon" />
        <span>{{ tool.label }}</span>
      </FireActionSurface>
    </nav>
    <section class="prep-overview__production" aria-label="Production tools">
      <span class="fx-type-caption">Production</span>
      <UButton
        to="/workspace/kitchen/prep/plan"
        label="Prep plan"
        icon="i-lucide-clipboard-list"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="/workspace/kitchen/prep/batches"
        label="Batches"
        icon="i-lucide-layers"
        color="neutral"
        variant="ghost"
      />
      <UBadge color="neutral" variant="subtle" size="sm"
        >Not connected yet</UBadge
      >
    </section>
  </section>
</template>
<script setup lang="ts">
const tools = [
  {
    label: 'Preparations',
    icon: 'i-lucide-cooking-pot',
    to: '/workspace/kitchen/prep/preparations',
  },
  {
    label: 'Recipes',
    icon: 'i-lucide-book-open',
    to: '/workspace/kitchen/prep/recipes',
  },
  {
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    to: '/workspace/kitchen/prep/ingredients',
  },
  {
    label: 'Stations',
    icon: 'i-lucide-panels-top-left',
    to: '/workspace/kitchen/stations',
  },
]
</script>
<style scoped>
.prep-overview {
  display: grid;
  gap: calc(var(--spacing) * 6);
}
.prep-overview__shortcuts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}
.prep-overview__shortcut {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-bg-elevated);
  font-weight: 600;
}
.prep-overview__shortcut:hover {
  background: var(--ui-bg-accented);
}
.prep-overview__production {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
</style>
