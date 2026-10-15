<template>
  <UPageCTA
    title="Products"
    description="Browse products, modules, and add-ons available for this app."
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
import { computed } from 'vue'
import { useProductPermissions } from '../../composables/useProductPermissions'

const { canManageProducts } = useProductPermissions()

const actions = computed(() => {
  const items = [
    {
      label: 'Related',
      cta: 'Browse blog',
      to: '/blog',
      icon: 'i-lucide-newspaper',
    },
  ]

  if (canManageProducts.value) {
    items.unshift({
      label: 'Create',
      cta: 'Create product',
      to: '/dashboard/admin/products/create',
      icon: 'i-lucide-plus',
    })
  }

  return items
})
</script>
