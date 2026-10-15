<template>
  <UButton
    class="menu-qr__action"
    color="neutral"
    variant="ghost"
    :disabled="!ready"
    data-menu-action="print"
    @click="printQr"
    >Print QR</UButton
  >
</template>
<script setup lang="ts">
const props = defineProps<{ ready: boolean }>()
function printQr() {
  if (import.meta.client && props.ready) window.print()
}
</script>
