<template>
  <div class="menu-qr__content">
    <header class="menu-qr__header">
      <div v-if="view.kitchenLogoImageUrl" class="menu-qr__brand">
        <img
          :src="view.kitchenLogoImageUrl"
          :alt="view.kitchenName ? `${view.kitchenName} logo` : 'Kitchen logo'"
        />
      </div>
      <p class="menu-qr__eyebrow">{{ view.kitchenName || 'Menu' }}</p>
      <h1 id="menu-qr-title" class="menu-qr__title">
        {{ view.menuName }}
      </h1>
      <p class="menu-qr__instruction">Scan to explore the menu</p>
    </header>

    <div class="menu-qr__frame">
      <div class="menu-qr__code" :aria-busy="!qrReady && !qrError">
        <div
          v-show="qrReady"
          ref="qrContainer"
          class="menu-qr__canvas"
          :aria-label="`QR code linking to ${view.menuName}`"
          data-menu-qr-image
          role="img"
        />
        <div
          v-if="qrReady && view.kitchenLogoImageUrl"
          class="menu-qr__code-brand"
          aria-hidden="true"
        >
          <img :src="view.kitchenLogoImageUrl" alt="" />
        </div>

        <p v-if="qrError" class="menu-qr__code-state" role="alert">
          QR code unavailable. Use the menu link below.
        </p>

        <p v-else-if="!qrReady" class="menu-qr__code-state" role="status">
          Creating QR code...
        </p>
      </div>

      <div class="menu-qr__scan-label" aria-hidden="true">
        <span class="menu-qr__scan-icon" />
        Point your camera here
      </div>
    </div>

    <a class="menu-qr__destination" :href="view.menuUrl">
      {{ view.menuUrl }}
    </a>

    <div class="menu-qr__actions">
      <NuxtLink
        class="menu-qr__action"
        :to="view.menuIndexPath"
        data-menu-action="index"
      >
        Back to menus
      </NuxtLink>
      <NuxtLink
        class="menu-qr__action"
        :to="view.menuPath"
        data-menu-action="menu"
      >
        Open menu
      </NuxtLink>
      <MenuQRPrintAction :ready="qrReady" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { UnwrapNestedRefs } from 'vue'
import type { useMenuQrPage } from '../../composables/useMenuQrPage'
import { useMenuQrRenderer } from '../../composables/useMenuQrRenderer'
const props = defineProps<{
  view: Pick<
    UnwrapNestedRefs<ReturnType<typeof useMenuQrPage>>,
    | 'menuName'
    | 'kitchenName'
    | 'kitchenLogoImageUrl'
    | 'menuUrl'
    | 'menuIndexPath'
    | 'menuPath'
  >
}>()
const emit = defineEmits<{ error: [value: boolean] }>()
const { qrContainer, qrReady, qrError } = useMenuQrRenderer(
  computed(() => props.view.menuUrl),
  ref(null),
  ref(false)
)
watch(qrError, (value) => emit('error', value), { immediate: true })
</script>
