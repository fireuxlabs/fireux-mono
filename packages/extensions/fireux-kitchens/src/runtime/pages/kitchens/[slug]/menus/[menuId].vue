<template>
  <main>
    <div class="mx-auto w-full max-w-3xl px-4 pt-6">
      <UButton
        :to="`/kitchens/${encodeURIComponent(slug)}/menus`"
        color="neutral"
        variant="ghost"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        Back to menus
      </UButton>
    </div>

    <div v-if="pending" class="mx-auto max-w-3xl px-4 py-8 text-sm text-dimmed">
      Loading menu...
    </div>

    <UAlert
      v-else-if="unavailable || !menu || !kitchen"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <OrganismsMenuPublic
      v-else
      :kitchen-name="kitchen.name || kitchen.id"
      :menu="menu"
      :section-rows="sectionRows"
    />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { usePublicKitchenMenu } from '../../../../composables/fireux/app/usePublicKitchenMenu'

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())
const menuId = computed(() => String(route.params.menuId || '').trim())
const { kitchen, menu, sectionRows, pending, unavailable } = usePublicKitchenMenu(
  slug,
  menuId
)
</script>
