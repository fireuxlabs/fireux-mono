<template>
  <div class="ingredient-create-system">
    <!-- Quick Supplier Creation (if enabled) -->
    <SupplierCreateQuick
      v-if="showQuickSupplierCreate"
      @created="handleSupplierCreated"
      @cancel="showQuickSupplierCreate = false"
    />

    <!-- Main Ingredient Creation Form -->
    <form @submit.prevent="handleSubmit" class="ingredient-form">
      <div class="form-row">
        <div class="field ingredient-field">
          <label for="ingredient-name">Ingredient Name</label>
          <input
            id="ingredient-name"
            v-model="ingredientName"
            type="text"
            placeholder="e.g., Organic Tomatoes, Fresh Basil..."
            required
          />
        </div>

        <div class="field supplier-field">
          <label for="supplier-select">Supplier</label>
          <div class="supplier-select-container">
            <select
              id="supplier-select"
              v-model="selectedSupplierId"
              class="supplier-select"
            >
              <option value="">No supplier (generic)</option>
              <option
                v-for="option in supplierOptions.slice(1)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <button
              type="button"
              @click="showQuickSupplierCreate = true"
              class="btn-new-supplier"
              title="Create new supplier"
            >
              + New
            </button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button
          type="submit"
          :disabled="creating || !ingredientName.trim()"
          class="btn-create"
        >
          {{ creating ? 'Adding...' : 'Add Ingredient' }}
        </button>
      </div>

      <div v-if="createError" class="error-message">
        {{ createError.message }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useIngredientCreate } from '../../../../../composables/firestore/objects/ingredients/useIngredientCreate'
import { useSupplierList } from '../../../../../composables/firestore/profiles/suppliers/useSupplierList'
import SupplierCreateQuick from '../../../profiles/Supplier/Create/Quick.vue'

const { createIngredient, creating, createError } = useIngredientCreate()
const { supplierOptions } = useSupplierList()

// Form state
const ingredientName = ref('')
const selectedSupplierId = ref('')
const showQuickSupplierCreate = ref(false)

// Methods
const handleSubmit = async () => {
  if (!ingredientName.value.trim()) return

  const success = await createIngredient(
    ingredientName.value.trim(),
    selectedSupplierId.value || undefined
  )

  if (success) {
    ingredientName.value = ''
    selectedSupplierId.value = ''
  }
}

const handleSupplierCreated = (supplier: any) => {
  selectedSupplierId.value = supplier.id
  showQuickSupplierCreate.value = false
}
</script>

<style scoped>
.ingredient-create-system {
  margin-bottom: 2rem;
}

.ingredient-form {
  background: white;
  border: 1px solid #e3e6f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.field input,
.field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.supplier-select-container {
  display: flex;
  gap: 0.5rem;
}

.supplier-select {
  flex: 1;
}

.btn-new-supplier {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-new-supplier:hover {
  background: #138496;
}

.form-actions {
  text-align: left;
}

.btn-create {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-create:hover:not(:disabled) {
  background: #218838;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
