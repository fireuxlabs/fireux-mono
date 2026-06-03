<template>
  <div class="contents">
    <div v-if="pending" class="mx-auto max-w-3xl px-4 py-8 text-sm text-dimmed">
      Loading menu...
    </div>

    <UAlert
      v-if="showUnavailable"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <MenuPublic
      v-if="showMenu"
      :kitchen-name="kitchenName"
      :menu="menu"
      :section-rows="sectionRows"
      :language-options="languageOptions"
      :selected-language="selectedLanguage"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuDetail'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  pending,
  showUnavailable,
  showMenu,
  kitchenName,
  menu,
  sectionRows,
  languageOptions,
  selectedLanguage,
} = useKitchenPublicMenuDetail()
</script>
