<template>
  <section
    class="menu-qr"
    data-menu-projection="qr"
    :data-menu-state="qr.qrState"
    :data-menu-id="qr.hasMenu ? qr.menuId : undefined"
    :data-menu-context="qr.hasMenu ? qr.menuContext : undefined"
    :data-menu-render-kind="qr.hasMenu ? qr.renderKind : undefined"
    :data-menu-target-path="qr.hasMenu ? qr.menuPath : undefined"
    :data-menu-scope="qr.menuRouteScope.kind"
    :data-kitchen-slug="qr.kitchenSlug || undefined"
    :aria-labelledby="qr.headingId"
  >
    <div class="menu-qr__glow menu-qr__glow--one" aria-hidden="true" />
    <div class="menu-qr__glow menu-qr__glow--two" aria-hidden="true" />

    <MenuQRState
      v-if="qr.pending || qr.qrFailure"
      :pending="qr.pending"
      :failure="qr.qrFailure"
      :index-path="qr.menuIndexPath"
    />
    <MenuQRPrintable v-else :view="qr" @error="qr.qrError = $event" />
  </section>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import {
  useMenuQrPage,
  type MenuQrPageInput,
} from '../../composables/useMenuQrPage'
const props = defineProps<MenuQrPageInput>()
const qr = reactive(useMenuQrPage(props))
await qr.ready
qr.applyResponseStatus()
</script>
<style src="./qr.css"></style>
