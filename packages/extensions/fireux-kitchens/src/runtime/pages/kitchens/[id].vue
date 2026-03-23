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

      <div v-else class="space-y-6">
        <section class="fireux-page-hero">
          <div class="fireux-page-hero__grid">
            <div class="fireux-page-hero__content">
              <div class="fireux-page-hero__eyebrow">
                Kitchen
              </div>

              <div class="space-y-3">
                <h2 class="fireux-page-hero__title">
                  {{ pageTitle }}
                </h2>
                <p class="fireux-page-hero__description">
                  {{ heroDescription }}
                </p>
              </div>

              <div class="fireux-page-hero__badges">
                <UBadge
                  size="sm"
                  variant="soft"
                  :color="canEdit ? 'primary' : 'neutral'"
                >
                  {{ canEdit ? 'Editable' : 'Read only' }}
                </UBadge>
                <UBadge
                  v-if="kitchenProfile?.verified"
                  size="sm"
                  variant="soft"
                  color="emerald"
                >
                  Verified
                </UBadge>
                <UBadge
                  v-if="kitchenSourceLabel"
                  size="sm"
                  variant="soft"
                  color="neutral"
                >
                  {{ kitchenSourceLabel }}
                </UBadge>
                <UBadge
                  v-if="claimedByLabel"
                  size="sm"
                  variant="soft"
                  color="neutral"
                >
                  Claimed by {{ claimedByLabel }}
                </UBadge>
              </div>

              <div class="fireux-page-hero__actions">
                <UButton
                  v-if="activeMenu && menuLink(activeMenu.id)"
                  color="primary"
                  icon="i-lucide-book-open-check"
                  :to="menuLink(activeMenu.id)"
                >
                  View active menu
                </UButton>
                <UButton
                  v-if="showClaimButton"
                  color="primary"
                  variant="soft"
                  icon="i-lucide-key-round"
                  :loading="isClaiming"
                  :disabled="isClaiming"
                  @click="onClaimKitchen"
                >
                  Claim this kitchen
                </UButton>
                <UButton
                  v-else-if="canEdit && kitchenId"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-pencil"
                  @click="goToEdit"
                >
                  Edit kitchen
                </UButton>
                <UButton
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-chevrons-left-right-ellipsis"
                  to="/kitchens"
                >
                  Browse kitchens
                </UButton>
              </div>

              <div class="fireux-page-hero__facts text-sm text-dimmed">
                <span v-if="kitchenProfile?.address">{{ kitchenProfile.address }}</span>
                <span v-if="kitchenProfile?.website">
                  {{ kitchenProfile.website }}
                </span>
              </div>
            </div>

            <div class="space-y-4">
              <div class="fireux-page-hero__visual">
                <img
                  v-if="heroImageUrl"
                  :src="heroImageUrl"
                  :alt="pageTitle"
                >
                <div v-else class="flex h-full items-center justify-center text-sm text-dimmed">
                  Kitchen imagery coming soon
                </div>
                <div class="fireux-page-hero__visual-overlay">
                  <div class="text-sm font-semibold">
                    {{ kitchenProfile?.prop || pageTitle }}
                  </div>
                  <div class="text-xs opacity-80">
                    {{ heroLocation }}
                  </div>
                </div>
              </div>

              <div class="fireux-page-hero__stats">
                <div class="fireux-page-hero__stat">
                  <div class="fireux-page-hero__stat-value">
                    {{ sortedMenus.length }}
                  </div>
                  <div class="fireux-page-hero__stat-label">
                    Published menus
                  </div>
                </div>
                <div class="fireux-page-hero__stat">
                  <div class="fireux-page-hero__stat-value">
                    {{ claimedByLabel ? 'Claimed' : 'Open' }}
                  </div>
                  <div class="fireux-page-hero__stat-label">
                    Ownership state
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.95fr)]">
          <div class="space-y-6">
            <KitchenCardsProfile
              v-if="kitchenProfile"
              class="fireux-page-surface"
              :model="kitchenProfile"
            />

            <DevJson
              v-if="isDev && kitchen"
              :title="'Kitchen (Doc)'"
              context="Kitchen detail page · kitchens/[id] · hydrated kitchen doc"
              :data="kitchen"
              :default-open="false"
            />
          </div>

          <div class="space-y-6">
            <UCard class="fireux-page-surface">
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

            <UCard class="fireux-page-surface">
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
        </div>
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
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
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

const { appName } = useFireUXConfig()
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

const { kitchens } = useKitchenFetch()
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
const loading = computed(() => Boolean(kitchenRouteKey.value) && kitchens.value === undefined)

const { firestoreFetchCollection } = useFirestoreRead()
const menusRef = shallowRef(null) as ShallowRef<Ref<Menu[] | undefined> | null>

watch(
  kitchenId,
  (nextKitchenId) => {
    const path = nextKitchenId ? `kitchens/${nextKitchenId}/menus` : ''
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
const kitchenSourceLabel = computed(() =>
  kitchenProfile.value?.source === 'fireux'
    ? 'FireUX'
    : kitchenProfile.value?.source === 'manual'
      ? 'Manual'
      : kitchenProfile.value?.source === 'google'
        ? 'Google'
        : ''
)
const heroImageUrl = computed(() =>
  kitchenProfile.value?.coverImage ||
  kitchenProfile.value?.galleryImages?.[0] ||
  kitchenProfile.value?.imageUrl ||
  ''
)
const heroLocation = computed(() =>
  kitchenProfile.value?.address ||
  kitchenProfile.value?.subtitle ||
  'Kitchen profile'
)

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
const heroDescription = computed(() =>
  kitchenProfile.value?.about ||
  kitchenProfile.value?.prop ||
  pageDescription.value ||
  'Discover this kitchen, its menus, and the team tools behind it.'
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
