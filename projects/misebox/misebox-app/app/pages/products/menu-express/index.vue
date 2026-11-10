<template>
  <UPage>
    <UPageHeader
      title="Menu Hosting"
      description="Put your menu online for free. Upload a PDF or image, preview it, and get your link and QR."
    />
    <UPageBody>
      <div class="fx-page-stack menu-hosting">
        <MenuDocumentUpload :menu="menu" />
        <MenuDocumentPublished
          v-if="menu.data?.status === 'published' && menu.data.document"
          :menu="menu.data"
          :url="menu.publicUrl"
          :recovery-link="menu.recoveryLink"
        />
        <div
          v-if="menu.preview"
          class="menu-hosting__preview"
          role="region"
          aria-label="Menu preview"
          tabindex="0"
        >
          <MenuDetailDocumentViewer
            :menu="menu.preview"
            :menu-id="menu.data?.menuId || 'preview'"
          />
        </div>
        <p v-else-if="menu.previewPending" role="status">
          Opening saved document…
        </p>
        <UAlert
          v-else-if="menu.previewError"
          color="neutral"
          title="Document preview unavailable"
          :description="menu.previewError"
        >
          <template #actions>
            <UButton
              label="Try again"
              variant="soft"
              @click="menu.retryPreview"
            />
          </template>
        </UAlert>
        <p v-else class="fx-type-caption">
          Preview your document, then publish it. No payment or Workspace setup.
        </p>
        <UButton
          v-if="menu.data?.status === 'published'"
          label="Explore more Kitchen tools"
          variant="ghost"
          @click="openWorkspace({ kitchenId: menu.data.kitchenId })"
        />
      </div>
    </UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useMenuDocument } from 'fireux-kitchens/runtime/menu/composables/useMenuDocument'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'

const menu = reactive(useMenuDocument())
const { openWorkspace } = useWorkspaceEntryCta('kitchen')

definePageMeta({
  title: 'Menu Hosting',
  layout: 'default',
  nav: {
    key: 'menu-express-product',
    label: 'Menu Hosting',
    icon: 'i-lucide-qr-code',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})
useSeoMeta({
  title: 'Free Menu Hosting & QR Code · Misebox',
  description:
    'Upload your PDF or menu image, publish it online for free and download its QR. Replace your menu later without changing the link or QR.',
  robots: 'index, follow',
})
</script>

<style scoped>
.menu-hosting {
  max-width: 52rem;
  margin-inline: auto;
}
.menu-hosting__preview {
  max-height: 65vh;
  overflow: auto;
}
</style>
