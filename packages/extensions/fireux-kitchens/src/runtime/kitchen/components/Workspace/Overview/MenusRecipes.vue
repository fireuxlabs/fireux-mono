<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
    <UBreadcrumb
      :items="[
        { label: 'Kitchen', to: workspaceEntryPath },
        { label: 'Menus & Recipes' },
      ]"
      :ui="{ list: 'flex-wrap' }"
    />
    <h1 class="text-3xl font-semibold tracking-tight text-highlighted">
      Menus & Recipes
    </h1>
    <div class="grid gap-4 sm:grid-cols-2">
      <UCard v-for="item in entries" :key="item.key">
        <div class="flex h-full flex-col gap-4">
          <NuxtLink
            :to="item.to"
            :aria-label="item.label"
            class="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-primary"
          >
            <UIcon
              :name="item.icon || 'i-lucide-layout-grid'"
              class="size-6 text-primary"
            />
            <h2 class="flex-1 text-lg font-semibold text-highlighted">
              {{ item.label }}
            </h2>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 text-muted" />
          </NuxtLink>
          <ul class="space-y-2 text-sm text-muted">
            <li>
              <UButton
                :to="item.to"
                :label="
                  item.key === 'workspace-kitchen-dishes'
                    ? 'Browse Food'
                    : `Browse ${item.label}`
                "
                icon="i-lucide-search"
                color="neutral"
                variant="link"
                class="p-0"
              />
            </li>
            <li v-for="entry in toolsFor(item.key)" :key="entry.tool.id">
              <NuxtLink
                :to="item.to"
                :aria-label="`${entry.tool.label} — open ${item.label}`"
                :title="`Open ${item.label} to choose a record or use this tool`"
                class="hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
                >{{ entry.tool.label }}</NuxtLink
              >
            </li>
          </ul>
          <ul
            v-if="item.key === 'workspace-kitchen-dishes' && drinksRoute"
            class="space-y-2 text-sm text-muted"
          >
            <li>
              <UButton
                :to="drinksRoute.path"
                label="Browse Drinks"
                icon="i-lucide-search"
                color="neutral"
                variant="link"
                class="p-0"
              />
            </li>
            <li
              v-for="entry in toolsFor('workspace-kitchen-drinks')"
              :key="entry.tool.id"
            >
              <NuxtLink
                :to="drinksRoute.path"
                :aria-label="`${entry.tool.label} — open Drinks`"
                title="Open Drinks to choose a record or use this tool"
                class="hover:text-highlighted focus-visible:outline-2 focus-visible:outline-primary"
                >{{ entry.tool.label }}</NuxtLink
              >
            </li>
          </ul>
        </div>
      </UCard>
    </div>
    <component
      :is="Architecture"
      v-if="Architecture"
      :entries="entries"
      :drinks-route="drinksRoute?.path"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRouter } from '#imports'
import { useNav } from 'fireux-core/runtime/composables/navigation/useNav'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { kitchenCapabilityToolDirectory } from '../../../composables/workspace/useKitchenCapabilityTools'

const Architecture = import.meta.dev
  ? defineAsyncComponent(() => import('./MenusRecipesArchitecture.vue'))
  : null
const navigation = useNav(['workspace'])
const router = useRouter()
const entries = computed(() =>
  navigation.items.value
    .filter(
      (item) =>
        item.to.startsWith('/workspace/kitchen/') &&
        item.group === 'Menus & Recipes' &&
        !item.groupIndex
    )
    .sort((a, b) => a.order - b.order)
)
const drinksRoute = computed(() =>
  router
    .getRoutes()
    .find(
      (route) =>
        (route.meta.nav as { key?: string } | undefined)?.key ===
        'workspace-kitchen-drinks'
    )
)
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const toolsFor = (key?: string) =>
  kitchenCapabilityToolDirectory.filter(
    (entry) => `workspace-kitchen-${entry.operation}` === key
  )
</script>
