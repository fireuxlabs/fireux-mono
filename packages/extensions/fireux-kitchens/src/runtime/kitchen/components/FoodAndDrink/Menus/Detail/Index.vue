<template>
  <section class="workspace-surface">
    <KitchenFoodAndDrinkMenusDetailHeader />
    <UAlert
      v-if="outcome === 'denied'"
      color="warning"
      title="Menu access unavailable"
      description="Sign in with access to this Kitchen to open its menus."
    />
    <FireCopyError v-else-if="error" :message="String(error)" />
    <p v-else-if="pending" role="status">Loading Menu…</p>
    <UAlert
      v-else-if="outcome === 'idle'"
      color="neutral"
      title="Select a Kitchen"
    />
    <UAlert
      v-else-if="!menu"
      color="neutral"
      :title="selectedKitchen ? 'Menu not found' : 'Kitchen not found'"
    />
    <div
      v-else
      :key="`${recordScope}/${menu.id}`"
      class="workspace-surface"
      :aria-label="viewLabel"
    >
      <UAlert
        v-if="!canWrite"
        color="neutral"
        :title="
          menu.schedule === 'daily' &&
          !['premium', 'business'].includes(subscription)
            ? 'Daily specials require Plus'
            : 'Read-only Menu'
        "
      />
      <UAlert
        v-if="menu.status === 'archived'"
        title="Archived Menu"
        description="This Menu is no longer public. Restore it to draft in Settings when you need it again."
        color="neutral"
      />
      <KitchenFoodAndDrinkMenusPublicationReadiness
        v-if="
          menu.schedule !== 'daily' &&
          menu.format !== 'document' &&
          !menu.doc?.url &&
          menu.status !== 'archived'
        "
        :key="`${recordScope}/${menu.id}/readiness`"
      />
      <KitchenFoodAndDrinkMenusDetailSettings v-if="view === 'details'" />
      <section v-else-if="view === 'content'" class="workspace-surface">
        <KitchenFoodAndDrinkMenusDetailDocument
          v-if="menu.format === 'document' || menu.doc?.url"
        />
        <KitchenFoodAndDrinkMenusSectionsCollection v-else />
      </section>
      <KitchenFoodAndDrinkMenusPublication v-else-if="view === 'publishing'" />
      <KitchenFoodAndDrinkMenusDetailSource v-else />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { provideKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { useMenuRecordNavigation } from '../../../../composables/workspace/menus/useMenuRecordNavigation'
import { provideMenuRecordView } from '../../../../composables/workspace/menus/useMenuRecordView'
const {
  menu,
  menuSlug,
  pending,
  error,
  outcome,
  canWrite,
  subscription,
  selectedKitchen,
} = provideKitchenMenuRecordContext()
const { scope, entryView, clearView } = useMenuRecordNavigation()
const recordScope = computed(() => `${scope.value}/${menuSlug.value}`)
const { view } = provideMenuRecordView(
  recordScope,
  menu,
  () => entryView(menuSlug.value),
  clearView
)
const viewLabel = computed(
  () =>
    ({
      details: 'Settings',
      content:
        menu.value?.schedule === 'daily'
          ? 'Dates & selections'
          : menu.value?.format === 'document' || menu.value?.doc?.url
            ? 'Document'
            : 'Items & prices',
      publishing: 'Publishing',
      source: 'Import & source',
    })[view.value]
)
</script>

<style src="../../../../../menu/assets/styles/menu-editor.css"></style>
