<template>
  <UAlert
    class="menu-qr__failure"
    :title="pending ? 'Loading menu' : failure?.title || 'Menu unavailable'"
    :description="pending ? '' : failure?.description || ''"
    :color="!pending && failure?.statusCode !== 404 ? 'error' : 'neutral'"
    variant="soft"
    :role="!pending && failure?.statusCode !== 404 ? 'alert' : 'status'"
    :aria-live="
      !pending && failure?.statusCode !== 404 ? 'assertive' : 'polite'
    "
    :aria-busy="pending"
  >
    <template #title>
      <span
        :id="pending ? 'menu-qr-loading-title' : 'menu-qr-failure-title'"
        class="menu-qr__failure-title"
        role="heading"
        aria-level="1"
        >{{
          pending ? 'Loading menu' : failure?.title || 'Menu unavailable'
        }}</span
      >
    </template>
    <template v-if="!pending" #actions>
      <FireCopyError
        v-if="!pending && failure?.statusCode !== 404"
        :message="
          [
            pending ? 'Loading menu' : failure?.title || 'Menu unavailable',
            pending ? '' : failure?.description || '',
          ]
            .filter(Boolean)
            .join('\n')
        "
      />
      <UButton
        class="menu-qr__action"
        color="neutral"
        variant="ghost"
        :to="indexPath"
        data-menu-action="index"
        >Back to menus</UButton
      ></template
    >
  </UAlert>
</template>
<script setup lang="ts">
import type { MenuLoadFailure } from '../../composables/useMenu'
defineProps<{
  pending: boolean
  failure: MenuLoadFailure | null
  indexPath: string
}>()
</script>
