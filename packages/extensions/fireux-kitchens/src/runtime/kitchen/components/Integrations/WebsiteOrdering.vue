<template>
  <UCard>
    <template #header
      ><h2>Website ordering</h2>
      <p>
        Add one button to your website. Customers choose from your current
        offerings and menus.
      </p></template
    >
    <div>
      <div class="fx-card-body-stack">
        <div>
          <span>Button preview</span>
          <UButton
            label="Order now"
            size="xl"
            :disabled="!orderUrl"
            @click="previewOpen = true"
          />
        </div>
        <p>
          Menu, hour and availability changes update the ordering page
          automatically. You only need new code if the website address changes.
        </p>
        <UButton
          to="/workspace/kitchen/food-and-drink/services"
          label="Configure offerings"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>
      <div class="fx-card-body-stack">
        <KitchenIntegrationsAllowedWebsites :key="kitchen.id" />
        <USeparator />
        <KitchenIntegrationsWebsiteCode :code="snippet" />
        <div class="fx-card__actions">
          <UButton
            :to="orderUrl"
            target="_blank"
            label="Open ordering page"
            color="neutral"
            variant="outline"
            icon="i-lucide-external-link"
            :disabled="!orderUrl"
          />
        </div>
        <p>
          The button opens an ordering window, with a direct link as a fallback.
        </p>
        <p v-if="isLocal">
          This is a localhost preview. Copy the final code from your published
          workspace.
        </p>
      </div>
    </div>
  </UCard>
  <UModal
    v-model:open="previewOpen"
    title="Website ordering preview"
    fullscreen
  >
    <template #body
      ><iframe
        v-if="previewOpen"
        :src="previewPath"
        title="Kitchen ordering preview"
        class="h-full w-full"
    /></template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Kitchen } from '../../models/kitchen.model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../menu/utils/navigation/route'
import {
  kitchenWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
} from '../../utils/menu-website-snippet'
const props = defineProps<{ kitchen: Kitchen }>()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const orderUrl = computed(() =>
  kitchenWebsiteOrderUrl({
    origin,
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(props.kitchen.identity.slug),
  })
)
const previewPath = computed(() =>
  orderUrl.value ? new URL(orderUrl.value).pathname : ''
)
const snippet = computed(() =>
  orderUrl.value ? menuWebsiteSnippet(orderUrl.value) : ''
)
const previewOpen = ref(false)
const isLocal = origin.startsWith('http:')
watch(orderUrl, () => {
  previewOpen.value = false
})
</script>
