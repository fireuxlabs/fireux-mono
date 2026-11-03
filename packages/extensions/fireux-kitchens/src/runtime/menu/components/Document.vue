<template>
  <section class="menu-document-tool" aria-label="Online document Menu">
    <UAlert
      v-if="menu.error"
      color="error"
      title="Menu unavailable"
      :description="menu.error"
    />
    <UFormField v-if="menu.kitchenOptions.length > 1" label="Kitchen">
      <USelect
        v-model="menu.kitchenChoice"
        :items="menu.kitchenOptions"
        :disabled="menu.busy"
      />
    </UFormField>
    <UFormField v-if="menu.data && menu.data.menus.length > 1" label="Menu">
      <USelect
        :model-value="menu.menuChoice || menu.data.menuId"
        :items="menu.data.menus"
        :disabled="menu.busy"
        @update:model-value="menu.menuChoice = $event"
      />
    </UFormField>
    <UAlert
      v-if="menu.data?.acceptsDocument === false"
      color="info"
      title="Choose an empty or document Menu"
      description="This Menu contains structured content. Choose another Menu or manage it in Workspace."
    />
    <UFormField v-if="!menu.data?.venue" label="Venue name">
      <UInput
        v-model="menu.venue"
        placeholder="Your restaurant or café"
        maxlength="120"
        :disabled="menu.busy"
      />
    </UFormField>
    <UFileUpload
      v-model="menu.file"
      label="Upload your menu"
      description="One PDF, JPG, PNG or WebP · up to 10 MB"
      accept="application/pdf,image/jpeg,image/png,image/webp"
      :multiple="false"
      :disabled="menu.busy"
      variant="area"
    />
    <UButton
      v-if="menu.file"
      :label="
        menu.data?.document ? 'Replace document — free' : 'Publish menu — free'
      "
      :disabled="!menu.canPublish"
      :loading="menu.busy"
      @click="menu.publish"
    />
    <p v-if="menu.message" role="status">{{ menu.message }}</p>

    <section
      v-if="menu.data?.status === 'published' && menu.data.document"
      class="menu-document-tool"
      aria-label="Published Menu"
    >
      <h2 class="fx-type-card-heading">Your Menu is online</h2>
      <UFormField label="Menu link"
        ><UInput :model-value="menu.publicUrl" readonly
      /></UFormField>
      <div class="menu-document-tool__actions">
        <UButton
          label="Copy Menu link"
          icon="i-lucide-copy"
          @click="menu.copy(menu.publicUrl)"
        />
        <UButton
          :to="menu.data.menuPath"
          label="Open Menu"
          target="_blank"
          variant="outline"
        />
        <UButton
          :to="menu.data.qrPath"
          label="Download QR"
          icon="i-lucide-qr-code"
          target="_blank"
          variant="outline"
        />
      </div>
      <p>
        Replace the document here whenever your menu changes. Your link and
        printed QR stay the same.
      </p>
      <template v-if="menu.recoveryLink">
        <UFormField
          label="Private recovery link"
          description="Keep this link to replace your menu from another browser. Anyone with it can replace this document."
          ><UInput :model-value="menu.recoveryLink" readonly type="password"
        /></UFormField>
        <UButton
          label="Copy private recovery link"
          variant="outline"
          @click="menu.copy(menu.recoveryLink)"
        />
      </template>
      <UButton
        label="Explore more Kitchen tools"
        variant="ghost"
        @click="openWorkspace({ kitchenId: menu.data.kitchenId })"
      />
    </section>

    <div
      v-if="menu.preview"
      class="menu-document-tool__preview"
      role="region"
      aria-label="Menu preview"
      tabindex="0"
    >
      <MenuDetailDocumentViewer
        :menu="menu.preview"
        :menu-id="menu.data?.menuId || 'preview'"
      />
    </div>
    <p v-else class="fx-type-caption">
      Preview your document, then publish it. No payment or Workspace setup.
    </p>
    <UButton
      v-if="menu.kitchenId && !menu.busy"
      label="Reload saved Menu"
      variant="ghost"
      :loading="menu.loading"
      @click="menu.reload"
    />
  </section>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/workspace/composables/useWorkspaceEntryCta'
import { useMenuDocument } from '../composables/useMenuDocument'
const menu = reactive(useMenuDocument())
const { openWorkspace } = useWorkspaceEntryCta('kitchen')
</script>

<style scoped>
.menu-document-tool {
  display: grid;
  gap: calc(var(--spacing) * 6);
  max-width: 52rem;
  margin-inline: auto;
}
.menu-document-tool .menu-document-tool {
  margin-inline: 0;
}
.menu-document-tool__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
.menu-document-tool input {
  width: 100%;
}
.menu-document-tool__preview {
  max-height: 65vh;
  overflow: auto;
}
</style>
