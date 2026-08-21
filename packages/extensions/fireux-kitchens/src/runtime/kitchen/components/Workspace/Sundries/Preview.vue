<template>
  <UCard>
    <template #header>
      <h1 class="text-base font-semibold text-highlighted">Preview moved</h1>
    </template>

    <p class="text-sm text-dimmed">
      Menus now preview through exact published menu URLs. Create and publish a
      menu, then open it from the menu QR page.
    </p>

    <template #footer>
      <div class="flex flex-wrap gap-2">
        <UButton to="/workspace/kitchen/menus" icon="i-lucide-book-open">
          Manage menus
        </UButton>
        <UButton
          to="/workspace/kitchen/qr"
          variant="soft"
          icon="i-lucide-qr-code"
        >
          QR
        </UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
// Workspace sundries quarantine: docs/concepts/workspace.md
</script>
