<template>
  <div class="min-h-screen bg-gradient-to-br from-violet-50 to-slate-100">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-5xl md:text-7xl font-bold text-slate-900 mb-6">
            <span class="text-violet-600">Niederhorn</span>
            Index
            <br />
            <span class="text-3xl md:text-5xl font-medium text-slate-600">
              Culinary Excellence
            </span>
          </h1>

          <p class="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            The premier marketplace connecting world-class chefs with premium
            suppliers. Where culinary artistry meets exceptional ingredients.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/chefs"
              class="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Browse Elite Chefs
            </NuxtLink>
            <NuxtLink
              to="/suppliers"
              class="bg-white hover:bg-slate-50 text-violet-600 border-2 border-violet-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Premium Suppliers
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
            Why Choose Niederhorn?
          </h2>
          <p class="text-xl text-slate-600">
            The most exclusive culinary marketplace in the world
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="text-center p-8">
            <div
              class="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Icon name="heroicons:star" class="w-8 h-8 text-violet-600" />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">
              Verified Chefs
            </h3>
            <p class="text-slate-600">
              Every chef on our platform is personally verified and vetted for
              exceptional culinary skills and professionalism.
            </p>
          </div>

          <div class="text-center p-8">
            <div
              class="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Icon
                name="heroicons:shield-check"
                class="w-8 h-8 text-violet-600"
              />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">
              Premium Quality
            </h3>
            <p class="text-slate-600">
              Our suppliers meet the highest standards for quality,
              sustainability, and ethical sourcing practices.
            </p>
          </div>

          <div class="text-center p-8">
            <div
              class="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Icon
                name="heroicons:lightning-bolt"
                class="w-8 h-8 text-violet-600"
              />
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">
              Seamless Experience
            </h3>
            <p class="text-slate-600">
              Advanced matching algorithms connect chefs with the perfect
              suppliers for their specific needs.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-violet-600">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-4xl font-bold text-white mb-6">
          Ready to Elevate Your Culinary Journey?
        </h2>
        <p class="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
          Join the most exclusive network of culinary professionals and premium
          suppliers.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink
            to="/auth?mode=register&type=chef"
            class="bg-white hover:bg-slate-50 text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Join as Chef
          </NuxtLink>
          <NuxtLink
            to="/auth?mode=register&type=supplier"
            class="bg-violet-500 hover:bg-violet-400 text-white border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Join as Supplier
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// Set page meta
useHead({
  title: 'Niederhorn - Premium Culinary Marketplace',
  meta: [
    {
      name: 'description',
      content:
        'The premier marketplace connecting world-class chefs with premium suppliers. Where culinary artistry meets exceptional ingredients.',
    },
    {
      name: 'keywords',
      content:
        'premium chefs, quality suppliers, culinary marketplace, fine dining, gourmet ingredients',
    },
  ],
})

// Set layout
definePageMeta({
  layout: 'default',
})
</script>
