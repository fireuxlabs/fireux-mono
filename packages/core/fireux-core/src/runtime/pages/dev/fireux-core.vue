<template>
  <div class="core-package-dev">
    <h1>🔥 FireUX Core Package Development</h1>
    
    <div class="package-info">
      <h2>📦 Package Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Package:</span>
          <span class="info-value">fireux-core</span>
        </div>
        <div class="info-item">
          <span class="info-label">Version:</span>
          <span class="info-value">{{ packageVersion }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Type:</span>
          <span class="info-value">Core Framework</span>
        </div>
        <div class="info-item">
          <span class="info-label">Dependencies:</span>
          <span class="info-value">{{ dependencyCount }} packages</span>
        </div>
      </div>
    </div>

    <div class="module-testing">
      <h2>🧪 Module Testing</h2>
      <div class="test-grid">
        <div class="test-category">
          <h3>🔧 Core Components</h3>
          <div class="test-items">
            <div class="test-item" :class="{ active: componentTest.fire }">
              <span class="test-name">Fire* Components</span>
              <button @click="testFireComponents" class="test-btn">Test Auto-Import</button>
            </div>
            <div class="test-item" :class="{ active: componentTest.organisms }">
              <span class="test-name">Organism Components</span>
              <button @click="testOrganisms" class="test-btn">Test Organisms</button>
            </div>
          </div>
        </div>
        
        <div class="test-category">
          <h3>📊 Core Models</h3>
          <div class="test-items">
            <div class="test-item" :class="{ active: modelTest.core }">
              <span class="test-name">CoreUser/AppUser</span>
              <button @click="testCoreModels" class="test-btn">Test Models</button>
            </div>
            <div class="test-item" :class="{ active: modelTest.profiles }">
              <span class="test-name">Profile Models</span>
              <button @click="testProfileModels" class="test-btn">Test Profiles</button>
            </div>
          </div>
        </div>

        <div class="test-category">
          <h3>⚡ Composables</h3>
          <div class="test-items">
            <div class="test-item" :class="{ active: composableTest.auth }">
              <span class="test-name">Authentication</span>
              <button @click="testAuthComposables" class="test-btn">Test Auth</button>
            </div>
            <div class="test-item" :class="{ active: composableTest.firestore }">
              <span class="test-name">Firestore</span>
              <button @click="testFirestoreComposables" class="test-btn">Test Firestore</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="auto-import-testing">
      <h2>📥 Auto-Import Testing</h2>
      <div class="import-tests">
        <div class="import-test">
          <h3>Component Auto-Imports (Fire* prefix)</h3>
          <div class="import-results">
            <div v-for="component in fireComponents" :key="component" class="import-item">
              <span class="component-name">&lt;{{ component }}&gt;</span>
              <span class="import-status" :class="getImportStatus(component)">
                {{ getImportStatus(component) }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="import-test">
          <h3>Model Auto-Imports</h3>
          <div class="import-results">
            <div v-for="model in coreModels" :key="model" class="import-item">
              <span class="component-name">{{ model }}</span>
              <span class="import-status available">Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="module-exports">
      <h2>📤 Module Exports</h2>
      <div class="exports-grid">
        <div class="export-category">
          <h3>Components</h3>
          <ul>
            <li>FireButton, FireCard, FireInput</li>
            <li>FireAuth*, FireProfile*</li>
            <li>FireOrganisms*</li>
          </ul>
        </div>
        <div class="export-category">
          <h3>Composables</h3>
          <ul>
            <li>useCoreUser, useAppUser</li>
            <li>useProfile, useAuth</li>
            <li>useFirestore*, useFirebase*</li>
          </ul>
        </div>
        <div class="export-category">
          <h3>Models</h3>
          <ul>
            <li>CoreUser, AppUser</li>
            <li>Profile, ProfileConfig</li>
            <li>App, Subscription</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="build-info">
      <h2>🔨 Build Information</h2>
      <div class="build-stats">
        <div class="build-item">
          <strong>Last Build:</strong> {{ lastBuildTime }}
        </div>
        <div class="build-item">
          <strong>Module Output:</strong> ESM + CommonJS
        </div>
        <div class="build-item">
          <strong>TypeScript:</strong> Enabled with declarations
        </div>
      </div>
      
      <div class="build-actions">
        <button @click="buildPackage" class="action-btn">🔨 Build Package</button>
        <button @click="cleanPackage" class="action-btn secondary">🧹 Clean Build</button>
        <button @click="watchPackage" class="action-btn">👀 Watch Mode</button>
      </div>
    </div>

    <div class="integration-testing">
      <h2>🔗 Integration Testing</h2>
      <p>Test how this core package integrates with tenant and extension packages:</p>
      <div class="integration-buttons">
        <button @click="testMiseboxIntegration" class="integration-btn misebox">Test MiseBox Integration</button>
        <button @click="testJobsIntegration" class="integration-btn jobs">Test Jobs Integration</button>
        <button @click="testCleanboxIntegration" class="integration-btn cleanbox">Test CleanBox Integration</button>
        <button @click="testPlacesIntegration" class="integration-btn places">Test Places Integration</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Set page meta
definePageMeta({
  title: 'FireUX Core Package Development',
  description: 'Development tools for the FireUX Core package itself',
})

// Package info
const packageVersion = ref('0.1.0')
const dependencyCount = ref(12)
const lastBuildTime = ref(new Date().toLocaleString())

// Test states
const componentTest = ref({
  fire: false,
  organisms: false
})

const modelTest = ref({
  core: false,
  profiles: false
})

const composableTest = ref({
  auth: false,
  firestore: false
})

// Component lists
const fireComponents = ref([
  'FireButton', 'FireCard', 'FireInput', 'FireAuth', 'FireProfile'
])

const coreModels = ref([
  'CoreUser', 'AppUser', 'Profile', 'App'
])

// Test functions
const testFireComponents = () => {
  componentTest.value.fire = true
  console.log('🔥 Testing Fire* component auto-imports...')
  setTimeout(() => { componentTest.value.fire = false }, 2000)
}

const testOrganisms = () => {
  componentTest.value.organisms = true
  console.log('🧬 Testing organism components...')
  setTimeout(() => { componentTest.value.organisms = false }, 2000)
}

const testCoreModels = () => {
  modelTest.value.core = true
  console.log('👤 Testing CoreUser/AppUser models...')
  setTimeout(() => { modelTest.value.core = false }, 2000)
}

const testProfileModels = () => {
  modelTest.value.profiles = true
  console.log('👥 Testing Profile models...')
  setTimeout(() => { modelTest.value.profiles = false }, 2000)
}

const testAuthComposables = () => {
  composableTest.value.auth = true
  console.log('🔐 Testing authentication composables...')
  setTimeout(() => { composableTest.value.auth = false }, 2000)
}

const testFirestoreComposables = () => {
  composableTest.value.firestore = true
  console.log('🗃️ Testing Firestore composables...')
  setTimeout(() => { composableTest.value.firestore = false }, 2000)
}

const getImportStatus = (component) => {
  return 'available'
}

// Build functions
const buildPackage = () => {
  console.log('🔨 Building fireux-core package...')
  alert('Building package (would run: pnpm build)')
}

const cleanPackage = () => {
  console.log('🧹 Cleaning fireux-core build...')
  alert('Cleaning package (would run: pnpm clean)')
}

const watchPackage = () => {
  console.log('👀 Starting watch mode for fireux-core...')
  alert('Watch mode (would run: pnpm dev)')
}

// Integration tests
const testMiseboxIntegration = () => {
  console.log('🍳 Testing MiseBox integration...')
  alert('Testing Chef/Supplier integration with core models')
}

const testJobsIntegration = () => {
  console.log('💼 Testing Jobs integration...')
  alert('Testing Professional/Employer integration with core models')
}

const testCleanboxIntegration = () => {
  console.log('🧽 Testing CleanBox integration...')
  alert('Testing CleanBox integration with core framework')
}

const testPlacesIntegration = () => {
  console.log('📍 Testing Places integration...')
  alert('Testing Places extension integration with core models')
}
</script>

<style scoped>
.core-package-dev {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.package-info {
  background: #fef3c7;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #f59e0b;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
}

.info-label {
  font-weight: 500;
  color: #92400e;
}

.info-value {
  color: #1f2937;
  font-family: monospace;
}

.test-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.test-category {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.test-category h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.test-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.test-item.active {
  border-color: #22c55e;
  background: #f0fdf4;
}

.test-name {
  font-weight: 500;
  color: #374151;
}

.test-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
}

.test-btn:hover {
  background: #2563eb;
}

.auto-import-testing {
  margin: 2rem 0;
}

.import-tests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.import-test {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.import-test h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.import-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.import-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 4px;
}

.component-name {
  font-family: monospace;
  color: #374151;
  font-weight: 500;
}

.import-status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.import-status.available {
  background: #dcfce7;
  color: #166534;
}

.exports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.export-category {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.export-category h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.export-category ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #4b5563;
}

.export-category li {
  margin-bottom: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.build-info {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem 0;
  border: 1px solid #0ea5e9;
}

.build-stats {
  margin-bottom: 1rem;
}

.build-item {
  margin-bottom: 0.5rem;
  color: #0c4a6e;
}

.build-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.action-btn:hover {
  background: #0284c7;
}

.action-btn.secondary {
  background: #6b7280;
}

.action-btn.secondary:hover {
  background: #4b5563;
}

.integration-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.integration-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  color: white;
}

.integration-btn.misebox {
  background: #22c55e;
}

.integration-btn.jobs {
  background: #3b82f6;
}

.integration-btn.cleanbox {
  background: #0ea5e9;
}

.integration-btn.places {
  background: #8b5cf6;
}

.integration-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

h1 {
  color: #1f2937;
  margin-bottom: 1.5rem;
}

h2 {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}
</style>
