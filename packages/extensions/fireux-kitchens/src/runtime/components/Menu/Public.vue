<template>
  <UPage
    :dir="menuDirection"
    :lang="menuLanguage"
  >
    <UPageHeader
      :title="menu.name"
      :description="menu.description"
      :headline="kitchenName"
    >
      <template #links>
        <MenuSproochliLanguageTrigger
          :language-options="languageOptions ?? []"
          :selected-language="selectedLanguage"
        />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-4 lg:grid-cols-2">
        <UCard
          v-for="row in visibleSectionRows"
          :key="row.section.id"
          variant="subtle"
        >
          <template #header>
            <div class="space-y-1">
              <h2 class="text-base font-semibold text-highlighted">
                {{ row.section.label }}
              </h2>
              <p
                v-if="row.section.description"
                class="text-sm text-muted"
              >
                {{ row.section.description }}
              </p>
            </div>
          </template>

          <div class="divide-y divide-default">
            <article
              v-for="item in row.items"
              :key="item.item.id"
              class="py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-baseline gap-3">
                <h3 class="min-w-0 flex-1 text-sm font-medium text-highlighted">
                  {{ item.label }}
                </h3>
                <p
                  v-if="item.price > 0"
                  class="shrink-0 text-sm font-medium text-highlighted tabular-nums"
                >
                  {{ formatPrice(item.price) }}
                </p>
              </div>
              <p
                v-if="item.description"
                class="mt-1 text-sm text-muted"
              >
                {{ item.description }}
              </p>
            </article>
          </div>
        </UCard>
      </div>

      <UAlert
        v-if="!visibleSectionRows.length"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This menu has no published dish items yet."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../models/menu.model'
import type {
  PublicKitchenLanguageCode,
  PublicKitchenLanguageOption,
} from '../../composables/fireux/app/public-kitchen-language'
import { isPublicKitchenRtlLanguage } from '../../composables/fireux/app/public-kitchen-language'
import MenuSproochliLanguageTrigger from './SproochliLanguageTrigger.vue'

type PublicMenuSectionRow = {
  section: { id: string; label: string; description?: string }
  items: Array<{
    item: { id: string }
    label: string
    description: string
    price: number
  }>
}

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sectionRows: PublicMenuSectionRow[]
  languageOptions?: PublicKitchenLanguageOption[]
  selectedLanguage?: PublicKitchenLanguageCode
}>()

const visibleSectionRows = computed(() =>
  props.sectionRows.filter((row) => row.items.length > 0)
)
const menuLanguage = computed(() => props.selectedLanguage || undefined)
const menuDirection = computed(() =>
  isPublicKitchenRtlLanguage(props.selectedLanguage) ? 'rtl' : 'ltr'
)

const formatPrice = (price: number) => {
  if (!Number.isFinite(price) || price <= 0) return ''
  return price % 1 === 0 ? `${price}.-` : price.toFixed(2)
}
</script>
