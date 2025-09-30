<!-- packages/core/fireux-core/src/runtime/layouts/CoreDefault.vue -->
<template>
  <div class="layout-wrapper">
    <LayoutsDefaultHeader
      :menu-bar-links="finalMenuBarLinks"
      :mobile-links="finalMobileLinks"
    />

    <main class="layout-main">
      <UContainer>
        <NuxtPage />
      </UContainer>
    </main>

    <LayoutsDefaultFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLink } from '../types/routeLink'
import { useCoreRoutes } from '../composables/app/routes/useCoreRoutes'
// Nuxt app config fallback for simpler tenant usage. This function is
// available at runtime via auto-import; we declare it for typing here.
declare function useAppConfig(): any

defineOptions({ name: 'CoreDefault' })

const props = withDefaults(
  defineProps<{
    // New, simpler API: pass all tenant links + id allow-lists,
    // and CoreDefault will filter and merge with core links.
    links?: RouteLink[]
    menuIds?: string[]
    mobileIds?: string[]
    // Back-compat: explicit pre-filtered routes from tenant
    routes?: {
      menuBarLinks?: RouteLink[]
      mobileLinks?: RouteLink[]
    }
  }>(),
  {
    links: undefined,
    menuIds: undefined,
    mobileIds: undefined,
    routes: undefined,
  }
)

// Core owns these ids
const { links } = useCoreRoutes()
const CORE_MENU_IDS = ['home', 'products', 'blog', 'users']
const CORE_MOBILE_IDS = [...CORE_MENU_IDS, 'user', 'admin']

const coreMenuBarLinks = computed<RouteLink[]>(() =>
  links.value.filter((r) => CORE_MENU_IDS.includes(r.id))
)
const coreMobileLinks = computed<RouteLink[]>(() =>
  links.value.filter((r) => CORE_MOBILE_IDS.includes(r.id))
)

// Merge helper: stable merge by id (core-first), drop duplicates
function mergeById(core: RouteLink[], tenant: RouteLink[]): RouteLink[] {
  const out: RouteLink[] = []
  const seen = new Set<string>()
  for (const item of core) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      out.push(item)
    }
  }
  for (const item of tenant) {
    if (!seen.has(item.id)) {
      seen.add(item.id)
      out.push(item)
    }
  }
  return out
}

// Resolve tenant-provided links
// Optional app config fallback: apps can define app.config.ts { coreLayout: { menuIds, mobileIds } }
const appConfig = (typeof useAppConfig === 'function' ? useAppConfig() : {}) as any
const configMenuIds: string[] | undefined = appConfig?.coreLayout?.menuIds
const configMobileIds: string[] | undefined = appConfig?.coreLayout?.mobileIds

const tenantMenuBarLinks = computed<RouteLink[]>(() => {
  if (props.routes?.menuBarLinks) return props.routes.menuBarLinks
  if (props.links) {
    // If menuIds provided (props or app config), filter by ids; else include all tenant links
    const ids = props.menuIds?.length ? props.menuIds : configMenuIds
    return ids?.length ? props.links.filter((r) => ids.includes(r.id)) : props.links
  }
  return []
})

const tenantMobileLinks = computed<RouteLink[]>(() => {
  if (props.routes?.mobileLinks) return props.routes.mobileLinks
  if (props.links) {
    const ids = props.mobileIds?.length ? props.mobileIds : configMobileIds
    return ids?.length ? props.links.filter((r) => ids.includes(r.id)) : props.links
  }
  return []
})

// Core-first, then tenant-provided, deduped by id
const finalMenuBarLinks = computed<RouteLink[]>(() =>
  mergeById(coreMenuBarLinks.value, tenantMenuBarLinks.value)
)

const finalMobileLinks = computed<RouteLink[]>(() =>
  mergeById(coreMobileLinks.value, tenantMobileLinks.value)
)
</script>
<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.layout-main {
  flex: 1;
  padding-block: var(--spacing-m);
}
</style>
