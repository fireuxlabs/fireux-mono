<template>
  <section class="space-y-6">
    <template v-if="view === 'integrations'">
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
    <template v-else>
      <UPageHeader
        title="Ordering channels"
        description="Choose how guests order and where those orders appear."
      />
      <div class="grid gap-4 md:grid-cols-2">
        <UPageCard
          title="Menu ordering"
          description="Configure collection, delivery, pre-orders and kiosk ordering from each menu."
          icon="i-lucide-book-open"
          to="/workspace/kitchen/menus"
        />
        <UPageCard
          title="Kiosks"
          description="Manage the screens accepting orders for this kitchen."
          icon="i-lucide-monitor"
          to="/workspace/kitchen/orders/kiosks"
        />
      </div>
      <UAlert
        title="Channels are configured per menu"
        description="Open a menu to use its existing ordering controls. A combined kitchen-wide channel editor is not connected yet."
        color="neutral"
        variant="subtle"
      />
    </template>
    <UButton
      to="/workspace/kitchen/identity/theme"
      label="Workspace appearance"
      icon="i-lucide-palette"
      color="neutral"
      variant="link"
    />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
const route = useRoute()
const view = computed(() => String(route.query.view || 'channels'))
</script>
