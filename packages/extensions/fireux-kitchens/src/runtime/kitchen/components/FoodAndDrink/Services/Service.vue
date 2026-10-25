<template>
  <section
    :id="`service-${option.key}`"
    ref="section"
    :aria-label="option.label"
    tabindex="-1"
    class="service-section scroll-mt-4 border-b border-default last:border-b-0"
  >
    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div class="flex items-center gap-2">
        <UIcon
          :name="option.icon"
          class="size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <h2 class="font-semibold">{{ option.label }}</h2>
      </div>
      <USwitch
        :model-value="editor.enabled"
        :label="editor.enabled ? 'On' : 'Off'"
        :aria-label="option.label + ' availability'"
        :disabled="disabled"
        @update:model-value="editor.setEnabled"
      />
      <span
        v-if="editor.enabled && !readiness.canEnable"
        class="text-xs text-warning"
        >{{
          !editor.menuIds.length
            ? 'Needs menus'
            : !readiness.validSelection
              ? 'Replace unavailable menus'
              : 'Publish a selected menu'
        }}</span
      >
      <span v-if="editor.busy" class="text-xs text-muted" role="status"
        >Updating…</span
      >
    </div>
    <FireCopyError
      v-if="editor.error"
      :message="editor.error"
      class="mt-3"
    />
    <KitchenFoodAndDrinkServicesSetup v-if="editor.enabled" class="mt-4" />
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
import { provideKitchenServiceEditor } from '../../../composables/offerings/useKitchenServiceEditor'
const props = defineProps<{ option: KitchenOfferingOption }>()
const { editor, readiness, disabled } = provideKitchenServiceEditor(
  props.option
)
const section = ref<HTMLElement | null>(null)
const route = useRoute()
// The configuration arrives asynchronously; scroll once its section exists.
watch(
  [section, () => route.hash],
  ([element, hash]) => {
    if (element && hash === `#service-${props.option.key}`) {
      element.scrollIntoView({ block: 'start' })
      element.focus({ preventScroll: true })
    }
  },
  { flush: 'post' }
)
</script>
<style scoped>
.service-section {
  padding-block: 1rem;
}
</style>
