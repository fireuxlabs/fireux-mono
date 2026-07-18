<template>
  <section v-if="view" class="staff-pos" aria-label="Staff POS">
    <header class="staff-pos__top">
      <div class="staff-pos__title">
        <span>Staff POS</span>
        <strong>{{ view.menu.content.name }}</strong>
      </div>

      <div v-if="orderChoices.length" class="staff-pos__modes" aria-label="Order type">
        <button
          v-for="choice in orderChoices"
          :key="choice.value"
          type="button"
          class="staff-pos__mode"
          :class="{ 'staff-pos__mode--active': choice.value === view.selectedChoice }"
          @click="emit('update:selected-choice', choice.value)"
        >
          <UIcon :name="orderIcon(choice.orderType)" aria-hidden="true" />
          <span>{{ choice.label }}</span>
        </button>
      </div>

      <UInput
        v-model="query"
        class="staff-pos__search"
        icon="i-lucide-search"
        placeholder="Search"
        size="lg"
      />
    </header>

    <div class="staff-pos__body">
      <aside class="staff-pos__rail" aria-label="Menu">
        <div class="staff-pos__groups">
          <button
            v-for="group in groups"
            :key="group.id"
            type="button"
            class="staff-pos__nav"
            :class="{ 'staff-pos__nav--active': group.id === activeGroupId }"
            @click="chooseGroup(group.id)"
          >
            {{ group.label }}
          </button>
        </div>

        <div class="staff-pos__sections">
          <button
            v-for="section in activeSections"
            :key="section.id"
            type="button"
            class="staff-pos__nav staff-pos__nav--section"
            :class="{ 'staff-pos__nav--active': section.id === activeSectionId }"
            @click="activeSectionId = section.id"
          >
            {{ section.label }}
          </button>
        </div>
      </aside>

      <main class="staff-pos__content" aria-label="Items">
        <header v-if="activeSection" class="staff-pos__section-head">
          <h2>{{ activeSection.label }}</h2>
        </header>

        <div v-if="activeItems.length" class="staff-pos__items">
          <MenuDetailStaffPosItem
            v-for="item in activeItems"
            :key="item.id"
            :item="item"
            @add="emit('add', $event)"
          />
        </div>

        <p v-else class="staff-pos__empty">
          No items found.
        </p>
      </main>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  MenuChoiceOption,
  MenuDetailOrderItem,
  MenuDetailView,
} from '../../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../../models/kitchen/menu/menu-detail.model'
import type { KitchenOrderType } from '../../../../models/kitchen/order.model'

type GroupId = 'food' | 'drink' | 'deal'
type Group = {
  id: GroupId
  label: string
  sections: MenuManifestSection[]
}

const props = defineProps<{
  view: MenuDetailView | null
}>()

const emit = defineEmits<{
  (event: 'add', item: MenuDetailOrderItem): void
  (event: 'update:selected-choice', value: string): void
}>()

const query = ref('')
const activeGroupId = ref<GroupId>('food')
const activeSectionId = ref('')
const groupOrder: Array<{ id: GroupId, label: string }> = [
  { id: 'food', label: 'Food' },
  { id: 'drink', label: 'Drinks' },
  { id: 'deal', label: 'Deals' },
]
const orderChoices = computed(() =>
  (props.view?.choices ?? []).filter((choice) => choice.orderType)
)
const itemGroup = (item: MenuManifestItem): GroupId => {
  if (item.isDeal) return 'deal'
  return item.itemKind === 'drink' ? 'drink' : 'food'
}
const matchesQuery = (item: MenuManifestItem) => {
  const search = query.value.trim().toLowerCase()
  if (!search) return true

  return [
    item.name,
    item.description,
  ].some((value) => String(value ?? '').toLowerCase().includes(search))
}
const groups = computed<Group[]>(() =>
  groupOrder
    .map((group) => {
      const sections = (props.view?.menu.content.sections ?? [])
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            itemGroup(item) === group.id && matchesQuery(item)
          ),
        }))
        .filter((section) => section.items.length)

      return { ...group, sections }
    })
    .filter((group) => group.sections.length)
)
const activeGroup = computed(() =>
  groups.value.find((group) => group.id === activeGroupId.value) ??
    groups.value[0] ??
    null
)
const activeSections = computed(() => activeGroup.value?.sections ?? [])
const activeSection = computed(() =>
  activeSections.value.find((section) => section.id === activeSectionId.value) ??
    activeSections.value[0] ??
    null
)
const activeItems = computed(() => activeSection.value?.items ?? [])

const chooseGroup = (groupId: GroupId) => {
  activeGroupId.value = groupId
  activeSectionId.value = ''
}
const orderIcon = (type?: KitchenOrderType) =>
  type === 'takeaway' ? 'i-lucide-shopping-bag' : 'i-lucide-utensils'

watch(groups, (nextGroups: Group[]) => {
  if (nextGroups.some((group: Group) => group.id === activeGroupId.value)) return

  activeGroupId.value = nextGroups[0]?.id ?? 'food'
}, { immediate: true })

watch(activeSections, (sections: MenuManifestSection[]) => {
  if (sections.some((section: MenuManifestSection) => section.id === activeSectionId.value)) return

  activeSectionId.value = sections[0]?.id || ''
}, { immediate: true })

watch(orderChoices, (choices: MenuChoiceOption[]) => {
  if (!choices.length) return
  if (choices.some((choice) => choice.value === props.view?.selectedChoice)) return

  emit('update:selected-choice', choices[0].value)
}, { immediate: true })
</script>

<style scoped>
.staff-pos {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100svh;
  min-height: 0;
  overflow: hidden;
  background: var(--menu-bg);
  color: var(--menu-text);
  text-align: left;
}

.staff-pos__top {
  display: grid;
  grid-template-columns: minmax(12rem, 1fr) auto minmax(12rem, 18rem);
  gap: 1rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
  background: color-mix(in srgb, var(--menu-bg) 94%, var(--menu-text));
}

.staff-pos__title {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.staff-pos__title span {
  color: var(--menu-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.staff-pos__title strong,
.staff-pos__section-head h2 {
  overflow: hidden;
  color: var(--menu-title);
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.staff-pos__title strong {
  font-size: 1.15rem;
}

.staff-pos__modes,
.staff-pos__groups,
.staff-pos__sections {
  display: flex;
  gap: 0.5rem;
}

.staff-pos__mode,
.staff-pos__nav {
  border: 1px solid color-mix(in srgb, var(--menu-text) 12%, transparent);
  border-radius: calc(var(--ui-radius) * 2);
  background: color-mix(in srgb, var(--menu-bg) 86%, transparent);
  color: var(--menu-text);
  cursor: pointer;
  font: inherit;
  font-weight: 900;
}

.staff-pos__mode {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.8rem;
}

.staff-pos__mode--active,
.staff-pos__nav--active {
  border-color: color-mix(in srgb, var(--menu-primary) 54%, transparent);
  background: var(--menu-primary);
  color: var(--menu-bg);
}

.staff-pos__body {
  display: grid;
  grid-template-columns: 14rem minmax(0, 1fr);
  min-height: 0;
}

.staff-pos__rail {
  display: grid;
  align-content: start;
  gap: 1rem;
  min-height: 0;
  padding: 1rem;
  overflow: auto;
  border-right: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
  background: color-mix(in srgb, var(--menu-bg) 90%, var(--menu-text));
}

.staff-pos__groups,
.staff-pos__sections {
  flex-direction: column;
}

.staff-pos__nav {
  min-height: 2.7rem;
  padding: 0.6rem 0.7rem;
  text-align: left;
}

.staff-pos__nav--section {
  color: var(--menu-muted);
  font-size: 0.9rem;
}

.staff-pos__content {
  min-height: 0;
  padding: 1rem;
  overflow: auto;
  overscroll-behavior: contain;
}

.staff-pos__section-head {
  padding-bottom: 0.85rem;
}

.staff-pos__section-head h2 {
  margin: 0;
  font-size: clamp(1.35rem, 2.4vw, 2rem);
}

.staff-pos__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  gap: 0.75rem;
  align-items: start;
}

.staff-pos__empty {
  margin: 0;
  color: var(--menu-muted);
  font-weight: 800;
}

@media (max-width: 860px) {
  .staff-pos__top {
    grid-template-columns: minmax(0, 1fr);
  }

  .staff-pos__modes {
    overflow-x: auto;
  }

  .staff-pos__body {
    grid-template-columns: 10.5rem minmax(0, 1fr);
  }

  .staff-pos__items {
    grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  }
}

@media (max-width: 560px) {
  .staff-pos__body {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .staff-pos__rail {
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--menu-text) 10%, transparent);
  }

  .staff-pos__groups,
  .staff-pos__sections {
    flex-direction: row;
    overflow-x: auto;
  }

  .staff-pos__nav {
    flex: 0 0 auto;
  }
}
</style>
