<template>
  <section
    id="menus"
    class="scroll-mt-24 space-y-5"
    aria-labelledby="kitchen-menus-title"
    data-kitchen-menus
  >
    <h2
      id="kitchen-menus-title"
      class="text-2xl font-semibold tracking-tight text-highlighted"
    >
      Menus
    </h2>
    <div
      v-if="menusLoading"
      class="grid gap-4 sm:grid-cols-2"
      aria-label="Loading menus"
      aria-busy="true"
    >
      <USkeleton v-for="item in 2" :key="item" class="h-36 rounded-2xl" />
    </div>
    <UAlert
      v-else-if="menusUnavailable"
      title="Menus are unavailable right now."
      icon="i-lucide-circle-alert"
      color="error"
      variant="soft"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          @click="menuIndex.refresh()"
        />
        <MoleculesCopyError message="Menus are unavailable right now." />
      </template>
    </UAlert>
    <div
      v-else-if="!menus.length"
      class="rounded-2xl border border-dashed border-default px-6 py-10 text-center text-muted"
    >
      <UIcon name="i-lucide-book-open" class="mb-3 size-6" aria-hidden="true" />
      <p>No published menus yet.</p>
    </div>
    <div
      v-else
      class="grid gap-4"
      :class="{ 'xl:grid-cols-2': menus.length > 1 }"
    >
      <MenuCardsPreview
        v-for="menu in menus"
        :key="menu.id"
        :menu="menu"
        :route-scope="menuRouteScope"
      />
    </div>
    <div v-if="hasMoreMenus" class="flex justify-center">
      <UButton
        label="Load more menus"
        color="neutral"
        variant="soft"
        :loading="menuIndex.loadingMore.value"
        @click="menuIndex.loadMore()"
      />
    </div>
    <UAlert
      v-if="menuIndex.loadMoreError.value"
      title="More menus could not be loaded. Please try again."
      color="error"
      variant="soft"
    >
      <template #actions
        ><MoleculesCopyError
          message="More menus could not be loaded. Please try again."
      /></template>
    </UAlert>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuDirectoryController } from '../../../menu/composables/useMenuDirectory'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.response'
import { directoryMenuRouteScope } from '../../utils/kitchen-menu-route'

const props = defineProps<{
  kitchen: KitchenDetailPresentation
  index: MenuDirectoryController
}>()

const kitchenSlug = computed(() => props.kitchen.slug.trim())
const menuRouteScope = computed(() =>
  directoryMenuRouteScope(kitchenSlug.value)
)
const menuIndex = props.index

const menusLoading = computed(() => menuIndex.pending.value)
const menusUnavailable = computed(
  () => menuIndex.directoryOutcome.value.kind === 'unavailable'
)
const hasMoreMenus = computed(() => menuIndex.hasMore.value)
const menus = menuIndex.collection
</script>

<style scoped>
[data-kitchen-menus] {
  min-width: 0;
}
</style>
