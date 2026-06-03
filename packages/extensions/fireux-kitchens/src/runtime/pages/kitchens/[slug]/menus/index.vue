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
        {{ kitchenTitle }}
      </h1>
      <MenuSproochliLanguageTrigger
        class="pt-2"
        :language-options="languageOptions"
        :selected-language="selectedLanguage"
      />
    </header>

    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div
      v-else-if="!kitchen"
      class="rounded-lg border border-default bg-muted p-4"
    >
      <h2 class="text-base font-semibold text-highlighted">Kitchen unavailable</h2>
      <p class="mt-1 text-sm text-dimmed">This kitchen could not be found.</p>
    </div>

    <div v-else-if="menus.length" class="space-y-3">
      <NuxtLink
        v-for="menu in menus"
        :key="menu.id"
        :to="menuLink(menu.id)"
        class="block rounded-xl border border-default bg-default p-4 transition hover:bg-elevated"
      >
        <h2 class="text-lg font-semibold text-highlighted">{{ menu.name }}</h2>
        <p v-if="menu.description" class="mt-1 text-sm text-dimmed">
          {{ menu.description }}
        </p>
      </NuxtLink>
    </div>

    <div
      v-else
      class="rounded-lg border border-default bg-muted p-4"
    >
      <h2 class="text-base font-semibold text-highlighted">No published menus</h2>
      <p class="mt-1 text-sm text-dimmed">This kitchen has not published a menu yet.</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useKitchenPublicMenuIndex } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuIndex'

const {
  slug,
  kitchen,
  menus,
  pending,
  languageOptions,
  selectedLanguage,
  menuLink,
  kitchenTitle,
} = useKitchenPublicMenuIndex()
</script>
