<template>
  <UPageCTA
    title="Menus"
    description="Browse live menus, or create a simple menu QR when you need one."
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section
          v-for="action in actions"
          :key="`${action.label}-${action.to}`"
          class="space-y-2"
        >
          <p class="text-sm font-semibold">{{ action.label }}</p>
          <UButton
            block
            color="primary"
            variant="soft"
            :icon="action.icon"
            :to="action.to"
          >
            {{ action.cta }}
          </UButton>
        </section>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Browse',
    cta: 'See live menus',
    to: '#live-menus',
    icon: 'i-lucide-book-open-check',
  },
  {
    label: 'Create',
    cta: 'Create menu QR',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'Upload',
    cta: 'Upload menu',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-file-up',
  },
] as const
</script>
