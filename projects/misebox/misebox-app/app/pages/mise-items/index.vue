<script setup lang="ts">
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { computed, ref } from 'vue'

const db = useFirestore()
const colRef = collection(db, 'mise_items')
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
  <div class="page mise-items-page">
    <h1 class="profile-page-title">Mise Items</h1>
    <p class="profile-page-description">Prepped intermediates.</p>
    <div style="max-width: 400px; margin: 1rem 0">
      <UInput v-model="search" placeholder="Search mise..." />
    </div>
    <div class="profile-list">
      <RecipeCardsPill
        v-for="m in list"
        :key="m.id"
        :name="m.name"
        :id="m.id"
      />
    </div>
  </div>
</template>
