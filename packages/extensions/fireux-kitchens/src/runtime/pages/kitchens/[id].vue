<template>
  <NuxtPage v-if="hasChildRoute" />

  <UPage v-else>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          to="/kitchens"
        >
          Back
        </UButton>
        <UButton
          v-if="canEdit && kitchenId"
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-pencil"
          @click="goToEdit"
        >
          Edit
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="py-10 text-sm opacity-70">
        Loading kitchen...
      </div>

      <div v-else-if="!kitchen" class="space-y-2">
        <h1 class="text-lg font-semibold">Kitchen Not Found</h1>
        <p>The kitchen you are looking for does not exist.</p>
        <NuxtLink to="/kitchens" class="text-primary hover:underline">
          &larr; Back
        </NuxtLink>
      </div>

      <div v-else class="space-y-4">
        <KitchenCardsProfile
          v-if="kitchenProfile"
          :model="kitchenProfile"
        />

        <DevJson
          v-if="isDev && kitchen"
          :title="'Kitchen (Doc)'"
          context="Kitchen detail page · kitchens/[id] · hydrated kitchen doc"
          :data="kitchen"
          :default-open="false"
        />

        <UCard>
              <template #header>
                <div class="space-y-1">
                  <div class="text-sm font-semibold">Menus</div>
                  <p class="text-xs text-dimmed">
                    See available menus for this kitchen.
                  </p>
                </div>
              </template>

              <div class="space-y-3">
                <UButton
                  v-if="activeMenu && menuLink(activeMenu.id)"
                  size="sm"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-book-open-check"
                  :to="menuLink(activeMenu.id)"
                >
                  View active menu
                </UButton>

                <div v-if="sortedMenus.length" class="flex flex-wrap gap-2">
                  <UButton
                    v-for="menu in sortedMenus"
                    :key="menu.id"
                    size="xs"
                    variant="soft"
                    color="neutral"
                    :to="menuLink(menu.id)"
                  >
                    {{ menu.name || menu.id || 'Untitled menu' }}
                  </UButton>
                </div>

                <p v-else class="text-sm text-dimmed">
                  No menus available yet.
                </p>
              </div>
        </UCard>

        <UCard>
              <template #header>
                <div class="space-y-1">
                  <div class="text-sm font-semibold">Permissions</div>
                  <p class="text-xs text-dimmed">
                    Edit access follows kitchen claim ownership and app admin role.
                  </p>
                </div>
              </template>

              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge
                    size="xs"
                    variant="soft"
                    :color="canEdit ? 'primary' : 'neutral'"
                  >
                    {{ canEdit ? 'Can edit' : 'Read only' }}
                  </UBadge>
                  <UBadge v-if="isOwner" size="xs" variant="soft" color="emerald">
                    Owner
                  </UBadge>
                  <UBadge v-else-if="isAdmin" size="xs" variant="soft" color="primary">
                    Admin override
                  </UBadge>
                  <UBadge
                    v-if="claimedByLabel"
                    size="xs"
                    variant="soft"
                    color="neutral"
                  >
                    Claimed by: {{ claimedByLabel }}
                  </UBadge>
                </div>

                <p class="text-sm text-dimmed">
                  {{ permissionMessage }}
                </p>

                <div class="flex flex-wrap gap-2">
                  <UButton
                    v-if="canEdit && kitchenId"
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-pencil"
                    @click="goToEdit"
                  >
                    Edit kitchen
                  </UButton>
                  <UButton
                    v-if="showClaimButton"
                    size="xs"
                    variant="soft"
                    color="primary"
                    icon="i-lucide-key-round"
                    :loading="isClaiming"
                    :disabled="isClaiming"
                    @click="onClaimKitchen"
                  >
                    Claim this kitchen
                  </UButton>
                  <UButton
                    v-if="!canEdit && !showClaimButton"
                    size="xs"
                    variant="soft"
                    color="neutral"
                    icon="i-lucide-eye"
                  >
                    View only
                  </UButton>
                </div>
              </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlaceClaim } from 'fireux-places/runtime/composables/fireux/firestore/place/mutations/usePlaceClaim'
import { computed, ref, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { resolveKitchenConsoleCollectionPath } from '../../composables/fireux/app/kitchen-console/shared'
import { useKitchenCollection } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useKitchenInterface } from '../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../models/kitchen.model'
import type { Menu } from '../../models/menu.model'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View a saved kitchen.',
  head: { title: 'Kitchen' },
  name: 'KitchensDetailPage',
})

const { appId, appName } = useFireUXConfig()
const route = useRoute()
const hasChildRoute = computed(() => {
  const path = String(route.path || '').trim()
  return /\/kitchens\/[^/]+\/menu(?:\/|$)/.test(path)
})

const kitchenRouteKey = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw)
    ? String(raw[0] ?? '').trim()
    : String(raw ?? '').trim()
})

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed<Kitchen | null>(() => {
  const key = kitchenRouteKey.value
  if (!key) return null
  const keyLower = key.toLowerCase()
  const list = kitchens.value ?? []
  const found = list.find((entry) => {
    const id = String(entry?.id ?? '').trim()
    const slug = String((entry as any)?.slug ?? '').trim().toLowerCase()
    return id === key || (slug.length > 0 && slug === keyLower)
  })
  return found ?? null
})

const kitchenId = computed(() => String(kitchen.value?.id ?? '').trim())
const loading = computed(() => Boolean(kitchenRouteKey.value) && kitchensPending.value)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const basePath = resolveKitchenConsoleCollectionPath(appId)
    const path = nextKitchenId ? `${basePath}/${nextKitchenId}/menus` : ''
    menusRef.value = path ? firestoreFetchCollection<Menu>(path) : null
  },
  { immediate: true }
)

const menus = computed(() => menusRef.value?.value ?? [])
const sortedMenus = computed(() =>
  [...menus.value].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      String(a?.name || '').localeCompare(String(b?.name || ''))
  )
)
const activeMenu = computed(() => sortedMenus.value.find((menu) => Boolean(menu?.active)) || null)
const menuLink = (menuIdRaw: unknown) => {
  const resolvedKitchenId = String(kitchenId.value || '').trim()
  const menuId = String(menuIdRaw || '').trim()
  if (!resolvedKitchenId || !menuId) return ''
  return `/kitchens/${encodeURIComponent(resolvedKitchenId)}/menu/${encodeURIComponent(menuId)}`
}

const { profile } = useKitchenInterface()
const kitchenProfile = computed(() => profile(kitchen.value))

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => String(kitchen.value?.claimed_by || '').trim())
const claimedByLabel = computed(() => claimedBy.value || '')
const isOwner = computed(() => Boolean(claimedBy.value && currentUser.value?.id === claimedBy.value))
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || isOwner.value)
})

const permissionMessage = computed(() => {
  if (canEdit.value) {
    return 'You can edit this kitchen.'
  }
  if (!claimedBy.value) {
    return 'This kitchen is not claimed yet. Claim it to unlock console tools, edit access, and team features.'
  }
  return 'This kitchen is claimed by another user. You can view details but cannot edit.'
})

const { claimPlace } = usePlaceClaim()
const toast = useToastify()
const isClaiming = ref(false)
const showClaimButton = computed(() => !claimedBy.value)

const onClaimKitchen = async () => {
  if (isClaiming.value) return
  const targetId = kitchenId.value
  if (!targetId) return
  isClaiming.value = true
  try {
    await claimPlace(targetId)
    toast.success('Kitchen claimed')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to claim kitchen: ${message}`)
  } finally {
    isClaiming.value = false
  }
}

const pageTitle = computed(() => kitchen.value?.name || 'Kitchen')
const pageDescription = computed(() =>
  kitchen.value?.short_address || kitchen.value?.formatted_address || 'Kitchen details.'
)
const isDev = import.meta.dev

const goToEdit = async () => {
  if (!kitchenId.value) return
  await navigateTo(`/kitchens/edit/${encodeURIComponent(kitchenId.value)}`)
}

useHead({
  title: computed(() => `${appName} | ${pageTitle.value}`),
})
</script>
