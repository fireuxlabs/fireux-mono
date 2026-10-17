<template>
  <UCard>
    <template #header
      ><h2 class="text-lg font-semibold">Website ordering</h2>
      <p class="mt-1 text-sm text-muted">
        Add one button to your website. Customers choose from your current
        offerings and menus.
      </p></template
    >
    <div class="grid items-start gap-6 lg:grid-cols-2">
      <div class="space-y-4">
        <div
          class="flex min-h-48 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-default bg-elevated/30 p-6"
        >
          <span class="text-xs font-medium uppercase tracking-wider text-muted"
            >Button preview</span
          >
          <UButton
            label="Order now"
            size="xl"
            :disabled="!orderUrl"
            @click="previewOpen = true"
          />
        </div>
        <p class="text-sm text-muted">
          Menu, hour and availability changes update the ordering page
          automatically. You only need new code if the website address changes.
        </p>
        <UButton
          to="/workspace/kitchen/services"
          label="Configure offerings"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>
      <div class="min-w-0 space-y-4">
        <WorkspaceKitchenIntegrationsAllowedWebsites :key="kitchen.id" />
        <USeparator />
        <WorkspaceKitchenIntegrationsWebsiteCode :code="snippet" />
        <div class="flex flex-wrap gap-2">
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
        <p class="text-sm text-muted">
          The button opens an ordering window, with a direct link as a fallback.
        </p>
        <p v-if="isLocal" class="text-sm text-warning">
          This is a localhost preview. Copy the final code from your published
          workspace.
        </p>
      </div>
    </div>
  </UCard>
  <UModal
    v-model:open="previewOpen"
    title="Website ordering preview"
    :ui="{ content: 'sm:max-w-5xl h-[90dvh]', body: 'p-0 sm:p-0 flex-1' }"
  >
    <template #body
      ><iframe
        v-if="previewOpen"
        :src="previewPath"
        title="Kitchen ordering preview"
        class="h-full min-h-96 w-full border-0"
    /></template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Kitchen } from '../../../models/kitchen.model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../../menu/utils/menu-route'
import {
  kitchenWebsiteOrderUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
} from '../../../utils/menu-website-snippet'
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
