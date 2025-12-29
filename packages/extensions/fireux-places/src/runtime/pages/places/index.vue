<template>
  <main>
    <p>Hello {{ word }}</p>

    <p v-if="collectionPath">Collection: {{ collectionPath }}</p>
    <p v-if="error">{{ error }}</p>
    <p v-else-if="collectionPath">Count: {{ count }}</p>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import type { Ref } from 'vue'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager.ts'

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

const placesTypes = computed<string[]>(() => {
  const types = (runtimeConfig.public as any)?.fireux?.places?.types
  return Array.isArray(types) ? (types as string[]) : []
})

const word = computed(() => {
  const raw = route.query.word
  const value = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')
  return value || 'world'
})

const selectedType = computed<string | null>(() => {
  const candidate = word.value
  if (placesTypes.value.includes(candidate)) return candidate
  return placesTypes.value[0] ?? null
})

const collectionPath = computed<string | null>(() => {
  const type = selectedType.value
  if (!type) return null
  if (type === 'company') return 'companies'
  return `${type}s`
})

const { firestoreFetchCollection, createDocument } = useFirestoreManager()

const error = ref<string | null>(null)
const collectionRef = shallowRef<Ref<Record<string, any>[] | undefined> | null>(null)

watch(
  collectionPath,
  (path) => {
    if (!path) {
      collectionRef.value = null
      return
    }
    collectionRef.value = firestoreFetchCollection<Record<string, any>>(path)
  },
  { immediate: true }
)

const docs = computed(() => collectionRef.value?.value ?? [])
const count = computed(() => docs.value.length)

const shouldCreate = computed(() => {
  const value = route.query.create
  return value === '1' || value === 'true'
})

onMounted(async () => {
  if (!shouldCreate.value) return
  if (!collectionPath.value) return

  try {
    error.value = null
    await createDocument(collectionPath.value, {
      name: `Hello ${word.value}`,
      type: selectedType.value,
    })
  } catch (e: any) {
    error.value = e?.message ? String(e.message) : 'Failed to create document'
  }
})
</script>
