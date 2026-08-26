<!-- flag -->
<!-- Concurrent edit — 2026-07-20 23:38 CEST — Final app CSS pass: semantic form colors. -->
<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: localize object-array rhythm at its sole owner. -->
<template>
  <div class="object-array">
    <USeparator />
    <div class="object-array__header">
      <h3 v-if="label" class="fx-type-card-title">{{ label }}</h3>
      <div v-if="editingIndex === null" class="object-array__actions">
        <slot
          name="create"
          v-bind="{ push, canPush, count: itemCount, max: maxItems }"
        />
      </div>
    </div>

    <div>
      <div v-if="creatingItem">
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
                class="mt-2 rounded border border-dashed border-primary/30 bg-primary/10 p-4"
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
      <ul v-else class="object-array__list grid gap-3">
        <li v-for="(item, index) in items" :key="index">
          <UCard>
            <div class="relative group">
              <div class="object-array__item-body grid gap-3">
                <div v-if="editingIndex !== index">
                  <div
                    v-if="
                      getItemTitle(item, index) ||
                      getItemDate(item, index) ||
                      showActions
                    "
                    class="object-array__item-header"
                  >
                    <div class="object-array__item-title">
                      <h3
                        v-if="getItemTitle(item, index)"
                        class="fx-type-card-title"
                      >
                        {{ getItemTitle(item, index) }}
                      </h3>
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
                    <div
                      v-if="getItemSubtitle(item, index)"
                      class="text-sm leading-normal text-muted"
                    >
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
                    <div
                      class="rounded border border-dashed border-primary/30 bg-primary/10 p-4"
                    >
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
                            :label="
                              field.label || field.placeholder || field.key
                            "
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
import { computed, ref, useSlots } from 'vue'
import {
  defaultObjectArrayDateSortFields,
  objectArrayHasDateFields,
  sortObjectArrayByDate,
  type ObjectArrayDateSortFields,
} from './object-array-date-sort'

// Concurrent edit — 2026-07-20 19:22 CEST — Repo Efficiency Pass 2 of 6: bound reusable object-array creation.

type ObjectArrayField = {
  key: string
  type: 'text' | 'textarea' | 'checkbox'
  label?: string
  placeholder?: string
  rows?: number
}

const props = defineProps<{
  label?: string
  value: any[] | undefined
  update: (value: any[]) => Promise<void> | void
  itemTitle?: (item: any, index: number) => string
  itemDate?: (item: any, index: number) => string
  itemSubtitle?: (item: any, index: number) => string
  emptyText?: string
  showActions?: boolean
  fields?: ObjectArrayField[]
  sortByDate?: boolean
  dateFields?: ObjectArrayDateSortFields
  maxItems?: number
}>()

const slots = useSlots()

const editingIndex = ref<number | null>(null)
const draftItem = ref<any | null>(null)
const creatingItem = ref(false)
const emptyText = computed(() => props.emptyText ?? 'No items yet.')
const hasDisplaySlot = computed(() => Boolean(slots.display))
const hasEditSlot = computed(() => Boolean(slots.edit))
const showActions = computed(() => props.showActions ?? !hasDisplaySlot.value)
const fields = computed(() => props.fields ?? [])
const hasSchema = computed(() => fields.value.length > 0)
const sortByDate = computed(() => props.sortByDate ?? true)
const dateFields = computed(() => ({
  ...defaultObjectArrayDateSortFields,
  ...(props.dateFields ?? {}),
}))

const items = computed(() => {
  const src = props.value || []
  if (!src.length) return src
  if (editingIndex.value !== null) return src
  if (!sortByDate.value) return src
  if (!objectArrayHasDateFields(src, dateFields.value)) return src
  return sortObjectArrayByDate(src, dateFields.value)
})

const maxItems = computed<number | undefined>(() => {
  if (props.maxItems === undefined) return undefined
  return Number.isSafeInteger(props.maxItems) && props.maxItems >= 0
    ? props.maxItems
    : 0
})
const itemCount = computed(() => items.value.length)
const hasCapacity = (count = itemCount.value) =>
  maxItems.value === undefined || count < maxItems.value
const canPush = computed(() => editingIndex.value === null && hasCapacity())

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

function startItemEditing(index: number) {
  creatingItem.value = false
  editingIndex.value = index
  draftItem.value = shallowClone(items.value[index])
}

function cancelItemEditing() {
  creatingItem.value = false
  editingIndex.value = null
  draftItem.value = null
}

async function saveItemEditing() {
  if (editingIndex.value === null) return
  const idx = editingIndex.value
  const src = items.value

  let next: any[]
  if (creatingItem.value) {
    if (!hasCapacity(src.length)) return
    next = [...src, draftItem.value]
  } else {
    if (idx < 0 || idx >= src.length) return
    next = [...src.slice(0, idx), draftItem.value, ...src.slice(idx + 1)]
  }

  if (maxItems.value !== undefined && next.length > maxItems.value) return

  await props.update(next)
  cancelItemEditing()
}

function push(item: any) {
  if (!canPush.value) return false
  creatingItem.value = true
  editingIndex.value = items.value.length
  draftItem.value = shallowClone(item)
  return true
}

async function remove(index: number) {
  const src = items.value
  const next = [...src.slice(0, index), ...src.slice(index + 1)]
  await props.update(next)
  if (editingIndex.value === index) cancelItemEditing()
}

defineExpose({
  startItemEditing,
  cancelItemEditing,
  saveItemEditing,
  push,
  remove,
  editingIndex,
  canPush,
  itemCount,
  maxItems,
})
</script>

<style scoped src="./ObjectArray.css"></style>
