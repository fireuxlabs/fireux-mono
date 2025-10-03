<template>
  <div>
    <!-- Header + Controls -->
    <div class="flex items-center justify-between mb-3 gap-3">
      <h3 v-if="label" class="text-base font-semibold">{{ label }}</h3>
      <div class="flex items-center gap-2 ml-auto">
        <template v-if="!isEditing">
          <UButton
            :disabled="!canEdit"
            :aria-disabled="!canEdit"
            icon="i-lucide-pencil"
            color="primary"
            variant="soft"
            size="xs"
            @click="startEditing"
          >
            {{ i18n.edit || 'Edit' }}
          </UButton>
        </template>
        <template v-else>
          <UButton
            :disabled="!isDirty"
            :aria-disabled="!isDirty"
            icon="i-lucide-check"
            color="primary"
            variant="solid"
            size="xs"
            @click="saveChanges"
          >
            {{ i18n.save || 'Save' }}
          </UButton>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="soft"
            size="xs"
            @click="cancelEditing"
          >
            {{ i18n.cancel || 'Cancel' }}
          </UButton>
          <UButton
            :disabled="!canClearAll"
            :aria-disabled="!canClearAll"
            :title="!canClearAll && minItems > 0 ? 'Minimum items required' : ''"
            icon="i-lucide-trash-2"
            color="error"
            variant="soft"
            size="xs"
            @click="clearAll"
          >
            {{ i18n.clear || 'Clear' }}
          </UButton>
        </template>
      </div>
    </div>
    <div v-if="errorMessage" role="alert" aria-live="polite" class="text-sm text-red-600 mb-2">
      {{ errorMessage }}
    </div>

    <!-- Display mode -->
    <div v-if="!isEditing">
      <div v-if="!items || items.length === 0" aria-live="polite">
        {{ i18n.empty }}
      </div>
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
      <div v-if="localItems.length === 0" aria-live="polite">
        {{ i18n.empty }}
      </div>
      <div v-else>
        <div v-for="(item, index) in localItems" :key="getKey(item, index)">
          <slot
            name="edit"
            :item="item"
            :index="index"
            :remove="() => remove(index)"
          >
            <pre>{{ item }}</pre>
            <div class="mt-2">
              <UButton
                :disabled="!canRemoveMore"
                :aria-disabled="!canRemoveMore"
                icon="i-lucide-trash-2"
                color="neutral"
                variant="soft"
                size="xs"
                @click="remove(index)"
              >
                {{ i18n.remove || 'Remove' }}
              </UButton>
            </div>
          </slot>
        </div>
      </div>

      <!-- Create new item -->
      <div>
        <slot
          name="create"
          :push="push"
          :can-add="canAdd"
          :max-items="maxItems"
        ></slot>
        <div v-if="!canAdd" aria-live="polite">
          {{ i18n.maxReached || 'Maximum items reached' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, toRaw, defineEmits, defineExpose } from 'vue'

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
    type: Object as () => {
      empty?: string
      edit?: string
      save?: string
      cancel?: string
      clear?: string
      remove?: string
      maxReached?: string
    },
    default: () => ({ empty: 'No items yet.' }),
  },
  minItems: { type: Number, default: 0 },
  maxItems: { type: Number, default: Infinity },
  confirmClear: { type: Boolean, default: true },
})

const emit = defineEmits<{
  (e: 'edit-start'): void
  (e: 'save', value: any[]): void
  (e: 'cancel'): void
  (e: 'change', value: any[]): void
  (e: 'clear'): void
  (e: 'error', message: string): void
}>()

const isEditing = ref(false)
const errorMessage = ref('')
const localItems = ref<any[]>([])

const items = computed(() => props.firebaseValue || [])
const isDirty = computed(
  () => JSON.stringify(localItems.value) !== JSON.stringify(items.value)
)
const canAdd = computed(() => localItems.value.length < props.maxItems)
const canRemoveMore = computed(() => localItems.value.length > props.minItems)
const canClearAll = computed(
  () => localItems.value.length > 0 && props.minItems === 0
)

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
    if (!isEditing.value)
      localItems.value = Array.isArray(val) ? deepClone(val) : []
  },
  { immediate: true }
)

function startEditing() {
  if (!props.canEdit) return
  errorMessage.value = ''
  localItems.value = deepClone(items.value)
  isEditing.value = true
  emit('edit-start')
}

function cancelEditing() {
  localItems.value = deepClone(items.value)
  isEditing.value = false
  errorMessage.value = ''
  emit('cancel')
}

async function saveChanges() {
  try {
    errorMessage.value = ''
    await props.updateFunction(deepClone(localItems.value))
    isEditing.value = false
    emit('save', deepClone(localItems.value))
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to save changes'
    emit('error', errorMessage.value)
  }
}

async function clearAll() {
  try {
    errorMessage.value = ''
    if (!canClearAll.value) {
      errorMessage.value = 'Cannot clear all items.'
      emit('error', errorMessage.value)
      return
    }
    if (props.confirmClear) {
      const ok =
        typeof window !== 'undefined'
          ? window.confirm('Clear all items?')
          : true
      if (!ok) return
    }
    localItems.value = []
    await props.updateFunction([])
    isEditing.value = false
    emit('clear')
  } catch (e: any) {
    errorMessage.value = e?.message || 'Failed to clear items'
    emit('error', errorMessage.value)
  }
}

function push(item: any) {
  if (!canAdd.value) {
    errorMessage.value = 'Maximum items reached.'
    emit('error', errorMessage.value)
    return
  }
  localItems.value.push(item)
}

function remove(index: number) {
  if (!canRemoveMore.value) {
    errorMessage.value = 'Cannot remove more items.'
    emit('error', errorMessage.value)
    return
  }
  localItems.value.splice(index, 1)
}

// Emit change events during editing when local items mutate
watch(
  () => localItems.value,
  (val) => {
    if (isEditing.value) emit('change', deepClone(val))
  },
  { deep: true }
)

// Expose imperative handlers for parents when needed
defineExpose({
  startEditing,
  saveChanges,
  cancelEditing,
  push,
  remove,
  clearAll,
})
</script>
