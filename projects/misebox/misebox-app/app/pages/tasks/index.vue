<script setup lang="ts">
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy } from 'firebase/firestore'
import { computed, ref } from 'vue'

const db = useFirestore()
const colRef = collection(db, 'kitchen_tasks')
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
  <div class="page tasks-page">
    <h1 class="profile-page-title">Tasks</h1>
    <p class="profile-page-description">Kitchen tasks.</p>
    <div style="max-width: 400px; margin: 1rem 0">
      <UInput v-model="search" placeholder="Search tasks..." />
    </div>
    <div class="profile-list">
      <TaskCardsPill v-for="t in list" :key="t.id" :name="t.name" :id="t.id" />
    </div>
  </div>
</template>
