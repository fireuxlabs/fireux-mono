<template>
  <section class="workspace-surface workspace-surface--compact">
    <UCard>
      <template #header>
        <h1>Preview moved</h1>
      </template>

      <p>
        Menus now preview through exact published menu URLs. Create and publish
        a menu, then open it from the menu QR page.
      </p>

      <template #footer>
        <div class="fx-card__actions">
          <UButton to="/workspace/kitchen/menu/menus" icon="i-lucide-book-open">
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
  </section>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
  workspacePage: true,
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-preview',
    label: 'Preview',
    icon: 'i-lucide-eye',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
