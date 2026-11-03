<template>
  <section class="fx-page-stack" aria-label="Published Menu">
    <h2 class="fx-type-card-heading">Your Menu is online</h2>
    <UFormField label="Menu link"
      ><UInput :model-value="url" readonly
    /></UFormField>
    <div class="menu-document-links">
      <UButton label="Copy Menu link" icon="i-lucide-copy" @click="copy(url)" />
      <UButton
        :to="menu.menuPath"
        label="Open Menu"
        target="_blank"
        variant="outline"
      />
      <UButton
        :to="menu.qrPath"
        label="Download QR"
        icon="i-lucide-qr-code"
        target="_blank"
        variant="outline"
      />
    </div>
    <p>
      Replace the document whenever your menu changes. Your link and printed QR
      stay the same.
    </p>
    <template v-if="recoveryLink">
      <UFormField
        label="Private recovery link"
        description="Keep this link to replace your menu from another browser. Anyone with it can replace this document."
        ><UInput :model-value="recoveryLink" readonly type="password"
      /></UFormField>
      <UButton
        label="Copy private recovery link"
        variant="outline"
        @click="copy(recoveryLink)"
      />
    </template>
    <p v-if="feedback" :role="failed ? 'alert' : 'status'">{{ feedback }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import type { MenuDocumentRead } from '../../models/menu-detail.model'

const props = defineProps<{
  menu: MenuDocumentRead
  url: string
  recoveryLink: string
}>()
const feedback = ref('')
const failed = ref(false)
const links = [() => props.url, () => props.recoveryLink]
const capture = useCommandScope(links)
watch(links, () => {
  feedback.value = ''
  failed.value = false
})

async function copy(value: string) {
  const current = capture()
  try {
    await navigator.clipboard.writeText(value)
    if (current()) {
      failed.value = false
      feedback.value = 'Copied.'
    }
  } catch {
    if (current()) {
      failed.value = true
      feedback.value = 'Copy is unavailable. Select the link and copy it.'
    }
  }
}
</script>

<style scoped>
.menu-document-links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
</style>
