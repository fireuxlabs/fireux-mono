<template>
  <div class="supplier quick-create">
    <form @submit.prevent="handleSubmit" class="quick-form">
      <div class="quick-form-content">
        <div class="form-field">
          <label for="supplier-name">Supplier Name</label>
          <input
            id="supplier-name"
            v-model="supplierName"
            type="text"
            placeholder="e.g., Local Farm, ABC Distributors..."
            required
          />
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            :disabled="creating || !supplierName.trim()"
            class="btn-create"
          >
            {{ creating ? 'Creating...' : 'Create Supplier' }}
          </button>
          <button 
            type="button" 
            @click="$emit('cancel')" 
            class="btn-cancel"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>

    <div v-if="createError" class="error-message">
      {{ createError.message }}
    </div>

    <div v-if="createdSupplier" class="success-message">
      ✅ Created supplier: {{ createdSupplier.business_name }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupplierQuickCreate } from '../../../../../composables/firestore/profiles/suppliers/useSupplierQuickCreate'

// Emits
const emit = defineEmits<{
  cancel: []
  created: [supplier: any]
}>()

// Composables
const { createQuickSupplier, creating, createError, createdSupplier } = useSupplierQuickCreate()

// Form data
const supplierName = ref('')

// Methods
const handleSubmit = async () => {
  if (!supplierName.value.trim()) return
  
  const supplier = await createQuickSupplier(supplierName.value.trim())
  if (supplier) {
    emit('created', supplier)
    supplierName.value = ''
  }
}
</script>

<style scoped>
/* Styles moved to supplier.scss in misebox package */
/* This ensures domain-specific styling is properly scoped */
.quick-form-content {
  display: flex;
  gap: 1rem;
  align-items: end;
}

.form-field {
  flex: 1;
}

.form-field label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #495057;
}

.form-field input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-cancel {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #28a745;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}
</style>
