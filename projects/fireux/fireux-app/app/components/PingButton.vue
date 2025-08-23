<template>
  <div class="ping-button-container">
    <UButton
      @click="handlePing"
      :loading="isLoading"
      color="primary"
      variant="solid"
      size="lg"
    >
      <template v-if="!isLoading">
        {{ lastPing ? `Ping: ${lastPing}ms` : 'Ping Server' }}
      </template>
      <template v-else> Pinging... </template>
    </UButton>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
const isLoading = ref(false)
const lastPing = ref(null)
const error = ref('')

const handlePing = async () => {
  isLoading.value = true
  error.value = ''

  const startTime = Date.now()

  try {
    // Ping the current server
    await $fetch('/api/_ping', {
      timeout: 5000,
    })

    const endTime = Date.now()
    lastPing.value = endTime - startTime

    // Auto-clear after 5 seconds
    setTimeout(() => {
      lastPing.value = null
    }, 5000)
  } catch (err) {
    error.value = 'Ping failed: ' + (err.message || 'Server unreachable')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.ping-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.error-message {
  color: rgb(239 68 68);
  font-size: 0.875rem;
  text-align: center;
}
</style>
