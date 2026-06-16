<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Browse QR menu documents uploaded through Misebox."
    />

    <UPageBody class="pagebody">
      <UPageCard
        title="Simple QR menu documents"
        description="Use this for quick public menu sharing. Upload a finished menu document, give it a short path, then print or share its QR page."
        variant="subtle"
      >
        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              to="/solutions/qr-menu"
              icon="i-lucide-upload"
            >
              Upload menu document
            </UButton>
            <UButton
              to="/kitchens"
              icon="i-lucide-chef-hat"
              variant="ghost"
            >
              Kitchen menus
            </UButton>
          </div>
        </template>
      </UPageCard>

      <UploadedMenuCollectionManager
        :collection="menus"
        :pending="pending"
        :error="Boolean(error)"
        title="QR menu documents"
        description="Root uploaded menu documents with public menu and QR pages."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { UploadedMenuSummary } from '../../composables/menus/useUploadedMenuInterface'

definePageMeta({
  layout: 'default',
  index: false,
  sitemap: false,
  name: 'UploadedMenusIndexPage',
  title: 'Menus',
  description: 'Browse uploaded menu documents.',
})

const pageTitle = 'QR menus'
const { appName } = useFireUXConfig()
const { data, pending, error } = await useAsyncData(
  'misebox-uploaded-menus',
  () => $fetch<UploadedMenuSummary[]>('/api/menus')
)

const menus = computed(() => data.value ?? [])

useHead({ title: `${appName} | ${pageTitle}` })
</script>
