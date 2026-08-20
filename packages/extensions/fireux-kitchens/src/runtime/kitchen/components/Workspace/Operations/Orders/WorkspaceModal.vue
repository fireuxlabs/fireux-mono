<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description"
    :ui="{
      overlay: 'orders-workspace-modal__overlay',
      content: 'orders-workspace-modal__content',
      body: 'orders-workspace-modal__body',
    }"
  >
    <template #body>
      <slot />
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineOptions({ name: 'WorkspaceKitchenOperationsOrdersWorkspaceModal' })

defineProps<{
  description: string
  title: string
}>()

const open = defineModel<boolean>('open', { required: true })
</script>

<style scoped>
:global(.orders-workspace-modal__overlay) {
  background: transparent;
  backdrop-filter: blur(0.375rem);
}

:global(.orders-workspace-modal__content) {
  display: flex;
  width: 80vw;
  max-width: 80vw;
  height: 80vh;
  max-height: 80vh;
  flex-direction: column;
  overflow: hidden;
}

:global(.orders-workspace-modal__body) {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
}

@media (max-width: 48rem) {
  :global(.orders-workspace-modal__content) {
    width: 94vw;
    max-width: 94vw;
    height: 90dvh;
    max-height: 90dvh;
  }
}
</style>
