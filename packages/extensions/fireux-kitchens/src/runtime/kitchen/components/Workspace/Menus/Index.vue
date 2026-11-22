<template>
  <WorkspacePageHeader
    :title="menu?.name || 'Draft Menus'"
    :description="menu ? 'Unpublished' : undefined"
  >
    <template #actions>
      <UButton
        variant="ghost"
        :to="menuSlug ? '/workspace/kitchen/menus' : '/workspace/kitchen'"
      >
        {{ menuSlug ? 'Back to Menus' : 'Back to Kitchen' }}
      </UButton>
    </template>
  </WorkspacePageHeader>

  <FireState
    v-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    entity="Menu"
    :error="error"
  />
  <p v-else-if="menuSlug && !menu">
    This draft is unavailable in the selected Kitchen.
  </p>
  <template v-else>
    <form class="space-y-3" @submit.prevent="save">
      <UFormField :label="menu ? 'Section name' : 'Menu name'" name="name">
        <UInput v-model="name" required :disabled="busy" />
      </UFormField>
      <UButton type="submit" :loading="busy" :disabled="!name.trim()">
        {{ menu ? 'Add section' : 'Create draft' }}
      </UButton>
      <UAlert v-if="failure" color="error" :title="failure" />
    </form>

    <template v-if="menu">
      <FireState
        v-if="sectionOutcome === 'pending' || sectionOutcome === 'error'"
        :outcome="sectionOutcome"
        entity="Sections"
        :error="sectionError"
      />
      <MenuSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
        :kitchen-id="kitchenId"
        :menu-id="menu.id"
        :catalogue="catalogue"
        :catalogue-outcome="catalogueOutcome"
        :catalogue-error="catalogueError"
      />
    </template>
    <ul v-else-if="drafts.length">
      <li v-for="draft in drafts" :key="draft.id">
        <ULink
          :to="{
            name: 'workspace-kitchen-menus',
            params: { menuSlug: draft.slug },
          }"
        >
          {{ draft.name }}
        </ULink>
      </li>
    </ul>
    <p v-else>No drafts yet.</p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useMenuCreate } from '../../../../menu/composables/firestore/mutations/useMenuCreate'
import { useMenuSectionMutations } from '../../../../menu/composables/firestore/mutations/useMenuSectionMutations'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useKitchenMenuRead } from '../../../../menu/composables/useKitchenMenuRead'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
import { useKitchenItemCollection } from '../../../composables/useKitchenItemCollection'
import MenuSection from './Section.vue'

const { kitchenId, menuSlug } = defineProps<{
  kitchenId: string
  menuSlug: string
}>()
const storage = {
  kitchenCollectionPath: 'kitchens',
  databaseId: readRuntimeFirestoreDatabaseId() || '',
}
const list = useKitchenMenuCollection(menuSlug ? '' : kitchenId, storage)
const detail = useKitchenMenuRead(kitchenId, menuSlug, {
  ...storage,
  scope: kitchenId,
})
const { outcome, error } = menuSlug ? detail : list
const menu = computed(() =>
  detail.menu.value?.status === 'draft' ? detail.menu.value : null
)
const drafts = computed(() =>
  list.activeMenus.value.filter((entry) => entry.status === 'draft')
)
const menuId = computed(() => menu.value?.id || '')
const {
  sections,
  outcome: sectionOutcome,
  error: sectionError,
} = useMenuSectionCollection(kitchenId, menuId, storage)
const {
  dishes: catalogue,
  outcome: catalogueOutcome,
  error: catalogueError,
} = useKitchenItemCollection(
  computed(() => (menuId.value ? kitchenId : '')),
  storage
)

const name = ref('')
const busy = ref(false)
const failure = ref('')
const captureIntent = useMenuEditorScope([menuId])
const { createMenu } = useMenuCreate({ kitchenId })
const { createSection } = useMenuSectionMutations()

async function save() {
  const value = name.value.trim()
  if (!value || busy.value || (menuSlug && !menuId.value)) return
  const isCurrent = captureIntent()
  busy.value = true
  failure.value = ''
  try {
    if (menuSlug)
      await createSection(
        { kitchenId, menuId: menuId.value, label: value },
        isCurrent
      )
    else await createMenu({ name: value }, isCurrent)
    if (isCurrent()) name.value = ''
  } catch (error) {
    if (isCurrent())
      failure.value =
        error instanceof Error ? error.message : 'Could not save the draft.'
  } finally {
    busy.value = false
  }
}
</script>
