<template>
  <UContainer class="py-10">
    <div class="space-y-6">
      <UBadge color="primary" variant="subtle">FireUX Template</UBadge>
      <h1 class="text-3xl font-bold tracking-tight">
        Your neutral FireUX app starter
      </h1>
      <p class="max-w-2xl text-muted">
        This template includes Products and Blogs on top of the FireUX core
        runtime so you can validate, extend, and ship quickly.
      </p>

      <div class="flex flex-wrap gap-3">
        <UButton to="/products" color="primary">Open Products</UButton>
        <UButton to="/blogs" variant="outline">Open Blogs</UButton>
      </div>
    </div>
  </UContainer>
</template>
