<template>
  <UPageCTA
    title="Your menu belongs here, too"
    description="Publish a menu and share it with a link or QR code. Manage your food and drinks in your Kitchen Workspace when you need more."
    variant="naked"
  >
    <template #links>
      <UButton to="/solutions/qr-menu-url" icon="i-lucide-qr-code"
        >Create Menu QR</UButton
      >
      <UButton
        :to="workspaceTo"
        :disabled="access.pending.value || Boolean(access.error.value)"
        color="neutral"
        variant="soft"
        icon="i-lucide-book-open"
      >
        {{ hasKitchens ? 'Create in Workspace' : 'Add a kitchen' }}
      </UButton>
    </template>
  </UPageCTA>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenAccess } from '../../kitchen/composables/useKitchenAccess'
const access = useKitchenAccess()
const hasKitchens = computed(() => Boolean(access.ids.value.length))
const workspaceTo = computed(() =>
  hasKitchens.value
    ? '/workspace/kitchen/menus/create'
    : '/workspace/kitchen/create'
)
</script>
