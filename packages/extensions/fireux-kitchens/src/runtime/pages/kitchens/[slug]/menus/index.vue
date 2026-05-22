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
      <OrganismsMenuSproochliLanguageTrigger
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
        <h2 class="text-lg font-semibold text-highlighted">{{ menu.name || menu.id }}</h2>
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
import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import {
  normalizePublicKitchenLanguage,
  resolvePublicKitchenLanguageOptions,
} from '../../../../composables/fireux/app/public-kitchen-language'
import { useKitchenMenuCollection } from '../../../../composables/fireux/console/kitchen/operations/menu/fetch/useKitchenMenuCollection'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import OrganismsMenuSproochliLanguageTrigger from '../../../../components/organisms/Menu/SproochliLanguageTrigger.vue'
import type { Menu } from '../../../../models/menu.model'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const slug = computed(() => String(route.params.slug || '').trim())
const clean = (value: unknown) => String(value ?? '').trim()
const cleanKey = (value: unknown) => clean(value).toLowerCase()
const queryString = (value: unknown) =>
  Array.isArray(value) ? clean(value[0]) : clean(value)
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const publicConfig = runtimeConfig.public as Record<string, unknown>
const fireuxConfig = asRecord(publicConfig.fireux)
const miseboxConfig = asRecord(fireuxConfig.misebox)
const publicMenuConfig = asRecord(miseboxConfig.publicMenu)
const runtimeSproochli = asRecord(fireuxConfig.sproochli)
const runtimeSproochliEnabled = computed(() => runtimeSproochli.enabled !== false)
const publicMenuSproochliEnabled = computed(() => publicMenuConfig.sproochli !== false)

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed(
  () =>
    kitchens.value.find(
      (item) => cleanKey((item as any).slug) === cleanKey(slug.value)
    ) ?? null
)
const kitchenId = computed(() => clean(kitchen.value?.id))
const languageSettings = computed(() => asRecord((kitchen.value as any)?.language_settings))
const kitchenSproochliEnabled = computed(() => languageSettings.value.sproochli !== false)
const sproochliEnabled = computed(
  () =>
    runtimeSproochliEnabled.value &&
    publicMenuSproochliEnabled.value &&
    kitchenSproochliEnabled.value
)
const selectedLanguage = computed(() =>
  sproochliEnabled.value
    ? normalizePublicKitchenLanguage(
        queryString(route.query.sproochli)
      )
    : ''
)
const languageOptions = computed(() =>
  sproochliEnabled.value
    ? resolvePublicKitchenLanguageOptions(kitchen.value)
    : []
)
const publicLanguageQuery = computed(() =>
  selectedLanguage.value ? `?sproochli=${encodeURIComponent(selectedLanguage.value)}` : ''
)
const menuRead = useKitchenMenuCollection(kitchenId, {
  kitchenCollectionPath: 'kitchens',
})
const menuIsPublicVisible = (menu: Menu) => {
  if ((menu as any).active === false) return false

  const status = clean(menu.status).toLowerCase()
  if (!status) return true
  return !['archived', 'draft', 'inactive', 'private'].includes(status)
}
const menus = computed(() =>
  [...menuRead.menus.value]
    .filter(menuIsPublicVisible)
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        String(a.name || '').localeCompare(String(b.name || ''))
    )
)
const pending = computed(
  () => kitchensPending.value || (Boolean(kitchenId.value) && menuRead.pending.value)
)
const menuLink = (menuId: Menu['id']) =>
  `/kitchens/${encodeURIComponent(slug.value)}/menus/${encodeURIComponent(clean(menuId))}${publicLanguageQuery.value}`
</script>
