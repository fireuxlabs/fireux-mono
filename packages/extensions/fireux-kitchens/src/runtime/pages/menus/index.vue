<template>
  <main class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <UPageHeader
      class="pageheader"
      :title="kitchenName"
      :description="pageDescription"
    />

    <div v-if="!kitchen && !pending" class="space-y-4">
      <UPageCard
        title="Upload menu"
        description="Upload a menu while it is waiting for a kitchen. The menu can be attached to a kitchen later without changing the public path."
        variant="subtle"
      >
        <ProviderGoQrTools
          tool="doc"
          :payload="uploadTool"
          :auth-token="authToken"
        />
      </UPageCard>

      <UPageCard variant="subtle">
        <template #header>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-highlighted">
                Waiting menus
              </h2>
              <p class="text-sm text-dimmed">
                Menu documents uploaded before they are attached to a kitchen.
              </p>
            </div>
            <UBadge variant="soft">
              {{ waitingMenus.length }} menus
            </UBadge>
          </div>
        </template>

        <UPageCard
          v-if="waitingPending"
          title="Loading menus"
          description="Checking uploaded menu documents."
          variant="subtle"
        />

        <UPageCard
          v-else-if="waitingError"
          title="Menus unavailable"
          description="The waiting menu list could not be loaded."
          variant="subtle"
        />

        <UPageCard
          v-else-if="!waitingMenus.length"
          title="No waiting menus"
          description="Uploaded menus will appear here."
          variant="subtle"
        />

        <div v-else class="grid gap-3 sm:grid-cols-2">
          <UPageCard
            v-for="menu in waitingMenus"
            :key="menu.id"
            variant="subtle"
          >
            <template #header>
              <div class="min-w-0">
                <h3 class="text-base font-semibold text-highlighted">
                  {{ menu.name }}
                </h3>
                <p class="mt-1 text-sm text-dimmed">
                  {{ menu.description || 'Uploaded menu document.' }}
                </p>
              </div>
            </template>

            <p class="text-xs text-dimmed">
              {{ menu.kind || 'menu' }}
            </p>

            <template #footer>
              <div class="flex flex-wrap gap-2">
                <UButton size="xs" :to="menu.path">
                  Open menu
                </UButton>
                <UButton size="xs" variant="ghost" :to="menu.qr_path">
                  QR
                </UButton>
              </div>
            </template>
          </UPageCard>
        </div>
      </UPageCard>
    </div>

    <div v-else class="space-y-3">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menus...</p>
      </UPageCard>

      <UAlert
        v-if="!pending && !kitchen"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This app does not have a single public kitchen menu surface."
      />

      <template v-if="!pending && kitchen && menus.length">
        <UPageCard
          v-for="menu in menus"
          :key="menu.id"
          variant="subtle"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="min-w-0 space-y-1">
              <h2 class="text-lg font-semibold text-highlighted">
                {{ menu.name }}
              </h2>
              <p v-if="menu.description" class="text-sm text-dimmed">
                {{ menu.description }}
              </p>
            </div>

            <UButton
              :to="menuLink(menu.id)"
              icon="i-lucide-arrow-right"
              trailing
            >
              Open
            </UButton>
          </div>
        </UPageCard>
      </template>

      <UAlert
        v-if="!pending && kitchen && !menus.length"
        color="neutral"
        variant="soft"
        title="No published menus"
        description="This kitchen has not published a menu yet."
      />
    </div>

    <DevJson
      title="Kitchen menus index debug"
      context="Kitchen menu index · /menus"
      :data="debug"
      :default-open="false"
    />
  </main>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'
import { useKitchenPublicSingleMenuScope } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicSingleMenuScope'

type WaitingMenuSummary = {
  id: string
  name: string
  description: string
  kind: string
  path: string
  qr_path: string
}

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenusIndexPage',
})

const {
  kitchen,
  menus,
  pending,
  menuLink,
  debug,
} = useKitchenPublicSingleMenuScope()
const { currentUser } = useAuth()
const authToken = ref('')
const kitchenName = computed(
  () => String(kitchen.value?.display_name || kitchen.value?.name || 'Menus')
)
const pageDescription = computed(() =>
  kitchen.value
    ? 'Published menus.'
    : 'Upload or browse menus waiting for a kitchen.'
)
const consumerOrigin = computed(() =>
  import.meta.client ? window.location.origin : ''
)
const uploadTool = computed(() => ({
  copy: {
    title: 'Upload menu',
    description: 'Upload a menu document before it is attached to a kitchen.',
    ctaLabel: 'Create menu',
    loadingLabel: 'Creating menu...',
    openTargetLabel: 'Open menu',
  },
  upload: {
    fileLabel: 'Menu file',
    accept: 'application/pdf,image/*,.doc,.docx',
    hint: 'Photo, PDF, DOC, or DOCX. Max 10 MB.',
  },
  slug: {
    label: 'Menu path',
    placeholder: 'my-menu',
    takenMessage: 'This menu path is already taken.',
  },
  preview: {
    baseUrl: `${consumerOrigin.value}/menus`,
    pathSuffix: '/qr',
    message: 'This menu will wait here until it is attached to a kitchen.',
  },
  endpoints: {
    create: `${consumerOrigin.value}/api/menus/create`,
    availability: `${consumerOrigin.value}/api/menus/availability`,
  },
}))
const {
  data: waitingData,
  pending: waitingPending,
  error: waitingError,
} = await useAsyncData(
  'kitchen-waiting-menus',
  () => $fetch<WaitingMenuSummary[]>('/api/menus')
)
const waitingMenus = computed(() => waitingData.value ?? [])

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
