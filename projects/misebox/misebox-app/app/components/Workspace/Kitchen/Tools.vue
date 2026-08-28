<template>
  <section aria-labelledby="free-tools" class="grid gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="grid max-w-2xl gap-1">
        <h2 id="free-tools" class="m-0 text-2xl font-semibold text-highlighted">
          Free restaurant tools
        </h2>
        <p class="m-0 text-sm leading-6 text-muted">
          Calculators, QR Menus and restaurant ordering.
        </p>
      </div>
      <UButton
        to="/tools"
        label="All restaurant tools"
        color="neutral"
        variant="link"
        trailing-icon="i-lucide-arrow-right"
      />
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <UPageCard
        v-for="tool in tools"
        :key="tool.to"
        :to="tool.to"
        :title="tool.label"
        :description="tool.description"
        :icon="tool.icon"
        variant="subtle"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
const tools = [
  {
    label: 'Restaurant labour-cost calculator',
    description:
      'Calculate labour cost and labour percentage from restaurant sales and staffing costs.',
    to: '/tools/restaurant-labour-cost',
    icon: 'i-lucide-calculator',
  },
  {
    label: 'QR Menu',
    description:
      'Publish a restaurant Menu that guests can open from a QR code.',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'Menu URL QR',
    description: 'Create a QR code that opens an existing restaurant Menu URL.',
    to: '/solutions/qr-menu-url',
    icon: 'i-lucide-link',
  },
  {
    label: 'Restaurant ordering',
    description:
      'Open the Misebox ordering tool with an available restaurant Menu.',
    to: '/tools/ordering',
    icon: 'i-lucide-shopping-bag',
  },
] as const
</script>

