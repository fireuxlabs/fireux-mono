<template>
  <WorkspacePageHeader
    :title="menu?.name || (publicMenus ? 'Menus' : 'Draft Menus')"
    :description="menu ? (isDraft ? 'Unpublished' : 'Published') : undefined"
  >
    <template #actions>
      <UButton v-if="publicPath && !isDraft" :to="publicPath"
        >View public Menu</UButton
      >
      <UButton
        v-if="publicPath && isDraft"
        :disabled="busy"
        :loading="publishing"
        @click="publish"
      >
        Publish Menu
      </UButton>
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
    This Menu is unavailable in the selected Kitchen.
  </p>
  <template v-else>
    <UAlert v-if="failure" color="error" :title="failure" />
    <form v-if="!menu || isDraft" class="space-y-3" @submit.prevent="save">
      <UFormField :label="menu ? 'Section name' : 'Menu name'" name="name">
        <UInput v-model="name" required :disabled="busy || publishing" />
      </UFormField>
      <UButton
        type="submit"
        :loading="busy"
        :disabled="!name.trim() || publishing"
      >
        {{ menu ? 'Add section' : 'Create draft' }}
      </UButton>
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
        :read-only="!isDraft || publishing"
      />
    </template>
    <ul v-else-if="menus.length">
      <li v-for="entry in menus" :key="entry.id">
        <ULink
          :to="{
            name: 'workspace-kitchen-menus',
            params: { menuSlug: entry.slug },
          }"
        >
          {{ entry.name }}
        </ULink>
      </li>
    </ul>
    <p v-else>{{ publicMenus ? 'No Menus yet.' : 'No drafts yet.' }}</p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from '#imports'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useMenuCreate } from '../../../../menu/composables/firestore/mutations/useMenuCreate'
import { useMenuSectionMutations } from '../../../../menu/composables/firestore/mutations/useMenuSectionMutations'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useKitchenMenuCollection } from '../../../../menu/composables/useKitchenMenuCollection'
import { useKitchenMenuRead } from '../../../../menu/composables/useKitchenMenuRead'
import { useMenuSectionCollection } from '../../../../menu/composables/useMenuSectionCollection'
import { useMenuPublication } from '../../../../menu/composables/publication/useMenuPublication'
import {
  directoryMenuRouteScope,
  menuRoutePath,
} from '../../../../menu/utils/navigation/route'
import { isPublicBrowseMenu } from '../../../../menu/utils/publication-readiness'
import type { Menu } from '../../../../menu/models/menu.model'
import { useKitchenItemCollection } from '../../../composables/useKitchenItemCollection'
import MenuSection from './Section.vue'

const { kitchenId, kitchenSlug, menuSlug } = defineProps<{
  kitchenId: string
  kitchenSlug: string
  menuSlug: string
}>()
const publicMenus = useRouter().hasRoute('KitchenMenuPage')
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
const canReview = (entry: Menu) =>
  entry.status === 'draft' ||
  (publicMenus && entry.status === 'published' && isPublicBrowseMenu(entry))
const menu = computed(() => {
  const entry = detail.menu.value
  return entry && canReview(entry) ? entry : null
})
const menus = computed(() => list.activeMenus.value.filter(canReview))
const isDraft = computed(() => menu.value?.status === 'draft')
const publicPath = computed(() =>
  publicMenus && menu.value && isPublicBrowseMenu(menu.value)
    ? menuRoutePath({
        scope: directoryMenuRouteScope(kitchenSlug),
        menuId: menu.value.slug,
      })
    : ''
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
const publishing = ref(false)
const failure = ref('')
const captureIntent = useMenuEditorScope([menuId])
const { createMenu } = useMenuCreate({ kitchenId })
const { createSection } = useMenuSectionMutations()
const { publishMenu } = useMenuPublication([menuId])

async function publish() {
  if (!isDraft.value || !publicPath.value || publishing.value || busy.value)
    return
  const isCurrent = captureIntent()
  publishing.value = true
  failure.value = ''
  try {
    await publishMenu(kitchenId, menuId.value)
  } catch (error) {
    if (isCurrent())
      failure.value =
        (error as { data?: { statusMessage?: string } })?.data?.statusMessage ||
        (error instanceof Error ? error.message : 'Could not publish the Menu.')
  } finally {
    publishing.value = false
  }
}

async function save() {
  const value = name.value.trim()
  if (!value || busy.value || publishing.value || (menuSlug && !isDraft.value))
    return
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
