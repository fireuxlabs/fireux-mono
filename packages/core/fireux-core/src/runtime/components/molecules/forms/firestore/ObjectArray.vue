<template>
  <div class="form-field">
    <UFormField
      :label="label"
      class="flex max-sm:flex-col justify-between items-start gap-4 w-full"
    >
      <div class="w-full flex flex-col gap-3">
        <MoleculesFormsTop
          :label="''"
          :is-editing="isEditing"
          :has-data="(items?.length || 0) > 0"
          :error-message="errorMessage"
          @start-editing="startEditing"
          @check="saveChanges"
          @cancel="cancelEditing"
          @delete="clearAll"
        />

        <!-- Display mode -->
        <div v-if="!isEditing" class="space-y-3">
          <div
            v-if="!items || items.length === 0"
            class="text-sm text-gray-500"
          >
            {{ i18n.empty }}
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(item, index) in items"
              :key="getKey(item, index)"
              class="py-2"
            >
              <slot name="display" :item="item" :index="index">
                <pre class="text-xs text-gray-500">{{ item }}</pre>
              </slot>
            </div>
          </div>
        </div>

        <!-- Edit mode -->
        <div v-else class="space-y-3">
          <div v-if="localItems.length === 0" class="text-sm text-gray-500">
            {{ i18n.empty }}
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in localItems"
              :key="getKey(item, index)"
              class="border rounded-md p-3"
            >
              <slot
                name="edit"
                :item="item"
                :index="index"
                :remove="() => remove(index)"
              >
                <pre class="text-xs text-gray-500">{{ item }}</pre>
                <div class="flex justify-end">
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-trash-2"
                    @click="remove(index)"
                  >
                    Remove
                  </UButton>
                </div>
              </slot>
            </div>
          </div>

          <!-- Create new item -->
          <div class="border rounded-md p-3">
            <slot name="create" :push="push"></slot>
          </div>
        </div>
      </div>
    </UFormField>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

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

watch(
  () => props.firebaseValue,
  (val) => {
    if (!isEditing.value)
      localItems.value = Array.isArray(val) ? structuredClone(val) : []
  },
  { immediate: true }
)

function startEditing() {
  if (!props.canEdit) return
  errorMessage.value = ''
  localItems.value = structuredClone(items.value)
  isEditing.value = true
}

function cancelEditing() {
  localItems.value = structuredClone(items.value)
  isEditing.value = false
  errorMessage.value = ''
}

async function saveChanges() {
  try {
    errorMessage.value = ''
    await props.updateFunction(structuredClone(localItems.value))
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
