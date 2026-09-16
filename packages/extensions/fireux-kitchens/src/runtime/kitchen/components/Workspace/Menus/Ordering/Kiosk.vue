<template>
  <section class="workspace-surface">
    <WorkspaceKitchenMenusWorkspaceHeader current-label="Kiosk" />

    <UCard>
      <div>
        <h1 class="text-lg font-semibold text-highlighted">Kiosk</h1>
        <p class="text-sm leading-6 text-dimmed">
          Configure the shared Kiosk doorway for this Menu. Eat here and Take
          away remain choices inside the same Kiosk surface.
        </p>
      </div>
    </UCard>

    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-shield-check"
      title="Live Kiosks are trusted devices"
      description="This page configures the Menu. Activate tablets, open the live surface, and revoke device access from Orders & Service."
      :actions="[
        {
          label: 'Manage live Kiosks',
          to: '/workspace/kitchen/orders/kiosks',
          icon: 'i-lucide-monitor-smartphone',
        },
      ]"
    />

  </section>
</template>
