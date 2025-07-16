<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-50 to-zinc-100">
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            <span class="text-violet-600">Niederhorn</span>
            <br />
            <span class="text-3xl md:text-5xl font-medium text-slate-600">
              Misebox Tenant
            </span>
          </h1>
          
          <p class="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Powered by: fireux-core, fireux-jobs, fireux-misebox
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/dashboard"
              class="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Get Started
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Niederhorn - Misebox Tenant',
  meta: [
    { name: 'description', content: 'Powered by: fireux-core, fireux-jobs, fireux-misebox' }
  ]
})

definePageMeta({
  layout: 'default'
})
</script>