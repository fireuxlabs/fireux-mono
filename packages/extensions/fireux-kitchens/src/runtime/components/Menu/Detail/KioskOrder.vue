<template>
  <section v-if="view" class="kiosk-order" aria-label="Kiosk layout">
    <aside class="kiosk-order__menu" aria-label="Menu">
      <p class="kiosk-order__mode">{{ modeLabel }}</p>

      <div class="kiosk-order__groups" aria-label="Menu groups">
        <button
          v-for="group in groups"
          :key="group.id"
          type="button"
          class="kiosk-order__group"
          :class="{ 'kiosk-order__group--active': group.id === activeGroupId }"
          :disabled="!group.count"
          @click="chooseGroup(group.id)"
        >
          <span>{{ group.label }}</span>
          <small>{{ group.count }}</small>
        </button>
      </div>

      <div class="kiosk-order__sections" aria-label="Sections">
        <button
          v-for="section in activeSections"
          :key="section.id"
          type="button"
          class="kiosk-order__section"
          :class="{ 'kiosk-order__section--active': section.id === activeSectionId }"
          @click="activeSectionId = section.id"
        >
          {{ section.label }}
        </button>
      </div>
    </aside>

    <main class="kiosk-order__content" aria-label="Dishes">
      <section v-if="activeSection" class="kiosk-order__dish-section">
        <header class="kiosk-order__content-header">
          <h2>{{ activeSection.label }}</h2>
          <span>{{ activeSection.items.length }}</span>
        </header>

        <div class="kiosk-order__dishes">
          <article
            v-for="item in activeSection.items"
            :key="item.id"
            class="kiosk-order__dish"
          >
            <div class="kiosk-order__dish-copy">
              <h3>{{ item.name }}</h3>
              <p v-if="item.description">{{ item.description }}</p>
            </div>

            <p v-if="itemPrice(item)" class="kiosk-order__dish-price">
              {{ itemPrice(item) }}
            </p>
          </article>
        </div>
      </section>
    </main>
  </section>

  <p v-else class="kiosk-order__empty">Menu unavailable.</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MenuDetailView } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type {
  MenuManifestItem,
  MenuManifestSection,
} from '../../../models/kitchen/menu/menu-detail.model'

type KioskGroupId = 'food' | 'drink' | 'deal'
type KioskGroup = {
  id: KioskGroupId
  label: string
  count: number
  sections: MenuManifestSection[]
}

const props = defineProps<{
  mode?: 'eat_in' | 'takeaway' | ''
  view: MenuDetailView | null
}>()

const groupOrder: Array<{ id: KioskGroupId, label: string }> = [
  { id: 'food', label: 'Food' },
  { id: 'drink', label: 'Drinks' },
  { id: 'deal', label: 'Deals' },
]
const activeGroupId = ref<KioskGroupId>('food')
const activeSectionId = ref('')
const itemGroup = (item: MenuManifestItem): KioskGroupId => {
  if (item.isDeal) return 'deal'
  return item.itemKind === 'drink' ? 'drink' : 'food'
}
const groups = computed<KioskGroup[]>(() =>
  groupOrder.map((group) => {
    const sections = (props.view?.menu.content.sections ?? [])
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => itemGroup(item) === group.id),
      }))
      .filter((section) => section.items.length)
    const count = sections.reduce((total, section) => total + section.items.length, 0)

    return { ...group, count, sections }
  })
)
const activeGroup = computed(() =>
  groups.value.find((group) => group.id === activeGroupId.value) ??
    groups.value.find((group) => group.count) ??
    groups.value[0]
)
const activeSections = computed(() => activeGroup.value?.sections ?? [])
const activeSection = computed(() =>
  activeSections.value.find((section) => section.id === activeSectionId.value) ??
    activeSections.value[0] ??
    null
)
const modeLabel = computed(() =>
  props.mode === 'eat_in'
    ? 'Eat in'
    : props.mode === 'takeaway'
      ? 'Takeaway'
      : 'Kiosk'
)
const currencyCode = computed(() =>
  String(props.view?.menu.presentation.currencyCode || '').trim()
)
const chooseGroup = (groupId: KioskGroupId) => {
  activeGroupId.value = groupId
  activeSectionId.value = ''
}
const itemPrice = (item: MenuManifestItem) =>
  item.priceLabel || (item.price ? `${currencyCode.value} ${item.price.toFixed(2)}` : '')

watch(groups, (nextGroups) => {
  const current = nextGroups.find((group) => group.id === activeGroupId.value)
  if (current?.count) return

  const firstAvailable = nextGroups.find((group) => group.count)
  if (firstAvailable) activeGroupId.value = firstAvailable.id
}, { immediate: true })

watch(activeSections, (sections) => {
  if (sections.some((section) => section.id === activeSectionId.value)) return

  activeSectionId.value = sections[0]?.id || ''
}, { immediate: true })
</script>

<style scoped>
.kiosk-order {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(15rem, 20rem) minmax(0, 1fr);
  gap: clamp(1rem, 2.2vw, 2rem);
  width: 100%;
  height: 100svh;
  min-height: 0;
  overflow: hidden;
  padding: clamp(6rem, 9svh, 8rem) clamp(1.25rem, 3vw, 3rem) clamp(1.25rem, 3svh, 3rem);
  background: rgb(0 0 0 / 18%);
}

.kiosk-order__menu,
.kiosk-order__content {
  min-height: 0;
  border-radius: 0.9rem;
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 24%);
}

.kiosk-order__menu {
  display: flex;
  height: 100%;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  padding: 1.1rem;
  background: rgb(10 10 10 / 82%);
}

.kiosk-order__content {
  height: 100%;
  padding: clamp(1rem, 1.8vw, 1.6rem);
  background: rgb(244 244 245 / 94%);
  color: #151515;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: color-mix(in srgb, var(--kiosk-primary) 78%, black) transparent;
}

.kiosk-order__mode {
  margin: 0;
  color: color-mix(in srgb, var(--kiosk-primary) 78%, white);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.kiosk-order__groups,
.kiosk-order__sections,
.kiosk-order__dishes {
  display: grid;
  gap: 0.75rem;
}

.kiosk-order__sections {
  min-height: 0;
  overflow-y: auto;
  padding-right: 0.15rem;
}

.kiosk-order__group,
.kiosk-order__section {
  width: 100%;
  border: 1px solid rgb(255 255 255 / 18%);
  background: rgb(255 255 255 / 8%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  text-align: left;
}

.kiosk-order__group {
  display: flex;
  min-height: 5.4rem;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-radius: 1.15rem;
  font-size: 1.25rem;
}

.kiosk-order__group:disabled {
  cursor: default;
  opacity: 0.42;
}

.kiosk-order__group small {
  color: color-mix(in srgb, white 68%, transparent);
  font-size: 0.85rem;
  font-weight: 900;
}

.kiosk-order__section {
  min-height: 3.25rem;
  padding: 0.7rem 0.85rem;
  border-radius: 0.9rem;
  color: color-mix(in srgb, white 82%, transparent);
}

.kiosk-order__group--active,
.kiosk-order__section--active {
  border-color: color-mix(in srgb, var(--kiosk-primary) 76%, white);
  background: color-mix(in srgb, var(--kiosk-primary) 28%, rgb(0 0 0 / 30%));
  color: white;
  box-shadow: inset 0 0 0 1px rgb(255 255 255 / 12%);
}

.kiosk-order__dish-section {
  display: grid;
  gap: 1.2rem;
}

.kiosk-order__content-header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  background: linear-gradient(rgb(244 244 245), rgb(244 244 245 / 0));
}

.kiosk-order__content-header h2 {
  margin: 0;
  color: #151515;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 950;
  line-height: 1;
}

.kiosk-order__content-header span {
  display: grid;
  min-width: 3rem;
  height: 3rem;
  border: 1px solid rgb(0 0 0 / 10%);
  border-radius: 999px;
  background: white;
  color: #151515;
  font-size: 1.2rem;
  font-weight: 900;
  place-items: center;
}

.kiosk-order__dishes {
  gap: 0.65rem;
}

.kiosk-order__dish {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: center;
  min-height: 5.75rem;
  padding: 1rem 1.1rem;
  border: 1px solid rgb(0 0 0 / 8%);
  border-radius: 0.8rem;
  background: white;
  color: #151515;
}

.kiosk-order__dish-copy {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.kiosk-order__dish-copy h3,
.kiosk-order__dish-copy p {
  margin: 0;
}

.kiosk-order__dish-copy h3 {
  font-size: clamp(1.05rem, 1.5vw, 1.45rem);
  font-weight: 950;
  line-height: 1.1;
}

.kiosk-order__dish-copy p {
  color: #52525b;
  display: -webkit-box;
  line-height: 1.35;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.kiosk-order__dish-price {
  margin: 0;
  color: color-mix(in srgb, var(--kiosk-primary) 72%, #151515);
  font-size: 1.12rem;
  font-weight: 950;
  white-space: nowrap;
}

.kiosk-order__empty { position: relative; z-index: 1; margin: 0; color: white; font-size: 2rem; font-weight: 900; }
</style>
