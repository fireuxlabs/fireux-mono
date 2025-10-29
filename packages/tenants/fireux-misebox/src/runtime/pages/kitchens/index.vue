<!-- packages/tenants/fireux-misebox/src/runtime/pages/kitchens/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Kitchens"
      description="Misebox kitchens mirror the stored places your team curates."
      :badge="headerBadge"
    >
      <template #extra>
        <div class="flex flex-wrap gap-2">
          <UButton
            color="primary"
            icon="i-lucide-map-pin"
            variant="soft"
            to="/places"
          >
            Manage places
          </UButton>
          <UButton
            color="gray"
            icon="i-lucide-plus"
            variant="ghost"
            to="/kitchens/create"
          >
            Kitchen setup
          </UButton>
        </div>
      </template>
    </UPageHeader>

    <UContainer class="max-w-5xl space-y-8 py-8">
      <section v-if="isLoading" class="space-y-4">
        <USkeleton class="h-28 w-full rounded-xl" />
        <USkeleton class="h-28 w-full rounded-xl" />
        <USkeleton class="h-28 w-full rounded-xl" />
      </section>

      <section
        v-else-if="displayKitchens.length === 0"
        class="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-500 dark:border-gray-700"
      >
        <p class="mb-3 text-base font-medium text-gray-700">
          No kitchens are linked yet.
        </p>
        <p class="mb-6">
          Save a place from the Places workspace or migrate an existing record
          to see it here instantly.
        </p>
        <UButton color="primary" icon="i-lucide-map" to="/places">
          Open Places workspace
        </UButton>
      </section>

      <section v-else class="space-y-4">
        <UCard
          v-for="kitchen in displayKitchens"
          :key="kitchen.id"
          class="shadow-sm"
          :ui="{
            body: 'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
          }"
        >
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-cooking-pot"
                class="h-5 w-5 text-primary-500"
              />
              <NuxtLink
                :to="`/kitchens/${kitchen.id}`"
                class="text-lg font-semibold text-gray-900 hover:text-primary-500 dark:text-white"
              >
                {{ kitchen.name }}
              </NuxtLink>
            </div>
            <p v-if="kitchen.description" class="text-sm text-gray-500">
              {{ kitchen.description }}
            </p>
            <div
              v-if="kitchen.appLabel"
              class="flex items-center gap-2 text-xs text-gray-500"
            >
              <UBadge size="xs" variant="soft" color="primary">
                {{ kitchen.appLabel }}
              </UBadge>
              <span
                v-if="kitchen.app_id"
                class="font-mono text-[11px] text-gray-400"
              >
                {{ kitchen.app_id }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UButton
              color="primary"
              variant="solid"
              size="sm"
              icon="i-lucide-arrow-right"
              :to="`/kitchens/${kitchen.id}`"
            >
              View details
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              size="sm"
              icon="i-lucide-navigation"
              :to="`/places/${kitchen.id}`"
            >
              Place record
            </UButton>
          </div>
        </UCard>
      </section>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from 'nuxt/app'
import { useKitchens } from '../../composables/firestore/objects/Kitchen/useKitchens'
import { useApp } from 'fireux-core/runtime/composables/firestore/core/app/useApp.ts'

const { kitchens, isLoaded } = useKitchens()
const { app: currentApp } = useApp()

const appLookup = computed(() => {
  const map = new Map<string, string>()
  const app = currentApp.value
  if (app?.id) {
    map.set(app.id, app.app_name ?? app.id)
  }
  return map
})

const displayKitchens = computed(() =>
  kitchens.value.map((kitchen) => ({
    ...kitchen,
    appLabel: kitchen.app_id
      ? appLookup.value.get(kitchen.app_id) ?? null
      : null,
  }))
)

const isLoading = computed(() => !isLoaded.value)
const kitchenCount = computed(() => displayKitchens.value.length)
const headerBadge = computed(() =>
  isLoading.value ? undefined : `${kitchenCount.value}`
)

useHead({
  title: 'Kitchens · Misebox',
})
</script>
