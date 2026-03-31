<template>
  <UPage>
    <UPageHeader
      title="Find SEO for eCommerce"
      description="Compare eCommerce SEO providers who understand category growth, merchandising, technical fixes, and revenue-led search strategy."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <p class="text-sm uppercase tracking-[0.18em] text-dimmed">Why this page exists</p>
          <h2 class="text-2xl font-semibold">eCommerce SEO needs category thinking, not generic traffic promises</h2>
          <p class="leading-7 text-toned">
            Good eCommerce SEO connects search demand to category structure, internal linking, merchandising, and commercial priorities.
            This landing page sends buyers straight into the providers already strongest in that work.
          </p>
          <div class="flex gap-3">
            <UButton to="/seo-providers?sector=eCommerce" color="primary">Browse eCommerce SEO providers</UButton>
            <UButton to="/seo-providers" variant="soft">See all providers</UButton>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'SEO for eCommerce | Find My SEO',
  description: 'Compare eCommerce SEO consultants and agencies with category, technical, and commercial proof.',
})
</script>
