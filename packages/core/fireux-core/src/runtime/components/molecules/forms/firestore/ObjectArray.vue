<template>
  <div class="object-array">
    <div class="object-array__header">
      <h3 v-if="label" class="object-array__title">{{ label }}</h3>
      <div v-if="editingIndex === null" class="object-array__actions">
        <slot name="create" :push="push" />
      </div>
    </div>

    <div>
      <div v-if="!items || items.length === 0">No items yet.</div>
      <ul v-else class="object-array__list">
        <li v-for="(item, index) in items" :key="index">
          <UCard>
            <div class="relative group">
              <div class="space-y-2">
                <div v-if="editingIndex !== index">
                  <slot
                    name="display"
                    :item="item"
                    :index="index"
                    :mode="'display'"
                    :is-editing="false"
                    :start-editing="() => startItemEditing(index)"
                    :remove="() => remove(index)"
                  >
                    <div
                      class="p-4 border border-dashed border-gray-300 rounded"
                    >
                      Default display rendering for index {{ index }}
                      <div class="mt-3 flex gap-2">
                        <UButton
                          size="xs"
                          variant="soft"
                          icon="i-lucide-pencil"
                          @click="startItemEditing(index)"
                        >
                          Edit
                        </UButton>
                        <UButton
                          size="xs"
                          variant="ghost"
                          color="error"
                          icon="i-lucide-trash-2"
                          @click="remove(index)"
                        >
                          Remove
                        </UButton>
                      </div>
                    </div>
                  </slot>
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
                      class="p-4 border border-dashed border-primary-300 rounded bg-primary-50"
                    >
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
                  </slot>
                </div>
              </div>
            </div>
          </UCard>
        </li>
      </ul>
    </div>

    <div v-if="editingIndex === items.length">
      <UCard>
        <div class="relative group">
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
          <slot
            name="edit"
            :item="draftItem"
            :index="editingIndex"
            :remove="cancelItemEditing"
            :mode="'edit'"
            :is-editing="true"
          >
            <div
              class="p-4 border border-dashed border-primary-300 rounded bg-primary-50 mt-2"
            >
              Default create/edit rendering for index {{ editingIndex }}
            </div>
          </slot>

          <div
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  label?: string
  firebaseValue: any[] | undefined
  updateFunction: (value: any[]) => Promise<void> | void
}>()

const items = computed(() => props.firebaseValue || [])
const editingIndex = ref<number | null>(null)
const draftItem = ref<any | null>(null)

function shallowClone<T>(v: T): T {
  if (Array.isArray(v)) return v.slice() as unknown as T
  if (v && typeof v === 'object') return { ...(v as any) } as T
  return v
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
