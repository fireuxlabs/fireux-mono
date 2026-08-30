<template>
  <UPageCard
    title="Start with a menu QR"
    description="Use a light menu link today. When you are ready to manage menus, ordering, and more, create a Kitchen Workspace."
    variant="subtle"
  >
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge v-if="countLabel" color="neutral" variant="soft">
          {{ countLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft"> QR ready </UBadge>
      </div>

      <AppToolFoldaway
        title="Option 1: Upload a menu file"
        description="No kitchen needed. Add a photo, PDF, or document and get a menu link."
        provider="Go QR"
        open
      >
        <ProviderGoQrTools
          tool="doc"
          :payload="uploadTool"
          :auth-token="authToken"
        />
      </AppToolFoldaway>

      <AppToolFoldaway
        title="Option 2: Use an existing menu URL"
        description="No kitchen needed. Paste a menu link that already exists online and create a printable QR code."
        provider="Go QR"
      >
        <div class="space-y-3">
          <p class="text-sm text-muted">
            Input: menu URL. Output: printable QR code for that URL.
          </p>
          <UButton
            to="/solutions/qr-menu-url"
            icon="i-lucide-link"
            variant="soft"
          >
            Open URL QR tool
          </UButton>
        </div>
      </AppToolFoldaway>

      <AppToolFoldaway
        title="Option 3: Create a Kitchen Workspace"
        description="Manage all your menus, customer ordering, and more."
        provider="Misebox"
      >
        <KitchenCreate />
      </AppToolFoldaway>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'

withDefaults(
  defineProps<{
    countLabel?: string
  }>(),
  {
    countLabel: '',
  }
)

const { currentUser } = useAuth()
const authToken = ref('')
const consumerOrigin = computed(() =>
  import.meta.client ? window.location.origin : ''
)
const uploadTool = computed(() => ({
  copy: {
    title: 'Upload a menu',
    description: 'Add your menu file and choose the link people will scan.',
    ctaLabel: 'Upload menu',
    loadingLabel: 'Uploading menu...',
    openTargetLabel: 'Open menu',
  },
  upload: {
    fileLabel: 'Menu file',
    accept: 'application/pdf,image/*,.doc,.docx',
    hint: 'Photo, PDF, DOC, or DOCX. Max 10 MB.',
  },
  slug: {
    label: 'Menu link',
    placeholder: 'lunch-menu',
    takenMessage: 'That menu link is already taken.',
  },
  preview: {
    baseUrl: `${consumerOrigin.value}/menus`,
    pathSuffix: '/qr',
    message: 'Your QR code will open this menu.',
  },
  endpoints: {
    create: `${consumerOrigin.value}/api/menus/create`,
    availability: `${consumerOrigin.value}/api/menus/availability`,
  },
}))

watch(
  currentUser,
  async (user: { getIdToken: () => Promise<string> } | null) => {
    authToken.value = import.meta.client && user ? await user.getIdToken() : ''
  },
  { immediate: true }
)
</script>
