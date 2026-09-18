<template>
  <UCard>
    <template #header
      ><h2 class="font-semibold">
        Website button · {{ service.name }}
      </h2></template
    >
    <p v-if="!service.enabled" class="text-sm text-muted">
      This service is off. Enable it before creating a website button.
    </p>
    <p v-else-if="!contexts.length" class="text-sm text-muted">
      Enable Browse, Collection, Delivery or Pre-order in this service. Ordering
      interactions also need serving hours and must not be paused.
    </p>
    <div v-else class="grid gap-4">
      <UFormField label="Guest interaction"
        ><USelect
          v-model="selectedContext"
          :items="contextItems"
          placeholder="Choose an interaction"
          class="w-full"
      /></UFormField>
      <template v-if="selectedContext">
        <UFormField v-if="eligibleMenus.length" label="Menu"
          ><USelect
            v-model="menuId"
            :items="menuOptions"
            placeholder="Choose a Menu"
            class="w-full"
        /></UFormField>
        <p v-else class="text-sm text-muted">
          Link a published
          {{
            selectedContext === 'browse' ? 'Menu' : 'Menu with items and prices'
          }}
          to this service.
        </p>
      </template>
      <template v-if="snippet">
        <UTextarea
          :model-value="snippet"
          readonly
          :rows="6"
          aria-label="Website button code"
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
            >Preview guest page</UButton
          >
        </div>
        <p v-if="copyError" role="status" class="text-sm text-error">
          {{ copyError }}
        </p>
        <p class="text-sm text-muted">
          Paste the code into an HTML block on your website, then check the
          guest flow before sharing.
        </p>
        <p v-if="selectedContext !== 'browse'" class="text-sm text-muted">
          Online payment inside the popup has not been verified. Reloading the
          website may lose an unfinished order if browser storage is blocked.
        </p>
        <p v-if="isLocal" class="text-sm text-warning">
          This button points to your local preview. Create the final button from
          your published app.
        </p>
      </template>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type { KitchenService } from '../../../models/service.model'
import type { Kitchen } from '../../../models/kitchen.model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import {
  availableWebsiteInteractions,
  websiteOrderContexts,
  menuWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
  type WebsiteOrderContext,
} from '../../../utils/menu-website-snippet'
const props = defineProps<{
  menus: KitchenMenu[]
  service: KitchenService
  kitchen: Kitchen
}>()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const selectedContext = ref<WebsiteOrderContext>()
const menuId = ref('')
const copied = ref(false),
  copyError = ref('')
const labels = {
  browse: 'Browse',
  collection: 'Collection',
  delivery: 'Delivery',
  pre_order: 'Pre-order',
}
const contexts = computed(() =>
  props.service.enabled
    ? websiteOrderContexts.filter((type) =>
        props.service.interactions.some(
          (row) =>
            row.type === type &&
            row.enabled &&
            (row.type === 'browse' ||
              (!row.availability?.paused &&
                Boolean(
                  props.service.hours?.timezone &&
                    props.service.hours.windows.length
                )))
        )
      )
    : []
)
const contextItems = computed(() =>
  contexts.value.map((value) => ({ value, label: labels[value] }))
)
const eligibleMenus = computed(() =>
  props.menus.filter(
    (menu) =>
      selectedContext.value &&
      availableWebsiteInteractions(menu, props.service).includes(
        selectedContext.value
      )
  )
)
const menuOptions = computed(() =>
  eligibleMenus.value.map((menu) => ({ value: menu.id, label: menu.name }))
)
const menu = computed(() =>
  eligibleMenus.value.find((menu) => menu.id === menuId.value)
)
const orderUrl = computed(() =>
  menu.value && selectedContext.value
    ? menuWebsiteOrderUrl({
        origin,
        scope: fireux.isTenant
          ? tenantMenuRouteScope()
          : directoryMenuRouteScope(props.kitchen.slug),
        menuId: menu.value.slug,
        context: selectedContext.value,
        serviceId: props.service.id,
      })
    : ''
)
const snippet = computed(() =>
  orderUrl.value
    ? menuWebsiteSnippet(
        orderUrl.value,
        selectedContext.value === 'browse' ? 'View Menu' : 'Order now'
      )
    : ''
)
const isLocal = origin.startsWith('http:')
watch(
  contexts,
  (list) => {
    if (!selectedContext.value || !list.includes(selectedContext.value))
      selectedContext.value = list[0]
  },
  { immediate: true }
)
watch(
  eligibleMenus,
  (list) => {
    if (!list.some((menu) => menu.id === menuId.value))
      menuId.value = list[0]?.id || ''
  },
  { immediate: true }
)
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
