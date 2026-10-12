<template>
  <section class="space-y-6">
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
    <UButton
      to="/workspace/kitchen/identity/appearance"
      label="Appearance"
      icon="i-lucide-palette"
      color="neutral"
      variant="link"
    />
  </section>
</template>
