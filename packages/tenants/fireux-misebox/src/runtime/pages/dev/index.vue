<template>
  <div>
    <UCard>
      <h1>Misebox Development</h1>
      <p>Component development and data inspection for Misebox</p>
    </UCard>

    <UCard>
      <h2>Profile Dev Pages</h2>
      
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <UButton 
          to="/dev/chefs" 
          color="orange" 
          variant="outline"
          icon="i-heroicons-user-group"
        >
          Chefs
        </UButton>
        
        <UButton 
          to="/dev/suppliers" 
          color="green" 
          variant="outline"
          icon="i-heroicons-truck"
        >
          Suppliers
        </UButton>
      </div>
    </UCard>

    <UCard>
      <h2>Available Routes</h2>
      <ul style="list-style: disc; margin-left: 20px;">
        <li><code>/dev/chefs</code> - Chef cards ecosystem and data</li>
        <li><code>/dev/suppliers</code> - Supplier cards ecosystem and data</li>
      </ul>
    </UCard>
  </div>
</template>

<script setup>
// Dev navigation page - no data needed
</script>
