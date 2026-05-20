<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UButton
      :to="`/kitchens/${encodeURIComponent(slug)}`"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to kitchen
    </UButton>

    <header class="space-y-2">
      <p class="text-sm font-medium uppercase tracking-wide text-dimmed">Menus</p>
      <h1 class="text-3xl font-semibold text-highlighted">
        {{ kitchen?.name || 'Kitchen menus' }}
      </h1>
    </header>

    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <UAlert
      v-else-if="!kitchen"
      color="neutral"
      variant="soft"
      title="Kitchen unavailable"
      description="This kitchen could not be found."
    />

    <div v-else-if="menus.length" class="space-y-3">
      <NuxtLink
        v-for="menu in menus"
        :key="menu.id"
        :to="`/kitchens/${encodeURIComponent(slug)}/menus/${encodeURIComponent(menu.id)}`"
        class="block rounded-xl border border-default bg-default p-4 transition hover:bg-elevated"
      >
        <h2 class="text-lg font-semibold text-highlighted">{{ menu.name }}</h2>
        <p v-if="menu.description" class="mt-1 text-sm text-dimmed">
          {{ menu.description }}
        </p>
      </NuxtLink>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No published menus"
      description="This kitchen has not published a menu yet."
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { usePublicKitchenMenu } from '../../../../composables/fireux/app/usePublicKitchenMenu'

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())
const { kitchen, menus, pending } = usePublicKitchenMenu(slug)
</script>
