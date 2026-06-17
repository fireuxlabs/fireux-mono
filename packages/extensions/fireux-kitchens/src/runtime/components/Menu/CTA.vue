<template>
  <UPageCard
    title="Upload Menu"
    description="Create a public menu doorway first. Kitchen, dishes, and translations can come later."
    variant="subtle"
  >
    <div class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <UBadge color="neutral" variant="soft">
          {{ countLabel }}
        </UBadge>
        <UBadge color="primary" variant="soft">
          QR ready
        </UBadge>
      </div>

      <ProviderGoQrTools
        tool="doc"
        :payload="uploadTool"
        :auth-token="authToken"
      />
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'

withDefaults(defineProps<{
  countLabel?: string
}>(), {
  countLabel: '0 menus',
})

const { currentUser } = useAuth()
const authToken = ref('')
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

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })
</script>
