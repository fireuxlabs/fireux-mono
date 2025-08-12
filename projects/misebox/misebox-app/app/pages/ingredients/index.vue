<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'

const db = useFirestore()
const colRef = collection(db, 'ingredients')
const q = query(colRef, orderBy('name'))
const { data: ingredients } = useCollection(q)

const search = ref('')
const filtered = computed(() => {
  if (!ingredients.value) return []
  if (!search.value.trim()) return ingredients.value
  const s = search.value.toLowerCase()
  return ingredients.value.filter((ing: any) =>
    (ing.name || '').toLowerCase().includes(s)
  )
})
</script>

<template>
  <div class="page ingredients-page">
    <div class="layout-container" style="margin-bottom: 1.5rem">
      <h1 class="profile-page-title">Ingredients</h1>
      <p class="profile-page-description">Manage base ingredients.</p>
    </div>

    <div class="objects create" style="margin-bottom: 2rem">
      <IngredientCreate />
    </div>

    <div style="margin-bottom: 1rem; max-width: 400px">
      <UInput v-model="search" placeholder="Search ingredients..." />
    </div>

    <div class="profile-list">
      <template v-if="filtered.length">
        <IngredientCardsCell
          v-for="ing in filtered"
          :key="ing.id"
          :ingredient="{ id: ing.id, name: ing.name }"
        />
      </template>
      <div v-else class="text-sm text-gray-500">No ingredients yet.</div>
    </div>
  </div>
</template>
