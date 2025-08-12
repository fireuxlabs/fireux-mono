<script setup lang="ts">
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { computed, ref } from 'vue'

const db = useFirestore()
const colRef = collection(db, 'recipes')
const q = query(colRef, orderBy('name'))
const { data } = useCollection(q)

const search = ref('')
const list = computed(() => {
  if (!data.value) return []
  if (!search.value.trim()) return data.value
  const s = search.value.toLowerCase()
  return data.value.filter((d: any) => (d.name || '').toLowerCase().includes(s))
})
</script>
<template>
  <div class="page recipes-page-simple">
    <h1 class="profile-page-title">Recipes</h1>
    <p class="profile-page-description">Basic recipe list (simple model).</p>
    <div style="max-width: 400px; margin: 1rem 0">
      <UInput v-model="search" placeholder="Search recipes..." />
    </div>
    <div class="profile-list">
      <RecipeCardsPill
        v-for="r in list"
        :key="r.id"
        :name="r.name"
        :id="r.id"
      />
    </div>
  </div>
</template>
