<template>
  <div class="space-y-4">
    <UButton
      to="/console/kitchen/menus"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to menus
    </UButton>

    <UAlert
      v-if="!menu"
      color="neutral"
      variant="soft"
      :title="sectionsPending ? 'Loading menu' : 'Menu not found'"
      description="Choose an existing menu from the Menus page."
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">{{ menu.name }}</h2>
            <p class="text-sm text-dimmed">{{ menu.description || 'No description yet.' }}</p>
          </div>
          <UBadge :color="menu.status === 'published' ? 'success' : 'warning'" variant="soft">
            {{ menu.status }}
          </UBadge>
        </div>
      </template>

      <div v-if="sections.length" class="space-y-3">
        <article
          v-for="section in sections"
          :key="section.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-default bg-default p-3"
        >
          <div>
            <h3 class="text-sm font-semibold text-highlighted">{{ section.label }}</h3>
            <p v-if="section.description" class="text-sm text-dimmed">
              {{ section.description }}
            </p>
          </div>
          <UButton
            size="sm"
            variant="soft"
            icon="i-lucide-utensils"
            :to="`/console/kitchen/menus/${encodeURIComponent(menuId)}/${encodeURIComponent(section.id)}`"
          >
            Items
          </UButton>
        </article>
      </div>

      <p v-else class="text-sm text-dimmed">
        No sections yet. Add one below before publishing.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenu } from '../../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'

const { menu, menuId, sections, sectionsPending } = useKitchenConsoleMenu()
</script>
