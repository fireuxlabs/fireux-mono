<template>
  <div class="space-y-6">
    <UAlert
      v-if="!selectedKitchen"
      color="neutral"
      variant="soft"
      title="Select a kitchen"
      description="Choose a kitchen before editing menus."
    />

    <template v-else>
      <UCard>
        <template #header>
          <div class="console-card-header">
            <div class="console-card-header__title">Menu Editor</div>
            <p class="console-card-header__description">
              Create simple public menus for this kitchen. Items can stand alone
              and do not need dishes or recipes yet.
            </p>
          </div>
        </template>

        <div
          class="grid gap-5"
          :class="detailMode ? '' : 'lg:grid-cols-[minmax(220px,280px)_1fr]'"
        >
          <aside v-if="!detailMode" class="space-y-4">
            <div class="space-y-2">
              <button
                v-for="menu in menusSorted"
                :key="menu.id"
                type="button"
                class="w-full rounded-md border px-3 py-2 text-left text-sm transition"
                :class="
                  menu.id === selectedMenuId
                    ? 'border-primary bg-primary/10 text-highlighted'
                    : 'border-default bg-default hover:bg-elevated'
                "
                @click="selectMenu(menu.id)"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="min-w-0 truncate font-medium">
                    {{ menu.name }}
                  </span>
                  <UBadge
                    :color="menu.active === false ? 'neutral' : 'success'"
                    variant="soft"
                    size="xs"
                  >
                    {{ menu.active === false ? 'Hidden' : 'Live' }}
                  </UBadge>
                </div>
                <p class="mt-1 truncate text-xs text-dimmed">
                  {{ menu.id }}
                </p>
              </button>

              <p v-if="!menusSorted.length" class="text-sm text-dimmed">
                No menus yet.
              </p>
            </div>

            <form class="space-y-3 border-t border-default pt-4" @submit.prevent="createMenu">
              <div class="text-sm font-medium text-highlighted">
                Create menu
              </div>

              <UFormField label="Name">
                <UInput
                  v-model="newMenu.name"
                  placeholder="Speisekarte"
                  :disabled="busy"
                />
              </UFormField>

              <UFormField label="Id">
                <UInput
                  v-model="newMenu.id"
                  :placeholder="newMenuIdPreview || 'speisekarte'"
                  :disabled="busy"
                />
              </UFormField>

              <UFormField label="Order">
                <UInput
                  v-model="newMenu.sort_order"
                  type="number"
                  :disabled="busy"
                />
              </UFormField>

              <USwitch
                v-model="newMenu.active"
                label="Published"
                :disabled="busy"
              />

              <UButton
                type="submit"
                icon="i-lucide-plus"
                size="sm"
                :loading="creating"
                :disabled="!canCreateMenu"
              >
                Create menu
              </UButton>
            </form>
          </aside>

          <section class="min-w-0">
            <UAlert
              v-if="!draft"
              color="neutral"
              variant="soft"
              :title="detailMode ? 'Menu not found' : 'Select or create a menu'"
              :description="
                detailMode
                  ? `No menu was found for ${selectedMenuId || 'this route'}.`
                  : 'Menus hold sections and simple priced menu items.'
              "
            />

            <form v-else class="space-y-5" @submit.prevent="saveDraft">
              <div
                v-if="detailMode"
                class="rounded-lg border border-default bg-default px-4 py-3"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="min-w-0">
                    <h3 class="truncate text-base font-semibold text-highlighted">
                      {{ draft.name || selectedMenuId || 'Untitled menu' }}
                    </h3>
                    <p class="text-xs text-dimmed">
                      {{ selectedMenuId }} · {{ draft.active ? 'Published' : 'Hidden' }}
                    </p>
                  </div>

                  <UBadge color="neutral" variant="soft">
                    {{ draft.sections.length }} sections
                  </UBadge>
                </div>
              </div>

              <details
                class="rounded-lg border border-default p-4"
                :open="!detailMode"
              >
                <summary class="cursor-pointer select-none text-sm font-semibold text-highlighted">
                  Menu settings
                </summary>

                <div class="mt-4 space-y-4">
                  <div class="grid gap-4 sm:grid-cols-2">
                    <UFormField label="Menu name">
                      <UInput
                        v-model="draft.name"
                        placeholder="Speisekarte"
                        :disabled="busy"
                      />
                    </UFormField>

                    <UFormField label="Menu id">
                      <UInput :model-value="selectedMenuId" disabled />
                    </UFormField>
                  </div>

                  <UFormField label="Description">
                    <UTextarea
                      v-model="draft.description"
                      :rows="2"
                      placeholder="Optional note shown on the public menu."
                      :disabled="busy"
                    />
                  </UFormField>

                  <div class="space-y-3 rounded-lg border border-default p-3">
                    <div>
                      <div class="text-sm font-medium text-highlighted">
                        Name translations
                      </div>
                      <p class="text-xs text-dimmed">
                        Target-language menu names are manual until restaurant glossary overrides are ready.
                      </p>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-2">
                      <UFormField
                        v-for="language in menuLanguageCodes"
                        :key="language"
                        :label="language"
                      >
                        <UInput
                          :model-value="draftNameTranslation(language)"
                          :disabled="busy || language === menuSourceLanguage"
                          @update:model-value="setDraftNameTranslation(language, $event)"
                        />
                      </UFormField>
                    </div>
                  </div>

                  <div class="grid gap-4 sm:grid-cols-2">
                    <UFormField label="Order">
                      <UInput
                        v-model="draft.sort_order"
                        type="number"
                        :disabled="busy"
                      />
                    </UFormField>

                    <div class="flex items-end">
                      <USwitch
                        v-model="draft.active"
                        label="Published"
                        :disabled="busy"
                      />
                    </div>
                  </div>
                </div>
              </details>

              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  type="submit"
                  icon="i-lucide-save"
                  :loading="saving"
                  :disabled="!canSaveDraft"
                >
                  Save menu
                </UButton>

                <UButton
                  type="button"
                  color="error"
                  variant="soft"
                  icon="i-lucide-trash-2"
                  :loading="deleting"
                  :disabled="busy || !selectedMenuId"
                  @click="deleteMenu"
                >
                  Delete
                </UButton>

                <p v-if="message" class="text-xs text-dimmed">
                  {{ message }}
                </p>
              </div>

              <details
                class="rounded-lg border border-default p-4"
                :open="!detailMode"
              >
                <summary class="cursor-pointer select-none text-sm font-semibold text-highlighted">
                  Sections & items
                </summary>

                <div class="mt-4 border-t border-default pt-4">
                  <div class="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 class="text-sm font-semibold text-highlighted">
                      Sections
                    </h3>
                    <p class="text-xs text-dimmed">
                      Add groups such as Antipasti, Pizza, Pasta or Drinks.
                    </p>
                  </div>
                </div>

                  <div class="space-y-4">
                  <div
                    v-for="(section, sectionIndex) in draft.sections"
                    :key="section.local_key"
                    class="rounded-lg border border-default p-3"
                  >
                    <div class="mb-3 flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-highlighted">
                          {{ section.label || 'Untitled section' }}
                        </p>
                        <p class="text-xs text-dimmed">
                          {{ section.id || 'section-id' }}
                        </p>
                      </div>

                      <div class="flex items-center gap-1">
                        <UButton
                          type="button"
                          size="xs"
                          variant="ghost"
                          icon="i-lucide-arrow-up"
                          aria-label="Move section up"
                          :disabled="busy || sectionIndex === 0"
                          @click="moveSection(sectionIndex, -1)"
                        />
                        <UButton
                          type="button"
                          size="xs"
                          variant="ghost"
                          icon="i-lucide-arrow-down"
                          aria-label="Move section down"
                          :disabled="busy || sectionIndex === draft.sections.length - 1"
                          @click="moveSection(sectionIndex, 1)"
                        />
                        <UButton
                          type="button"
                          size="xs"
                          color="error"
                          variant="ghost"
                          icon="i-lucide-trash-2"
                          aria-label="Delete section"
                          :disabled="busy"
                          @click="deleteSection(sectionIndex)"
                        />
                      </div>
                    </div>

                    <div class="grid gap-3 sm:grid-cols-3">
                      <UFormField label="Section title">
                        <UInput
                          v-model="section.label"
                          placeholder="Antipasti"
                          :disabled="busy"
                        />
                      </UFormField>

                      <UFormField label="Id">
                        <UInput
                          v-model="section.id"
                          placeholder="antipasti"
                          :disabled="busy"
                        />
                      </UFormField>

                      <UFormField label="Order">
                        <UInput
                          v-model="section.sort_order"
                          type="number"
                          :disabled="busy"
                        />
                      </UFormField>
                    </div>

                    <UFormField label="Description" class="mt-3">
                      <UTextarea
                        v-model="section.description"
                        :rows="2"
                        :disabled="busy"
                      />
                    </UFormField>

                    <div class="mt-4 space-y-3">
                      <div class="text-xs font-medium uppercase tracking-wide text-dimmed">
                        Items
                      </div>

                      <div
                        v-for="(item, itemIndex) in section.items"
                        :key="item.local_key"
                        class="rounded-md border border-default p-3"
                      >
                        <div class="mb-3 flex items-start justify-between gap-3">
                          <div class="min-w-0">
                            <p class="truncate text-sm font-medium text-highlighted">
                              {{ item.label || 'Untitled item' }}
                            </p>
                            <p class="text-xs text-dimmed">
                              {{ formatDraftPrice(item.price) }}
                            </p>
                          </div>

                          <div class="flex items-center gap-1">
                            <UButton
                              type="button"
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-arrow-up"
                              aria-label="Move item up"
                              :disabled="busy || itemIndex === 0"
                              @click="moveItem(sectionIndex, itemIndex, -1)"
                            />
                            <UButton
                              type="button"
                              size="xs"
                              variant="ghost"
                              icon="i-lucide-arrow-down"
                              aria-label="Move item down"
                              :disabled="busy || itemIndex === section.items.length - 1"
                              @click="moveItem(sectionIndex, itemIndex, 1)"
                            />
                            <UButton
                              type="button"
                              size="xs"
                              color="error"
                              variant="ghost"
                              icon="i-lucide-trash-2"
                              aria-label="Delete item"
                              :disabled="busy"
                              @click="deleteItem(sectionIndex, itemIndex)"
                            />
                          </div>
                        </div>

                        <div class="grid gap-3 sm:grid-cols-4">
                          <UFormField label="Label" class="sm:col-span-2">
                            <UInput
                              v-model="item.label"
                              placeholder="SPAGHETTI CARBONARA"
                              :disabled="busy"
                            />
                          </UFormField>

                          <UFormField label="Id">
                            <UInput
                              v-model="item.id"
                              placeholder="spaghetti-carbonara"
                              :disabled="busy"
                            />
                          </UFormField>

                          <UFormField label="Price">
                            <UInput
                              v-model="item.price"
                              type="number"
                              step="0.05"
                              min="0"
                              placeholder="22.00"
                              :disabled="busy"
                            />
                          </UFormField>
                        </div>

                        <UFormField label="Description" class="mt-3">
                          <UTextarea
                            v-model="item.description"
                            :rows="2"
                            :disabled="busy"
                          />
                        </UFormField>

                        <div class="mt-3 grid gap-3 sm:grid-cols-3">
                          <UFormField label="Dish id (optional)">
                            <UInput
                              v-model="item.dish_id"
                              placeholder="Optional"
                              :disabled="busy"
                            />
                          </UFormField>

                          <UFormField label="Order">
                            <UInput
                              v-model="item.sort_order"
                              type="number"
                              :disabled="busy"
                            />
                          </UFormField>

                          <div class="flex items-end">
                            <USwitch
                              v-model="item.active"
                              label="Visible"
                              :disabled="busy"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="rounded-md border border-dashed border-default p-3">
                        <div class="grid gap-3 sm:grid-cols-[1fr_110px_auto]">
                          <UInput
                            v-model="section.new_item_label"
                            placeholder="New item label"
                            :disabled="busy"
                          />
                          <UInput
                            v-model="section.new_item_price"
                            type="number"
                            step="0.05"
                            min="0"
                            placeholder="Price"
                            :disabled="busy"
                          />
                          <UButton
                            type="button"
                            icon="i-lucide-plus"
                            size="sm"
                            :disabled="busy || !section.new_item_label.trim()"
                            @click="addItem(sectionIndex)"
                          >
                            Add item
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div class="mt-4 rounded-lg border border-dashed border-default p-3">
                  <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <UInput
                      v-model="newSection.label"
                      placeholder="New section title"
                      :disabled="busy"
                    />
                    <UInput
                      v-model="newSection.id"
                      :placeholder="newSectionIdPreview || 'section-id'"
                      :disabled="busy"
                    />
                    <UButton
                      type="button"
                      icon="i-lucide-plus"
                      :disabled="busy || !newSection.label.trim()"
                      @click="addSection"
                    >
                      Add section
                    </UButton>
                  </div>
                  </div>
                </div>
              </details>
            </form>
          </section>
        </div>
      </UCard>

      <DevFireuxDebugPanel
        v-if="isDev"
        title="Kitchen menu editor"
        scope="console"
        :data="debug"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useTranslationSeed } from 'fireux-translation/runtime/useTranslationSeed'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { computed, reactive, ref, watch } from 'vue'
import { getRestaurantMenuGlossaryNames } from '../../../../../composables/fireux/app/kitchen-menu-glossary'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenus'
import type {
  Menu,
  MenuItemDefaults,
  MenuSection,
  MenuSectionItem,
  MenuServiceMode,
} from '../../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    menuId?: string
    detailMode?: boolean
  }>(),
  {
    menuId: '',
    detailMode: false,
  }
)

type ItemDraft = {
  local_key: string
  id: string
  dish_id: string
  label: string
  description: string
  price: string
  active: boolean
  sort_order: number
  photo_url?: string
}

type SectionDraft = {
  local_key: string
  id: string
  label: string
  description: string
  sort_order: number
  defaults?: Partial<MenuItemDefaults>
  new_item_label: string
  new_item_price: string
  items: ItemDraft[]
}

type MenuDraft = {
  name: string
  description: string
  names: Record<string, string>
  descriptions: Record<string, string>
  active: boolean
  defaults?: Partial<MenuItemDefaults>
  service_modes: MenuServiceMode[]
  sections: SectionDraft[]
  sort_order: number
}

const state = useKitchenConsoleMenus()
const {
  selectedKitchen,
  kitchenId,
  collectionPath,
  databaseId,
  canWrite,
  menus,
  debug,
} = state
const { appId } = useFireUXConfig()
const resolveDb = useFirestoreResolver(databaseId)
const toast = useToastify()
const { seedTranslations } = useTranslationSeed()
const isDev = import.meta.dev

const selectedMenuId = ref('')
const draft = ref<MenuDraft | null>(null)
const creating = ref(false)
const saving = ref(false)
const deleting = ref(false)
const message = ref('')
let localCounter = 0

const newMenu = reactive({
  name: '',
  id: '',
  active: true,
  sort_order: 10,
})

const newSection = reactive({
  label: '',
  id: '',
})

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) => normalizeString(value).replace(/_/g, '-')
const normalizeStringMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [normalizeLanguageCode(key), normalizeString(entry)])
      .filter(([key, entry]) => Boolean(key && entry))
  )
}
const normalizeCurrency = (value: unknown) =>
  normalizeString(value).toUpperCase() || 'CHF'
const nextLocalKey = (prefix: string) => `${prefix}-${Date.now()}-${localCounter++}`

const slugify = (value: unknown, fallback: string) => {
  const slug = normalizeString(value)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

const uniqueId = (base: string, used: Set<string>) => {
  let id = base
  let index = 2

  while (used.has(id)) {
    id = `${base}-${index}`
    index += 1
  }

  used.add(id)
  return id
}

const parsePrice = (value: unknown) => {
  const raw = normalizeString(value).replace(',', '.')
  const amount = Number(raw)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

const priceInput = (value: unknown) => {
  const amount = Number(value || 0)
  return amount ? amount.toFixed(2) : ''
}

const numberValue = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const sortedByOrder = <T extends { sort_order?: number; label?: string; name?: string }>(
  items: T[]
) =>
  [...items].sort(
    (a, b) =>
      Number(a?.sort_order || 0) - Number(b?.sort_order || 0) ||
      normalizeString(a?.label || a?.name).localeCompare(
        normalizeString(b?.label || b?.name)
      )
  )

const menusSorted = computed(() => sortedByOrder(menus.value))
const kitchenCurrencyCode = computed(() =>
  normalizeCurrency((selectedKitchen.value as Record<string, unknown> | null)?.currency_code)
)
const menuSourceLanguage = computed(() => {
  const settings = (selectedKitchen.value as Record<string, unknown> | null)
    ?.language_settings as Record<string, unknown> | undefined
  return normalizeLanguageCode(settings?.default_language) || 'de'
})
const menuLanguageCodes = computed(() => {
  const settings = (selectedKitchen.value as Record<string, unknown> | null)
    ?.language_settings as Record<string, unknown> | undefined
  const sourceLanguage = menuSourceLanguage.value
  const rawCodes = Array.isArray(settings?.supported_languages)
    ? settings.supported_languages
    : []
  const seen = new Set<string>()
  const codes: string[] = []

  for (const value of [sourceLanguage, ...rawCodes]) {
    const code = normalizeLanguageCode(value)
    if (!code || seen.has(code)) continue
    seen.add(code)
    codes.push(code)
  }

  return codes.length ? codes : [sourceLanguage]
})
const routeMenuId = computed(() => normalizeString(props.menuId))
const selectedMenu = computed(
  () =>
    menusSorted.value.find(
      (menu) => normalizeString(menu.id) === selectedMenuId.value
    ) ?? null
)
const busy = computed(() => creating.value || saving.value || deleting.value)
const newMenuIdPreview = computed(() => slugify(newMenu.id || newMenu.name, 'menu'))
const newSectionIdPreview = computed(() =>
  slugify(newSection.id || newSection.label, 'section')
)
const canCreateMenu = computed(
  () =>
    canWrite.value &&
    !busy.value &&
    Boolean(collectionPath.value) &&
    Boolean(newMenu.name.trim())
)
const canSaveDraft = computed(
  () =>
    canWrite.value &&
    !busy.value &&
    Boolean(collectionPath.value) &&
    Boolean(selectedMenuId.value) &&
    Boolean(draft.value?.name.trim())
)

watch(
  routeMenuId,
  (nextMenuId) => {
    if (nextMenuId) {
      selectedMenuId.value = nextMenuId
    }
  },
  { immediate: true }
)

watch(
  menusSorted,
  (nextMenus) => {
    if (props.detailMode) {
      if (routeMenuId.value) {
        selectedMenuId.value = routeMenuId.value
      }
      return
    }

    if (!nextMenus.length) {
      selectedMenuId.value = ''
      return
    }

    if (
      !selectedMenuId.value ||
      !nextMenus.some((menu) => normalizeString(menu.id) === selectedMenuId.value)
    ) {
      selectedMenuId.value = normalizeString(nextMenus[0]?.id)
    }
  },
  { immediate: true }
)

watch(
  selectedMenu,
  (menu) => {
    draft.value = menu ? menuToDraft(menu) : null
    message.value = ''
    resetNewSection()
  },
  { immediate: true }
)

watch(
  menusSorted,
  (nextMenus) => {
    const orders = nextMenus
      .map((menu) => Number(menu.sort_order))
      .filter((value) => Number.isFinite(value))
    newMenu.sort_order = orders.length ? Math.max(...orders) + 10 : 10
  },
  { immediate: true }
)

function menuToDraft(menu: Menu): MenuDraft {
  return {
    name: normalizeString(menu.name),
    description: normalizeString(menu.description),
    names: normalizeStringMap(menu.names),
    descriptions: normalizeStringMap(menu.descriptions),
    active: menu.active !== false,
    defaults: menu.defaults ? { ...menu.defaults } : undefined,
    service_modes: Array.isArray(menu.service_modes) && menu.service_modes.length
      ? [...menu.service_modes]
      : ['dine_in'],
    sort_order: numberValue(menu.sort_order, 0),
    sections: sortedByOrder(menu.sections ?? []).map((section) =>
      sectionToDraft(section)
    ),
  }
}

function sectionToDraft(section: MenuSection): SectionDraft {
  return {
    local_key: nextLocalKey('section'),
    id: normalizeString(section.id),
    label: normalizeString(section.label),
    description: normalizeString(section.description),
    sort_order: numberValue(section.sort_order, 0),
    defaults: section.defaults ? { ...section.defaults } : undefined,
    new_item_label: '',
    new_item_price: '',
    items: sortedByOrder(section.items ?? []).map((item) =>
      itemToDraft(item)
    ),
  }
}

function itemToDraft(item: MenuSectionItem): ItemDraft {
  return {
    local_key: nextLocalKey('item'),
    id: normalizeString(item.id),
    dish_id: normalizeString(item.dish_id),
    label: normalizeString(item.label),
    description: normalizeString(item.description),
    price: priceInput(item.price),
    active: item.active !== false,
    sort_order: numberValue(item.sort_order, 0),
    photo_url: normalizeString(item.photo_url) || undefined,
  }
}

function selectMenu(menuId: unknown) {
  selectedMenuId.value = normalizeString(menuId)
}

function draftNameTranslation(language: string) {
  if (!draft.value) return ''
  if (language === menuSourceLanguage.value) return draft.value.name

  return normalizeString(draft.value.names[language])
}

function setDraftNameTranslation(language: string, value: unknown) {
  if (!draft.value) return

  const code = normalizeLanguageCode(language)
  if (!code) return

  if (code === menuSourceLanguage.value) {
    draft.value.name = normalizeString(value)
    return
  }

  const next = normalizeString(value)
  if (next) {
    draft.value.names[code] = next
  } else {
    delete draft.value.names[code]
  }
}

function resetNewMenu() {
  newMenu.name = ''
  newMenu.id = ''
  newMenu.active = true
}

function resetNewSection() {
  newSection.label = ''
  newSection.id = ''
}

function resetOrder<T extends { sort_order: number }>(items: T[]) {
  items.forEach((item, index) => {
    item.sort_order = (index + 1) * 10
  })
}

function moveArrayItem<T>(items: T[], index: number, delta: number) {
  const nextIndex = index + delta
  if (nextIndex < 0 || nextIndex >= items.length) return false

  const [item] = items.splice(index, 1)
  items.splice(nextIndex, 0, item)
  return true
}

function addSection() {
  if (!draft.value || !newSection.label.trim()) return

  const used = new Set(draft.value.sections.map((section) => normalizeString(section.id)))
  const id = uniqueId(
    slugify(newSection.id || newSection.label, 'section'),
    used
  )
  const nextOrder = draft.value.sections.length
    ? Math.max(...draft.value.sections.map((section) => numberValue(section.sort_order))) + 10
    : 10
  const section: SectionDraft = {
    local_key: nextLocalKey('section'),
    id,
    label: newSection.label.trim(),
    description: '',
    sort_order: nextOrder,
    new_item_label: '',
    new_item_price: '',
    items: [],
  }

  draft.value.sections.push(section)
  resetNewSection()
}

function deleteSection(index: number) {
  if (!draft.value) return
  if (!confirmDelete('Delete this section and its menu items?')) return

  draft.value.sections.splice(index, 1)
  resetOrder(draft.value.sections)
}

function moveSection(index: number, delta: number) {
  if (!draft.value) return
  if (moveArrayItem(draft.value.sections, index, delta)) {
    resetOrder(draft.value.sections)
  }
}

function addItem(sectionIndex: number) {
  if (!draft.value) return

  const section = draft.value.sections[sectionIndex]
  if (!section) return

  if (!section.new_item_label.trim()) return

  const used = new Set(section.items.map((item) => normalizeString(item.id)))
  const id = uniqueId(slugify(section.new_item_label, 'item'), used)
  const nextOrder = section.items.length
    ? Math.max(...section.items.map((item) => numberValue(item.sort_order))) + 10
    : 10

  section.items.push({
    local_key: nextLocalKey('item'),
    id,
    dish_id: '',
    label: section.new_item_label.trim(),
    description: '',
    price: section.new_item_price,
    active: true,
    sort_order: nextOrder,
  })

  section.new_item_label = ''
  section.new_item_price = ''
}

function deleteItem(sectionIndex: number, itemIndex: number) {
  if (!draft.value) return
  if (!confirmDelete('Delete this menu item?')) return

  const section = draft.value.sections[sectionIndex]
  if (!section) return

  section.items.splice(itemIndex, 1)
  resetOrder(section.items)
}

function moveItem(sectionIndex: number, itemIndex: number, delta: number) {
  if (!draft.value) return

  const section = draft.value.sections[sectionIndex]
  if (!section) return

  if (moveArrayItem(section.items, itemIndex, delta)) {
    resetOrder(section.items)
  }
}

function draftToPatch(source: MenuDraft): Partial<Menu> {
  const sectionIds = new Set<string>()
  const sections: MenuSection[] = source.sections.map((section) => {
    const itemIds = new Set<string>()
    const sectionId = uniqueId(
      slugify(section.id || section.label, 'section'),
      sectionIds
    )
    const items: MenuSectionItem[] = section.items.map((item) => {
      const itemId = uniqueId(slugify(item.id || item.label, 'item'), itemIds)
      const dishId = normalizeString(item.dish_id)
      const next: MenuSectionItem = {
        id: itemId,
        label: normalizeString(item.label) || itemId,
        description: normalizeString(item.description),
        price: parsePrice(item.price),
        active: item.active !== false,
        sort_order: numberValue(item.sort_order, 0),
      }

      if (dishId) next.dish_id = dishId
      if (item.photo_url) next.photo_url = item.photo_url

      return next
    })

    const nextSection: MenuSection = {
      id: sectionId,
      label: normalizeString(section.label) || sectionId,
      description: normalizeString(section.description),
      sort_order: numberValue(section.sort_order, 0),
      items,
    }
    const sectionLabels = getRestaurantMenuGlossaryNames(nextSection.label)
    if (sectionLabels) nextSection.labels = sectionLabels

    if (section.defaults) nextSection.defaults = { ...section.defaults }

    return nextSection
  })

  return {
    name: normalizeString(source.name),
    description: normalizeString(source.description),
    active: source.active !== false,
    defaults: source.defaults ?? {
      active: true,
      description: '',
      photo_url: '',
    },
    service_modes: source.service_modes.length ? source.service_modes : ['dine_in'],
    sections,
    sort_order: numberValue(source.sort_order, 0),
  }
}

async function buildMenuTranslationPatch(source: {
  name: unknown
  description?: unknown
  names?: unknown
  descriptions?: unknown
}) {
  const name = normalizeString(source.name)
  const description = normalizeString(source.description)
  const sourceLanguage = menuSourceLanguage.value
  const languageCodes = menuLanguageCodes.value
  // TODO: Restaurant menu terms need glossary overrides before generic translation.
  // Examples: Hauptkarte -> Main Menu, Speisekarte -> Menu, Beilagen -> Side Dishes,
  // Vorspeisen -> Starters.
  const glossaryNames = getRestaurantMenuGlossaryNames(name)
  const nameSeed = await seedTranslations({
    text: name,
    sourceLanguage,
    languageCodes,
    existingText: glossaryNames || source.names,
    translate: false,
  })
  const descriptionSeed = description
    ? await seedTranslations({
        text: description,
        sourceLanguage: nameSeed.sourceLanguage,
        languageCodes,
        existingText: source.descriptions,
        translate: false,
      })
    : null

  return {
    source_language: nameSeed.sourceLanguage,
    names: nameSeed.text,
    descriptions: descriptionSeed?.text ?? {},
    failedLanguages: Array.from(
      new Set([
        ...nameSeed.failedLanguages,
        ...(descriptionSeed?.failedLanguages ?? []),
      ])
    ),
  }
}

function savedToast(
  title: string,
  failedLanguages: string[],
  fallbackMessage: string
) {
  if (!failedLanguages.length) {
    message.value = fallbackMessage
    toast.add({ title, icon: 'i-heroicons-check-circle' })
    return
  }

  const failed = failedLanguages.join(', ')
  message.value = `${fallbackMessage} Translation failed for: ${failed}.`
  toast.add({
    title,
    description: `Translation failed for: ${failed}`,
    color: 'amber',
    icon: 'i-heroicons-exclamation-triangle',
  })
}

function formatDraftPrice(value: unknown) {
  return new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: kitchenCurrencyCode.value,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parsePrice(value))
}

function confirmDelete(prompt: string) {
  return typeof window === 'undefined' ? true : window.confirm(prompt)
}

async function createMenu() {
  if (!canCreateMenu.value) return

  creating.value = true
  message.value = ''

  try {
    const id = newMenuIdPreview.value
    const existing = menus.value.some(
      (menu) => normalizeString(menu.id).toLowerCase() === id.toLowerCase()
    )

    if (existing) {
      throw new Error('A menu with this id already exists.')
    }

    const user = await useRequireUser()
    const stamp = serverTimestamp()
    const translated = await buildMenuTranslationPatch({
      name: newMenu.name,
      description: '',
    })
    const { failedLanguages, ...translatedFields } = translated
    const payload: Partial<Menu> = {
      kitchen_id: kitchenId.value,
      name: normalizeString(newMenu.name),
      description: '',
      ...translatedFields,
      active: newMenu.active,
      defaults: {
        active: true,
        description: '',
        photo_url: '',
      },
      service_modes: ['dine_in'],
      sections: [],
      sort_order: numberValue(newMenu.sort_order, 0),
      created: {
        at: stamp as any,
        by: user.uid,
        app_id: appId,
      },
      updated: {
        at: stamp as any,
        by: user.uid,
      },
    }

    await setDoc(doc(resolveDb(), collectionPath.value, id), payload)
    selectedMenuId.value = id
    resetNewMenu()
    savedToast('Menu created', failedLanguages, 'Created.')
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    message.value = description
    toast.add({
      title: 'Failed to create menu',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    creating.value = false
  }
}

async function saveDraft() {
  if (!draft.value || !canSaveDraft.value) return

  saving.value = true
  message.value = ''

  try {
    const user = await useRequireUser()
    const patch = draftToPatch(draft.value)
    const translated = await buildMenuTranslationPatch({
      name: patch.name,
      description: patch.description,
      names: draft.value.names,
      descriptions: draft.value.descriptions,
    })
    const { failedLanguages, ...translatedFields } = translated
    const payload: Partial<Menu> = {
      kitchen_id: kitchenId.value,
      ...patch,
      ...translatedFields,
      updated: {
        at: serverTimestamp() as any,
        by: user.uid,
      },
    }

    await setDoc(
      doc(resolveDb(), collectionPath.value, selectedMenuId.value),
      payload,
      { merge: true }
    )
    savedToast('Menu saved', failedLanguages, 'Saved.')
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    message.value = description
    toast.add({
      title: 'Failed to save menu',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    saving.value = false
  }
}

async function deleteMenu() {
  if (!canWrite.value || !collectionPath.value || !selectedMenuId.value || busy.value) {
    return
  }
  if (!confirmDelete('Delete this menu?')) return

  deleting.value = true
  message.value = ''

  try {
    await useRequireUser()
    await deleteDoc(doc(resolveDb(), collectionPath.value, selectedMenuId.value))
    selectedMenuId.value = ''
    if (props.detailMode) {
      await navigateTo('/console/kitchen/menus')
    }
    toast.add({ title: 'Menu deleted', icon: 'i-heroicons-check-circle' })
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    message.value = description
    toast.add({
      title: 'Failed to delete menu',
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
