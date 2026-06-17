<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Upload or browse public menu doorways."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        family="utility-managed"
        cta="Upload a menu document, keep a stable QR path, and move it into a kitchen when it is ready."
        :count-label="countLabel"
      />

      <UPageCard
        title="Upload Menu"
        description="Create a public menu doorway first. Kitchen, dishes, and translations can come later."
        variant="subtle"
      >
        <ProviderGoQrTools
          tool="doc"
          :payload="uploadTool"
          :auth-token="authToken"
        />
      </UPageCard>

      <MenuCollectionManager
        :collection="publicMenus"
        title="Uploaded Menus"
        description="Browse menu doorways that can stay simple or grow into kitchen menus."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'
import type { PublicMenu } from '../../composables/fireux/public/menu/usePublicMenuFetch'

definePageMeta({
  tag: 'menus',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'MenusIndexPage',
  title: 'Menus',
  description: 'Upload or browse public menu doorways.',
})

const pageTitle = 'Menus'
const { appName } = useFireUXConfig()
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
const {
  data: waitingData,
} = await useAsyncData(
  'public-menus',
  () => $fetch<PublicMenu[]>('/api/menus')
)
const publicMenus = computed(() => waitingData.value ?? [])
const countLabel = computed(() => `${publicMenus.value.length} menus`)

watch(currentUser, async (user) => {
  authToken.value = import.meta.client && user ? await user.getIdToken() : ''
}, { immediate: true })

useHead({ title: `${appName} | ${pageTitle}` })
</script>
