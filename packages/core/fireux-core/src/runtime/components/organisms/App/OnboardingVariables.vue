<template>
  <UContainer class="env-check-container">
    <h3>Environment Check</h3>

    <div v-if="pending" class="loading-message">
      🔄 Checking environment variables...
    </div>

    <div v-else-if="envData" class="env-checklist">
      <div
        class="summary-badge"
        :class="{ success: envData.isValid, warning: !envData.isValid }"
      >
        <span v-if="envData.isValid">✅ Ready to create app</span>
        <span v-else
          >⚠️ {{ envData.missingRequired?.length || 0 }} missing
          variable(s)</span
        >
      </div>

      <!-- Required Environment Variables -->
      <div class="section">
        <h4>
          🔐 Required Variables ({{ envData.summary?.required || '0/0' }})
        </h4>
        <div class="checklist">
          <div
            v-for="envVar in envData.required"
            :key="envVar.key"
            class="checklist-item"
            :class="{ valid: envVar.present, invalid: !envVar.present }"
          >
            <span class="status-icon">{{ envVar.present ? '✅' : '❌' }}</span>
            <span class="var-name">{{ envVar.key }}</span>
            <span class="var-status">
              {{ envVar.present ? 'Set' : 'Missing' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Optional Environment Variables -->
      <div class="section">
        <h4>
          ⚙️ Optional Variables ({{ envData.summary?.optional || '0/0' }})
        </h4>
        <div class="checklist">
          <div
            v-for="envVar in envData.optional"
            :key="envVar.key"
            class="checklist-item optional"
            :class="{ valid: envVar.present, 'not-set': !envVar.present }"
          >
            <span class="status-icon">{{ envVar.present ? '✅' : '⭕' }}</span>
            <span class="var-name">{{ envVar.key }}</span>
            <span class="var-status">
              {{ envVar.present ? 'Set' : 'Not set' }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="!envData.isValid" class="setup-instructions">
        <p><strong>Next steps:</strong></p>
        <ol>
          <li>
            Add missing environment variables to your <code>.env</code> file
          </li>
          <li>Restart your development server: <code>pnpm dev</code></li>
          <li>Refresh this page to check again</li>
        </ol>
      </div>
    </div>

    <div v-else-if="error" class="error-message">
      ❌ Failed to check environment variables: {{ error }}
    </div>
  </UContainer>
</template>

<script setup>
const {
  data: envData,
  error,
  pending,
} = await useFetch('/api/app/env-check', {
  server: false, // Only fetch on client side to avoid SSR issues
  default: () => null, // Provide a default value
})

console.log('Environment Check Data:', envData.value)
if (error.value) {
  console.error('Environment Check Error:', error.value)
}
</script>

<style scoped>
.env-check-container {
  padding: var(--space-4);
  max-width: 600px;
}

.loading-message {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--space-4);
}

.env-checklist {
  margin-top: var(--space-4);
}

.summary-badge {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  text-align: center;
  font-weight: 600;
  margin-bottom: var(--space-6);
}

.summary-badge.success {
  background: var(--green-50);
  border: 2px solid var(--green-200);
  color: var(--green-700);
}

.summary-badge.warning {
  background: var(--orange-50);
  border: 2px solid var(--orange-200);
  color: var(--orange-700);
}

.section {
  margin-bottom: var(--space-6);
}

.section h4 {
  margin: 0 0 var(--space-3) 0;
  color: var(--text-primary);
  font-size: var(--text-lg);
}

.checklist {
  background: var(--ui-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.checklist-item {
  display: flex;
  align-items: center;
  padding: var(--space-3);
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s;
}

.checklist-item:last-child {
  border-bottom: none;
}

.checklist-item.valid {
  background: var(--green-25);
}

.checklist-item.invalid {
  background: var(--red-25);
}

.checklist-item.not-set {
  background: var(--gray-25);
}

.status-icon {
  margin-right: var(--space-3);
  font-size: var(--text-lg);
}

.var-name {
  flex: 1;
  font-family: monospace;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.var-status {
  font-size: var(--text-sm);
  font-weight: 500;
}

.checklist-item.valid .var-status {
  color: var(--green-600);
}

.checklist-item.invalid .var-status {
  color: var(--red-600);
}

.checklist-item.not-set .var-status {
  color: var(--gray-500);
}

.setup-instructions {
  margin-top: var(--space-6);
  padding: var(--space-4);
  background: var(--blue-25);
  border: 1px solid var(--blue-200);
  border-radius: var(--radius-md);
}

.setup-instructions ol {
  margin: var(--space-2) 0 0 0;
  padding-left: var(--space-4);
}

.setup-instructions li {
  margin-bottom: var(--space-1);
}

.setup-instructions code {
  background: var(--ui-bg);
  padding: var(--space-1);
  border-radius: var(--radius-xs);
  font-family: monospace;
  font-size: var(--text-sm);
}

.error-message {
  color: var(--red-600);
  padding: var(--space-4);
  background: var(--red-50);
  border: 1px solid var(--red-200);
  border-radius: var(--radius-md);
  text-align: center;
}
</style>
