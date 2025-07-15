<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            <span class="text-blue-600">Richies Reinigung</span>
            <br />
            <span class="text-3xl md:text-5xl font-medium text-slate-600">
              Professional Cleaning Services
            </span>
          </h1>

          <p class="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Premium cleaning services with German precision and reliability.
            Your trusted partner for spotless results.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/cleaners"
              class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Our Cleaning Experts
            </NuxtLink>
            <NuxtLink
              to="/services"
              class="bg-white hover:bg-slate-50 text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Our Services
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-slate-900 mb-4">
            Why Choose Richies Reinigung?
          </h2>
          <p class="text-xl text-slate-600">
            Professional, reliable, and thorough cleaning services
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center">
            <div
              class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">🧽</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Expert Cleaners</h3>
            <p class="text-slate-600">
              Trained professionals with years of experience
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">⚡</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Fast & Efficient</h3>
            <p class="text-slate-600">
              Quick turnaround without compromising quality
            </p>
          </div>

          <div class="text-center">
            <div
              class="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
            >
              <span class="text-2xl">✨</span>
            </div>
            <h3 class="text-xl font-semibold mb-2">Guaranteed Results</h3>
            <p class="text-slate-600">
              100% satisfaction guarantee on all services
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Richies Reinigung - Professional Cleaning Services',
  meta: [
    {
      name: 'description',
      content:
        'Premium cleaning services with German precision and reliability. Professional cleaners for homes and businesses.',
    },
  ],
})

definePageMeta({
  layout: 'default',
})
</script>
