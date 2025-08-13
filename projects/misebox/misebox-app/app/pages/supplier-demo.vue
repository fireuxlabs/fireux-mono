<template>
  <div class="supplier-demo">
    <div class="header">
      <h1>🚛 Dual-Track Supplier System</h1>
      <p>Head chefs get fast supplier creation, suppliers get rich profile management</p>
    </div>

    <div class="demo-sections">
      <!-- Quick Track Explanation -->
      <div class="demo-section">
        <div class="section-header">
          <h2>⚡ Quick Track - For Head Chefs</h2>
          <p>Fast supplier creation when adding ingredients</p>
        </div>
        
        <div class="demo-content">
          <div class="explanation">
            <h3>How it works:</h3>
            <ul>
              <li>Chef goes to ingredients page to add new ingredients</li>
              <li>Can select existing supplier or click "New" to quickly create one</li>
              <li>Supplier created with just a name, ready to use immediately</li>
              <li>Perfect for busy kitchens that need speed</li>
            </ul>
            <NuxtLink to="/ingredients" class="btn-demo">
              Try Quick Supplier Creation →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Rich Track Explanation -->
      <div class="demo-section">
        <div class="section-header">
          <h2>🏢 Rich Track - For Suppliers</h2>
          <p>Full supplier profiles for marketplace presence</p>
        </div>
        
        <div class="demo-content">
          <div class="explanation">
            <h3>Full Supplier Profile Features:</h3>
            <ul>
              <li>Business details and contact information</li>
              <li>Specialties and product categories</li>
              <li>Years in business and website</li>
              <li>Ability to manage their own ingredients</li>
              <li>Verification and marketplace features</li>
            </ul>
            <NuxtLink to="/suppliers" class="btn-demo">
              View Supplier Profiles →
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- System Benefits -->
      <div class="demo-section benefits">
        <div class="section-header">
          <h2>🎯 System Benefits</h2>
        </div>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <h3>⚡ Speed for Chefs</h3>
            <p>Head chefs can quickly assign suppliers to ingredients without complex forms</p>
          </div>
          
          <div class="benefit-card">
            <h3>🏢 Rich Profiles for Suppliers</h3>
            <p>Suppliers can create detailed marketplace presence and manage their own ingredients</p>
          </div>
          
          <div class="benefit-card">
            <h3>🔄 Upgrade Path</h3>
            <p>Quick suppliers can later upgrade to full profiles when they want marketplace presence</p>
          </div>
          
          <div class="benefit-card">
            <h3>📊 Flexible Data</h3>
            <p>System handles both simple name-only suppliers and complex business profiles</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Supplier System Demo',
  description: 'Dual-track supplier creation system demonstration'
})
</script>

<style scoped>
.supplier-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.header p {
  color: #718096;
  font-size: 1.1rem;
}

.demo-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.demo-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
}

.section-header h2 {
  margin: 0 0 0.5rem 0;
}

.section-header p {
  margin: 0;
  opacity: 0.9;
}

.demo-content {
  padding: 2rem;
}

.explanation h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.explanation ul {
  margin: 0 0 1.5rem 0;
  padding-left: 1.5rem;
}

.explanation li {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.btn-demo {
  background: #4299e1;
  color: white;
  text-decoration: none;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: inline-block;
  transition: background-color 0.2s;
}

.btn-demo:hover {
  background: #3182ce;
}

.section-explanation {
  background: #f7fafc;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.section-explanation h3 {
  margin: 0 0 1rem 0;
  color: #2d3748;
}

.section-explanation ul {
  margin: 0;
  padding-left: 1.5rem;
}

.section-explanation li {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.rich-track-preview ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.rich-form-container {
  margin-top: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.benefits {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.benefits .section-header {
  background: transparent;
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.benefit-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.benefit-card h3 {
  margin: 0 0 0.5rem 0;
  color: white;
}

.benefit-card p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .supplier-demo {
    padding: 1rem;
  }
  
  .benefits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
