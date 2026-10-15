<template>
  <article
    class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-default bg-default p-3"
  >
    <div class="min-w-0 flex-1">
      <h3 class="text-sm font-semibold text-highlighted">
        {{ row.label }}
      </h3>
      <p v-if="row.dish?.description" class="text-sm text-dimmed">
        {{ row.dish.description }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <UBadge
        v-if="!editor.boundSellable(row)"
        color="neutral"
        variant="soft"
        >{{ editor.formatItemPrice(row) }}</UBadge
      >
      <UButton
        size="sm"
        color="neutral"
        variant="soft"
        icon="i-lucide-pencil"
        :to="{
          path: `/workspace/kitchen/food/dishes/${encodeURIComponent(row.dishId)}`,
          query: { menu: editor.menuSlug, section: editor.sectionId },
        }"
      >
        Full dish
      </UButton>
      <USwitch
        :model-value="row.item.status !== 'archived'"
        :label="row.item.status === 'archived' ? 'Off menu' : 'On menu'"
        :disabled="!editor.canWrite || editor.savingAvailability === row.id"
        @update:model-value="editor.setAvailability(row, $event)"
      />
    </div>

    <WorkspaceKitchenMenusItemsSharedTerms
      v-if="editor.boundSellable(row)"
      :key="`${editor.kitchenId}:${editor.boundSellable(row)}`"
      :row="row"
      :kitchen-id="editor.kitchenId"
      :sellable-id="editor.boundSellable(row)"
      :can-write="editor.canWrite"
    />
    <div v-else class="w-full max-w-sm space-y-3">
      <MoleculesFormsEditableSimpleField
        label="Menu price"
        type="number"
        :value="row.price"
        :disabled="!editor.canWrite"
        disabled-message="Kitchen editing access is required."
        :validation-function="editor.validatePrice"
        :update="(value) => editor.saveItemPrice(row, value)"
      />
      <WorkspaceKitchenMenusItemsAdoptSharedTerms
        :key="`${editor.kitchenId}:${editor.menuId}:${editor.sectionId}:${row.id}`"
        :row="row"
        :kitchen-id="editor.kitchenId"
        :menu-id="editor.menuId"
        :section-id="editor.sectionId"
        :can-write="editor.canWrite"
        @adopted="editor.adoptedIds[row.id] = $event"
      />
    </div>
    <MoleculesDisclosurePanel
      class="w-full"
      :title="
        editor.boundSellable(row)
          ? 'Dish details'
          : 'Variants, extras & dish details'
      "
      size="sm"
    >
      <div class="mt-3 grid gap-4 rounded-lg border border-default p-3">
        <div class="grid gap-4 md:grid-cols-2">
          <MoleculesFormsEditableSimpleField
            label="Dish name"
            :value="row.label"
            placeholder="Dish name"
            :maxlength="160"
            :disabled="!editor.canWrite"
            disabled-message="This menu is read-only."
            :validation-function="editor.validateDishName"
            :update="(value) => editor.saveDishName(row, value)"
          />
        </div>

        <MoleculesFormsEditableSimpleField
          label="Dish description"
          type="textarea"
          :rows="3"
          :value="row.dish?.description || ''"
          placeholder="Dish description"
          :maxlength="800"
          :disabled="!editor.canWrite"
          disabled-message="This menu is read-only."
          :update="(value) => editor.saveDishDescription(row, value)"
        />

        <WorkspaceKitchenMenusItemsOptions
          v-if="!editor.boundSellable(row)"
          :row="row"
          :can-write="editor.canWrite"
          :update-price-options="editor.updatePriceOptionsFor(row)"
          :update-add-ons="editor.updateAddOnsFor(row)"
        />
      </div>
    </MoleculesDisclosurePanel>
  </article>
</template>
<script setup lang="ts">
import type { UnwrapNestedRefs } from 'vue'
import type { MenuSectionItemRow } from '../../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'
import type { useMenuSectionItemsEditor } from '../../../../../composables/workspace/menus/useMenuSectionItemsEditor'
defineProps<{
  row: MenuSectionItemRow
  editor: UnwrapNestedRefs<ReturnType<typeof useMenuSectionItemsEditor>>
}>()
</script>
