<template>
  <div class="supplier-edit-form">
    <h3>Edit Supplier Profile</h3>
    <p>Supplier editing form - coming soon!</p>
    <div class="form-placeholder">
      <p>This form will allow editing of:</p>
      <ul>
        <li>Business name: {{ supplier?.business_name }}</li>
        <li>Type: {{ supplier?.business_type }}</li>
        <li>Specialties: {{ supplier?.specialties?.join(', ') }}</li>
        <li>Contact: {{ supplier?.email }}</li>
        <li>Bio: {{ supplier?.bio_short }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.supplier-edit-form {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.form-placeholder {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.form-placeholder ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.form-placeholder li {
  margin: 0.5rem 0;
  color: #374151;
}
</style>
