<template>
  <UCard v-if="menu">
    <template #header>
      <h2 class="text-base font-semibold text-highlighted">
        Order from your website
      </h2>
      <p class="text-sm text-dimmed">
        Add an Order now button to your website. Guests order in a popup using
        this menu.
      </p>
    </template>
    <div class="grid gap-4">
      <p v-if="!contexts.length" class="text-sm text-muted">
        Publish this menu and enable an unpaused collection, delivery or
        pre-order option to create your button.
      </p>
      <template v-else>
        <UFormField label="Ordering option">
          <USelect
            v-model="selectedContext"
            :items="contextItems"
            placeholder="Choose an ordering option"
            class="w-full"
          />
        </UFormField>
        <template v-if="snippet">
          <p class="text-sm text-muted">
            Paste this into an HTML block on your website. Your existing website
            and other ordering buttons stay in place.
          </p>
          <UTextarea
            :model-value="snippet"
            readonly
            :rows="6"
            aria-label="Website ordering code"
            class="w-full font-mono"
          />
          <div class="flex flex-wrap gap-2">
            <UButton icon="i-lucide-copy" @click="copySnippet">{{
              copied ? 'Copied' : 'Copy website button'
            }}</UButton>
            <UButton
              :to="orderUrl"
              target="_blank"
              color="neutral"
              variant="outline"
              >Check ordering page</UButton
            >
          </div>
          <p v-if="copyError" role="status" class="text-sm text-error">
            {{ copyError }}
          </p>
          <p class="text-sm text-muted">
            Check the button on your website before sharing it. Online payment
            inside the popup has not been verified. Closing the popup keeps the
            current order open; reloading the website may lose recovery if
            browser storage is blocked.
          </p>
          <p v-if="isLocal" class="text-sm text-warning">
            This button points to your local preview. Create the final button
            from your published app.
          </p>
        </template>
        <p v-else-if="selectedContext" class="text-sm text-muted">
          This menu's public address is not available yet.
        </p>
      </template>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model.ts'
import type { MenuOrderingConfig } from '../../../../menu/models/menu-ordering.model'
import type { Kitchen } from '../../../models/kitchen.model.ts'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import {
  availableWebsiteOrderContexts,
  menuWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
  type WebsiteOrderContext,
} from '../../../utils/menu-website-snippet'

const props = defineProps<{
  menu: KitchenMenu
  ordering: MenuOrderingConfig
  kitchen: Kitchen
}>()
const menu = computed(() => props.menu)
const menuId = computed(() => props.menu.id)
const ordering = computed(() => props.ordering)
const selectedKitchen = computed(() => props.kitchen)
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const selectedContext = ref<WebsiteOrderContext | undefined>()
const copied = ref(false)
const copyError = ref('')
const labels = {
  collection: 'Collection',
  delivery: 'Delivery',
  pre_order: 'Pre-order',
}
const contexts = computed(() =>
  availableWebsiteOrderContexts(menu.value?.status, ordering.value)
)
const contextItems = computed(() =>
  contexts.value.map((value) => ({ value, label: labels[value] }))
)
const orderUrl = computed(() =>
  selectedContext.value && contexts.value.includes(selectedContext.value)
    ? menuWebsiteOrderUrl({
        origin,
        scope: fireux.isTenant
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(selectedKitchen.value?.slug),
        menuId: menu.value?.slug || '',
        context: selectedContext.value,
      })
    : ''
)
const snippet = computed(() =>
  orderUrl.value ? menuWebsiteSnippet(orderUrl.value) : ''
)
const isLocal = origin.startsWith('http:')
watch([menuId, () => selectedKitchen.value?.id], () => {
  selectedContext.value = undefined
})
watch(snippet, () => {
  copied.value = false
  copyError.value = ''
})
async function copySnippet() {
  try {
    await navigator.clipboard.writeText(snippet.value)
    copied.value = true
  } catch {
    copyError.value = 'Select the code above and copy it manually.'
  }
}
</script>
