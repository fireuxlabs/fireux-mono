<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { useFirestore, useCollection } from 'vuefire'
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'

// Firestore reactive list
const db = useFirestore()
const colRef = collection(db, 'ingredients')
const q = query(colRef, orderBy('name'))
const { data: ingredients } = useCollection(q)

// Search state
const search = ref('')
const filtered = computed(() => {
  const list = ingredients.value || []
  const term = search.value.trim().toLowerCase()
  if (!term) return list
  return list.filter((ing: any) => (ing.name || '').toLowerCase().includes(term))
})

const totalCount = computed(() => (ingredients.value?.length) || 0)
const filteredCount = computed(() => filtered.value.length)

// Quick add form state
const newName = ref('')
const creating = ref(false)
const createError = ref<string | null>(null)
const newNameEl = ref<HTMLInputElement | null>(null)
const justAddedId = ref<string | null>(null)

async function createIngredient() {
  if (!newName.value.trim() || creating.value) return
  const name = newName.value.trim()
  // Duplicate (case-insensitive) prevention
  const existing = (ingredients.value || []).find((i: any) => (i.name || '').toLowerCase() === name.toLowerCase())
  if (existing) {
    createError.value = 'Ingredient already exists'
    justAddedId.value = existing.id // highlight existing
    setTimeout(() => { justAddedId.value = null }, 1600)
    return
  }
  creating.value = true
  createError.value = null
  try {
    const refDoc = await addDoc(colRef, { name, created_at: serverTimestamp() })
    justAddedId.value = refDoc.id
    newName.value = ''
    await nextTick()
    newNameEl.value?.focus()
    // Clear highlight after animation
    setTimeout(() => { if (justAddedId.value === refDoc.id) justAddedId.value = null }, 1600)
  } catch (e: any) {
    createError.value = e.message || 'Failed to add ingredient'
  } finally {
    creating.value = false
  }
}

function onEnter(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    createIngredient()
  }
}
</script>

<template>
  <div class="page ingredients-page">
    <div class="layout-container page-header">
      <h1 class="page-title">Ingredients</h1>
      <p class="page-description">Manage base ingredients.</p>
    </div>

    <div class="ingredients-actions">
      <ObjectSimpleCreate collection="ingredients" label="Add Ingredient" placeholder="e.g. Basil" />
      <div class="search-box"><UInput v-model="search" placeholder="Search ingredients..." autocomplete="off" /></div>
    </div>
    <p v-if="createError" class="form-error" role="alert">{{ createError }}</p>

    <div class="list-meta" aria-live="polite">
      <span v-if="search">Showing {{ filteredCount }} of {{ totalCount }}</span>
      <span v-else>{{ totalCount }} total</span>
    </div>

    <div class="profile-list">
      <template v-if="filtered.length">
        <IngredientCardsCell
          v-for="ing in filtered"
          :key="ing.id"
          :ingredient="{ id: ing.id, name: ing.name }"
          :class="{ 'just-added': ing.id === justAddedId }"
        />
      </template>
      <div v-else class="empty-state">No ingredients yet. Add the first above.</div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 1.5rem;
}
.page-title {
  margin: 0 0 .25rem;
  font-size: 1.75rem;
  line-height: 1.2;
}
.page-description {
  margin: 0;
  font-size: .875rem;
  color: var(--fx-color-text-soft, #555);
}
.ingredients-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.75rem;
  max-width: 680px;
}
@media (min-width: 640px) {
  .ingredients-actions { flex-direction: row; align-items: flex-end; }
  .quick-add { flex: 1; }
  .search-box { width: 280px; }
}
.quick-add {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding: .75rem 1rem 1rem;
  border: 1px solid var(--fx-border-color, #e2e2e2);
  border-radius: .75rem;
  background: var(--fx-surface-alt, #fafafa);
}
@media (min-width: 640px) {
  .quick-add { flex-direction: row; align-items: flex-end; }
  .quick-add :deep(.form-group) { flex: 1; }
}
.quick-add-submit { margin-top: .25rem; }
.field-hint { margin: .25rem 0 0; font-size: .625rem; text-transform: uppercase; letter-spacing: .05em; opacity: .6; }
.form-error {
  margin: -1rem 0 1rem;
  font-size: .75rem;
  color: #dc2626;
}
.list-meta { font-size: .625rem; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 .75rem; opacity: .7; }
.empty-state {
  font-size: .8125rem;
  color: var(--fx-color-text-soft, #666);
  padding: 1.25rem;
  text-align: center;
  width: 100%;
}
.just-added { animation: pulseAdd 1.4s ease; }
@keyframes pulseAdd { 0% { outline: 0 solid rgba(16,185,129,0.0); background: #ecfdf5; } 40% { outline: 3px solid rgba(16,185,129,0.35); background: #f0fdf4; } 100% { outline: 0 solid rgba(16,185,129,0); background: transparent; } }
</style>
