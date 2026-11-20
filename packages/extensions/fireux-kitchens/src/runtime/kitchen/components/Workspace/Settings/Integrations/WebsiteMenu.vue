<template>
  <UCard>
    <template #header
      ><h2>Website menu</h2>
      <p>Add a button so visitors can browse your current menus.</p></template
    >
    <div>
      <div class="fx-card-body-stack">
        <div>
          <span>Button preview</span>
          <UButton
            label="View menu"
            size="xl"
            :disabled="!menuUrl"
            @click="previewOpen = true"
          />
        </div>
        <p>
          Menu, hour and availability changes update the menu page
          automatically. You only need new code if the website address changes.
        </p>
        <UButton
          to="/workspace/kitchen/menu/services"
          label="Configure services"
          color="neutral"
          variant="link"
          trailing-icon="i-lucide-arrow-right"
        />
      </div>
      <div class="fx-card-body-stack">
        <WorkspaceKitchenSettingsIntegrationsAllowedWebsites
          :key="kitchen.id"
        />
        <USeparator />
        <WorkspaceKitchenSettingsIntegrationsWebsiteCode :code="snippet" />
        <div class="fx-card__actions">
          <UButton
            :to="menuUrl"
            target="_blank"
            label="Open menu page"
            color="neutral"
            variant="outline"
            icon="i-lucide-external-link"
            :disabled="!menuUrl"
          />
        </div>
        <p>
          The button opens an menu window, with a direct link as a fallback.
        </p>
        <p v-if="isLocal">
          This is a localhost preview. Copy the final code from your published
          workspace.
        </p>
      </div>
    </div>
  </UCard>
  <UModal v-model:open="previewOpen" title="Website menu preview" fullscreen>
    <template #body
      ><iframe
        v-if="previewOpen"
        :src="previewPath"
        title="Kitchen menu preview"
        class="h-full w-full"
    /></template>
  </UModal>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRequestURL } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { Kitchen } from '../../../../models/model'
import {
  directoryMenuRouteScope,
  tenantMenuRouteScope,
} from '../../../../../menu/utils/navigation/route'
import {
  kitchenWebsiteMenuUrl,
  menuWebsiteSnippet,
  menuWebsiteOrigin,
} from '../../../../utils/menu-website-snippet'
const props = defineProps<{ kitchen: Pick<Kitchen, 'id' | 'identity'> }>()
const fireux = useFireUXConfig()
const origin = menuWebsiteOrigin(useRequestURL().origin, fireux.siteUrl)
const menuUrl = computed(() =>
  kitchenWebsiteMenuUrl({
    origin,
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(props.kitchen.identity.slug),
  })
)
const previewPath = computed(() =>
  menuUrl.value ? new URL(menuUrl.value).pathname : ''
)
const snippet = computed(() =>
  menuUrl.value ? menuWebsiteSnippet(menuUrl.value) : ''
)
const previewOpen = ref(false)
const isLocal = origin.startsWith('http:')
watch(menuUrl, () => {
  previewOpen.value = false
})
</script>
