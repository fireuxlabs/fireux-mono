<template>
  <section class="space-y-6">
    <template v-if="view !== 'access'">
      <UPageHeader
        title="Integrations"
        description="Connect the services your kitchen uses."
      />
      <UAlert
        title="Integration management is not connected yet"
        description="Connections already used by menus and ordering remain with those features. This overview does not yet manage connected providers."
        color="warning"
        variant="subtle"
        icon="i-lucide-plug"
      />
    </template>
    <template v-else-if="view === 'access'">
      <UPageHeader
        title="Access"
        description="Keep workspace access separate from people’s kitchen responsibilities."
      />
      <UAlert
        title="Access controls are not connected here yet"
        description="Existing account and kitchen membership checks still apply. Assigning a Team responsibility does not grant workspace access."
        color="warning"
        variant="subtle"
        icon="i-lucide-key-round"
      />
      <UButton
        to="/workspace/kitchen/team"
        label="Open Team"
        color="neutral"
        variant="soft"
      />
    </template>
    <UButton
      to="/workspace/kitchen/identity/appearance"
      label="Appearance"
      icon="i-lucide-palette"
      color="neutral"
      variant="link"
    />
  </section>
</template>
<script setup lang="ts">
withDefaults(defineProps<{ view?: 'integrations' | 'access' }>(), {
  view: 'integrations',
})
</script>
