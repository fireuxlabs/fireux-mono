<template>
  <UApp>
    <div class="min-h-screen flex items-center justify-center p-6">
      <UCard class="max-w-xl w-full">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500" />
            <h1 class="text-lg font-semibold">{{ title }}</h1>
          </div>
        </template>

        <p class="text-sm text-gray-600 whitespace-pre-wrap">{{ message }}</p>

        <template #footer>
          <div class="flex gap-2">
            <UButton color="primary" @click="handleError()">Try again</UButton>
            <UButton color="neutral" variant="ghost" to="/">Go home</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UApp>
</template>

<script setup>
const error = useError()
const title = computed(() => error?.value?.statusMessage || 'Unexpected error')
const message = computed(() => error?.value?.message || 'An unexpected error occurred.')

const handleError = () => clearError({ redirect: '/' })
</script>
