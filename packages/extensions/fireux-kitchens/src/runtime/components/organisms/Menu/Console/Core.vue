<template>
  <section class="space-y-4">
    <UCard v-if="menusSorted.length">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Menu Profiles</div>
          <p class="console-card-header__description">
            Lightweight operator preview of the selected kitchen's service menus.
          </p>
        </div>
      </template>

      <div class="space-y-4">
        <OrganismsMenuConsoleCard
          v-for="menu in menusSorted"
          :key="menu.id || menu.name"
          :menu="menu"
          :dishes="dishes"
        />
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menus"
      description="No menus are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    collection?: Menu[]
    dishes?: Dish[]
  }>(),
  {
    collection: () => [],
    dishes: () => [],
  }
)

const menusSorted = computed(() =>
  [...props.collection].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
</script>
