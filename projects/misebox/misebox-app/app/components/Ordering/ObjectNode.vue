<template>
  <div class="object-node">
    <div v-if="isRootObject" class="object-node__children object-node__children--root">
      <OrderingObjectNode
        v-for="entry in objectEntries"
        :key="entry.key"
        :name="entry.key"
        :value="entry.value"
      />
    </div>

    <details v-else-if="isArray" class="object-node__branch object-node__branch--array">
      <summary>
        <UIcon
          name="i-lucide-chevron-right"
          class="object-node__chevron"
          aria-hidden="true"
        />
        <span v-if="name" class="object-node__key">{{ name }}:</span>
        <code>[]</code>
        <span class="object-node__meta">{{ arrayEntries.length }}</span>
      </summary>

      <div class="object-node__children">
        <OrderingObjectNode
          v-for="entry in arrayEntries"
          :key="entry.key"
          :name="entry.key"
          :value="entry.value"
        />
      </div>
    </details>

    <details v-else-if="isObject" class="object-node__branch" open>
      <summary>
        <UIcon
          name="i-lucide-chevron-right"
          class="object-node__chevron"
          aria-hidden="true"
        />
        <span v-if="name" class="object-node__key">{{ name }}:</span>
        <code>{}</code>
        <span class="object-node__meta">{{ objectSummary }}</span>
      </summary>

      <div class="object-node__children">
        <OrderingObjectNode
          v-for="entry in objectEntries"
          :key="entry.key"
          :name="entry.key"
          :value="entry.value"
        />
      </div>
    </details>

    <div v-else class="object-node__leaf">
      <span v-if="name" class="object-node__key">{{ name }}:</span>
      <code>{{ primitiveLabel }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'OrderingObjectNode' })

type ObjectEntry = {
  key: string
  value: unknown
}

const props = withDefaults(
  defineProps<{
    name?: string
    value: unknown
  }>(),
  {
    name: '',
  }
)

const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(() =>
  props.value !== null &&
    typeof props.value === 'object' &&
    !isArray.value
)
const isRootObject = computed(() => isObject.value && !props.name)
const arrayEntries = computed<ObjectEntry[]>(() =>
  Array.isArray(props.value)
    ? props.value.map((value, index) => ({
        key: String(index),
        value,
      }))
    : []
)
const objectEntries = computed<ObjectEntry[]>(() =>
  isObject.value
    ? Object.entries(props.value as Record<string, unknown>).map(([key, value]) => ({
        key,
        value,
      }))
    : []
)
const objectSummary = computed(() =>
  `${objectEntries.value.length} key${objectEntries.value.length === 1 ? '' : 's'}`
)
const primitiveLabel = computed(() => {
  if (typeof props.value === 'string') return JSON.stringify(props.value)
  if (props.value === undefined) return 'undefined'

  return String(props.value)
})
</script>

<style scoped>
.object-node {
  min-width: 0;
}

.object-node + .object-node {
  margin-top: var(--spacing);
}

.object-node__branch > summary,
.object-node__leaf {
  display: flex;
  gap: 0.4rem;
  align-items: baseline;
  min-width: 0;
  color: var(--ui-text);
}

.object-node__branch > summary {
  cursor: pointer;
  list-style: none;
}

.object-node__branch > summary::-webkit-details-marker {
  display: none;
}

.object-node__branch--array > summary {
  color: var(--ui-text-toned);
}

.object-node__chevron {
  flex: 0 0 auto;
  width: 0.85rem;
  height: 0.85rem;
  color: var(--ui-text-muted);
  transition: transform 120ms ease;
}

.object-node__branch[open] > summary .object-node__chevron {
  transform: rotate(90deg);
}

.object-node__children {
  margin-top: 0.35rem;
  margin-left: calc(var(--spacing) * 4);
  padding-left: calc(var(--spacing) * 3);
  border-left: 1px solid var(--ui-border);
}

.object-node__children--root {
  margin-top: 0;
  margin-left: 0;
}

.object-node__key {
  color: var(--ui-text-highlighted);
  font-weight: 800;
}

.object-node__meta {
  color: var(--ui-text-muted);
  font-size: 0.68rem;
}

code {
  overflow-wrap: anywhere;
  color: var(--ui-text-toned);
  font-size: 0.75rem;
}
</style>
