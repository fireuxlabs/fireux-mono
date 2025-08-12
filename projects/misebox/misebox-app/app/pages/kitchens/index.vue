<script setup lang="ts">
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { computed, ref } from 'vue'

const db = useFirestore()
const colRef = collection(db, 'kitchens')
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
  <div class="page kitchens-page">
    <h1 class="profile-page-title">Kitchens</h1>
    <p class="profile-page-description">Operational workspaces.</p>
    <div style="max-width: 400px; margin: 1rem 0">
      <UInput v-model="search" placeholder="Search kitchens..." />
    </div>
    <div class="profile-list">
      <KitchenCardsPill
        v-for="k in list"
        :key="k.id"
        :name="k.name"
        :id="k.id"
      />
    </div>
  </div>
</template>
