<template>
  <div>
    <div v-if="label">{{ label }}</div>

    <!-- Controls -->
    <div>
      <template v-if="!isEditing">
        <button type="button" @click="startEditing">Edit</button>
      </template>
      <template v-else>
        <button type="button" @click="saveChanges">Save</button>
        <button type="button" @click="cancelEditing">Cancel</button>
        <button type="button" @click="clearAll">Clear</button>
      </template>
      <div v-if="errorMessage">{{ errorMessage }}</div>
    </div>

    <!-- Display mode -->
    <div v-if="!isEditing">
      <div v-if="!items || items.length === 0">{{ i18n.empty }}</div>
      <div v-else>
        <div v-for="(item, index) in items" :key="getKey(item, index)">
          <slot name="display" :item="item" :index="index">
            <pre>{{ item }}</pre>
          </slot>
        </div>
      </div>
    </div>

    <!-- Edit mode -->
    <div v-else>
      <div v-if="localItems.length === 0">{{ i18n.empty }}</div>
      <div v-else>
        <div v-for="(item, index) in localItems" :key="getKey(item, index)">
          <slot name="edit" :item="item" :index="index" :remove="() => remove(index)">
            <pre>{{ item }}</pre>
            <div>
              <button type="button" @click="remove(index)">Remove</button>
            </div>
          </slot>
        </div>
      </div>

      <!-- Create new item -->
      <div>
        <slot name="create" :push="push"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRaw } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: Array as () => any[] | undefined, default: () => [] },
  canEdit: { type: Boolean, default: true },
  getKey: {
    type: Function as () => (item: any, index: number) => string | number,
    default: () => (item: any, i: number) => i,
  },
  updateFunction: {
    type: Function as () => (value: any[]) => Promise<void>,
    required: true,
  },
  i18n: {
    type: Object as () => { empty?: string },
    default: () => ({ empty: 'No items yet.' }),
  },
})

const isEditing = ref(false)
const errorMessage = ref('')
const localItems = ref<any[]>([])

const items = computed(() => props.firebaseValue || [])

function deepClone<T>(val: T): T {
  try {
    const raw = toRaw(val as any)
    return JSON.parse(JSON.stringify(raw))
  } catch {
    if (Array.isArray(val)) return [...(val as any[])] as unknown as T
    if (val && typeof val === 'object') return { ...(val as any) } as T
    return val as T
  }
}

watch(
  () => props.firebaseValue,
  (val) => {
    if (!isEditing.value) localItems.value = Array.isArray(val) ? deepClone(val) : []
  },
  { immediate: true }
)

function startEditing() {
  if (!props.canEdit) return
  errorMessage.value = ''
  localItems.value = deepClone(items.value)
  isEditing.value = true
}

function cancelEditing() {
  localItems.value = deepClone(items.value)
  isEditing.value = false
  errorMessage.value = ''
}

async function saveChanges() {
  try {
    errorMessage.value = ''
    await props.updateFunction(deepClone(localItems.value))
    isEditing.value = false
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to save changes'
  }
}

async function clearAll() {
  try {
    errorMessage.value = ''
    localItems.value = []
    await props.updateFunction([])
    isEditing.value = false
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to clear items'
  }
}

function push(item: any) {
  localItems.value.push(item)
}

function remove(index: number) {
  localItems.value.splice(index, 1)
}
</script>
