<!-- flag -->
<template>
  <div class="object-array">
    <USeparator />
    <div class="object-array__header">
      <h3 v-if="label">{{ label }}</h3>
      <div v-if="editingIndex === null" class="object-array__actions">
        <slot name="create" :push="push" />
      </div>
    </div>

    <div>
      <div v-if="editingIndex === items.length">
        <UCard>
          <div class="relative group">
            <div v-if="!hasEditSlot" class="mt-3 flex gap-2">
              <UButton
                size="xs"
                variant="solid"
                icon="i-lucide-check"
                @click="saveItemEditing"
              >
                Save
              </UButton>
              <UButton
                size="xs"
                variant="soft"
                icon="i-lucide-x"
                @click="cancelItemEditing"
              >
                Cancel
              </UButton>
            </div>
            <slot
              name="edit"
              :item="draftItem"
              :index="editingIndex"
              :remove="cancelItemEditing"
              :mode="'edit'"
              :is-editing="true"
              :save="saveItemEditing"
              :cancel="cancelItemEditing"
            >
              <div
                class="p-4 border border-dashed border-primary-300 rounded bg-primary-50 mt-2"
              >
                Default create/edit rendering for index {{ editingIndex }}
              </div>
            </slot>

            <div
              v-if="!hasEditSlot"
              class="absolute top-2 left-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition"
            >
              <UButton
                size="xs"
                variant="solid"
                icon="i-lucide-check"
                aria-label="Save new item"
                @click="saveItemEditing"
              >
                Save
              </UButton>
              <UButton
                size="xs"
                variant="soft"
                icon="i-lucide-x"
                aria-label="Cancel create"
                @click="cancelItemEditing"
              >
                Cancel
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
      <div v-if="!items || items.length === 0">{{ emptyText }}</div>
      <ul v-else class="object-array__list form-stack-sm">
        <li v-for="(item, index) in items" :key="index">
          <UCard>
            <div class="relative group">
              <div class="object-array__item-body form-stack-sm">
                <div v-if="editingIndex !== index">
                  <div
                    v-if="getItemTitle(item, index) || getItemDate(item, index) || showActions"
                    class="object-array__item-header"
                  >
                    <div class="object-array__item-title">
                      <h3 v-if="getItemTitle(item, index)">{{ getItemTitle(item, index) }}</h3>
                    </div>
                    <div class="object-array__item-actions">
                      <UBadge
                        v-if="getItemDate(item, index)"
                        size="md"
                        color="secondary"
                        variant="subtle"
                      >
                        {{ getItemDate(item, index) }}
                      </UBadge>
                      <UButton
                        v-if="showActions"
                        size="xs"
                        variant="soft"
                        icon="i-lucide-pencil"
                        @click="startItemEditing(index)"
                      />
                      <UButton
                        v-if="showActions"
                        size="xs"
                        variant="ghost"
                        color="error"
                        icon="i-lucide-trash-2"
                        @click="remove(index)"
                      />
                    </div>
                  </div>
                  <slot
                    v-if="hasDisplaySlot"
                    name="display"
                    :item="item"
                    :index="index"
                    :mode="'display'"
                    :is-editing="false"
                    :start-editing="() => startItemEditing(index)"
                    :remove="() => remove(index)"
                  />
                  <div v-else>
                    <div v-if="getItemSubtitle(item, index)" class="form-text-body">
                      {{ getItemSubtitle(item, index) }}
                    </div>
                  </div>
                </div>
                <div v-else>
                  <slot
                    name="edit"
                    :item="draftItem"
                    :index="index"
                    :remove="() => remove(index)"
                    :mode="'edit'"
                    :is-editing="true"
                    :save="saveItemEditing"
                    :cancel="cancelItemEditing"
                  >
                    <div class="p-4 border border-dashed border-primary-300 rounded bg-primary-50">
                      <div v-if="hasSchema" class="space-y-3">
                        <div
                          v-for="field in fields"
                          :key="field.key"
                          class="space-y-1"
                        >
                          <div
                            v-if="field.label && field.type !== 'checkbox'"
                            class="text-xs font-medium text-dimmed"
                          >
                            {{ field.label }}
                          </div>

                          <UInput
                            v-if="field.type === 'text'"
                            v-model="draftItem[field.key]"
                            :placeholder="field.placeholder || field.label"
                          />

                          <UTextarea
                            v-else-if="field.type === 'textarea'"
                            v-model="draftItem[field.key]"
                            :rows="field.rows || 3"
                            :placeholder="field.placeholder || field.label"
                          />

                          <UCheckbox
                            v-else-if="field.type === 'checkbox'"
                            v-model="draftItem[field.key]"
                            :label="field.label || field.placeholder || field.key"
                          />
                        </div>

                        <div class="mt-3 flex gap-2">
                          <UButton
                            size="xs"
                            variant="solid"
                            icon="i-lucide-check"
                            @click="saveItemEditing"
                          >
                            Save
                          </UButton>
                          <UButton
                            size="xs"
                            variant="soft"
                            icon="i-lucide-x"
                            @click="cancelItemEditing"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </div>

                      <div v-else>
                        Default edit rendering for index {{ index }}
                        <div class="mt-3 flex gap-2">
                          <UButton
                            size="xs"
                            variant="solid"
                            icon="i-lucide-check"
                            @click="saveItemEditing"
                          >
                            Save
                          </UButton>
                          <UButton
                            size="xs"
                            variant="soft"
                            icon="i-lucide-x"
                            @click="cancelItemEditing"
                          >
                            Cancel
                          </UButton>
                        </div>
                      </div>
                    </div>
                  </slot>
                </div>
              </div>
            </div>
          </UCard>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

type DateSortFields = {
  ongoingKey?: string
  fromYearKey?: string
  fromMonthKey?: string
  toYearKey?: string
  toMonthKey?: string
  startYearKey?: string
  endYearKey?: string
}

const defaultDateFields: Required<DateSortFields> = {
  ongoingKey: 'ongoing',
  fromYearKey: 'from_year',
  fromMonthKey: 'from_month',
  toYearKey: 'to_year',
  toMonthKey: 'to_month',
  startYearKey: 'start_year',
  endYearKey: 'end_year',
}

const props = defineProps<{
  label?: string
  firebaseValue: any[] | undefined
  updateFunction: (value: any[]) => Promise<void> | void
  itemTitle?: (item: any, index: number) => string
  itemDate?: (item: any, index: number) => string
  itemSubtitle?: (item: any, index: number) => string
  emptyText?: string
  showActions?: boolean
  fields?: ObjectArrayField[]
  sortByDate?: boolean
  dateFields?: DateSortFields
}>()

const slots = useSlots()

const editingIndex = ref<number | null>(null)
const draftItem = ref<any | null>(null)
const emptyText = computed(() => props.emptyText ?? 'No items yet.')
const hasDisplaySlot = computed(() => Boolean(slots.display))
const hasEditSlot = computed(() => Boolean(slots.edit))
const showActions = computed(() => props.showActions ?? !hasDisplaySlot.value)
const fields = computed(() => props.fields ?? [])
const hasSchema = computed(() => fields.value.length > 0)
const sortByDate = computed(() => props.sortByDate ?? true)
const dateFields = computed(() => ({
  ...defaultDateFields,
  ...(props.dateFields ?? {}),
}))

const items = computed(() => {
  const src = props.firebaseValue || []
  if (!src.length) return src
  if (editingIndex.value !== null) return src
  if (!sortByDate.value) return src
  if (!shouldSortByDate(src, dateFields.value)) return src
  return sortItemsByDate(src, dateFields.value)
})

const getItemTitle = (item: any, index: number) =>
  props.itemTitle ? props.itemTitle(item, index) : ''

const getItemDate = (item: any, index: number) =>
  props.itemDate ? props.itemDate(item, index) : ''

const getItemSubtitle = (item: any, index: number) =>
  props.itemSubtitle ? props.itemSubtitle(item, index) : ''

function shallowClone<T>(v: T): T {
  if (Array.isArray(v)) return v.slice() as unknown as T
  if (v && typeof v === 'object') return { ...(v as any) } as T
  return v
}

function shouldSortByDate(list: any[], fields: Required<DateSortFields>) {
  return list.some((item) =>
    item && (
      fields.ongoingKey in item ||
      fields.fromYearKey in item ||
      fields.fromMonthKey in item ||
      fields.toYearKey in item ||
      fields.toMonthKey in item ||
      fields.startYearKey in item ||
      fields.endYearKey in item
    )
  )
}

function monthToNumber(value: unknown): number | null {
  if (value == null) return null
  const raw = String(value).trim().toLowerCase()
  if (!raw) return null
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return numeric
  const short = raw.slice(0, 3)
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const idx = months.indexOf(short)
  return idx >= 0 ? idx + 1 : null
}

function toNumber(value: unknown): number | null {
  const raw = typeof value === 'number' ? value : Number(String(value ?? '').trim())
  return Number.isFinite(raw) ? raw : null
}

function resolveDateParts(item: any, fields: Required<DateSortFields>) {
  const ongoing = Boolean(item?.[fields.ongoingKey])
  const fromYear = toNumber(item?.[fields.fromYearKey] ?? item?.[fields.startYearKey])
  const fromMonth = monthToNumber(item?.[fields.fromMonthKey])
  const toYear = toNumber(item?.[fields.toYearKey] ?? item?.[fields.endYearKey])
  const toMonth = monthToNumber(item?.[fields.toMonthKey])

  const startValue = fromYear ? (fromYear * 12 + (fromMonth ?? 1)) : null
  const endValue = ongoing
    ? Number.POSITIVE_INFINITY
    : toYear
      ? (toYear * 12 + (toMonth ?? 1))
      : null

  return { ongoing, startValue, endValue }
}

function sortItemsByDate(list: any[], fields: Required<DateSortFields>) {
  return list
    .map((item, index) => ({ item, index, ...resolveDateParts(item, fields) }))
    .sort((a, b) => {
      if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1

      const endA = a.endValue ?? -Infinity
      const endB = b.endValue ?? -Infinity
      if (endA !== endB) return endB - endA

      const startA = a.startValue ?? -Infinity
      const startB = b.startValue ?? -Infinity
      if (startA !== startB) return startB - startA

      return a.index - b.index
    })
    .map((row) => row.item)
}

function startItemEditing(index: number) {
  editingIndex.value = index
  draftItem.value = shallowClone(items.value[index])
}

function cancelItemEditing() {
  editingIndex.value = null
  draftItem.value = null
}

async function saveItemEditing() {
  if (editingIndex.value === null) return
  const idx = editingIndex.value
  const src = items.value

  let next: any[]
  if (idx < src.length) {
    // update existing
    next = [...src.slice(0, idx), draftItem.value, ...src.slice(idx + 1)]
  } else {
    // append new
    next = [...src, draftItem.value]
  }

  await props.updateFunction(next)
  cancelItemEditing()
}

function push(item: any) {
  if (editingIndex.value !== null) return
  editingIndex.value = items.value.length
  draftItem.value = shallowClone(item)
}

async function remove(index: number) {
  const src = items.value
  const next = [...src.slice(0, index), ...src.slice(index + 1)]
  await props.updateFunction(next)
  if (editingIndex.value === index) cancelItemEditing()
}

defineExpose({
  startItemEditing,
  cancelItemEditing,
  saveItemEditing,
  push,
  remove,
  editingIndex,
})
</script>

<style scoped>
.object-array {
  display: grid;
  gap: 0.75rem;
}

.object-array__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.object-array__item-body {
  position: relative;
}

.object-array__item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.object-array__item-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.object-array__item-title h3 {
  margin: 0;
}

.object-array__item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
