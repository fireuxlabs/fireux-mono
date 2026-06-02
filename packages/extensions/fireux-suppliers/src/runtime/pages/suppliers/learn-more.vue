<template>
  <UPage>
    <UPageHeader
      title="Learn More: Supplier"
      description="Introduce your supplier items to kitchens and venues that need them."
    />

    <UPageBody class="pagebody">
      <p>
        A supplier workspace helps connect your business with chefs, kitchens,
        and hospitality teams looking for trusted partners. It gives you a
        clear business presence to showcase what you provide.
      </p>

      <div>
        <h2 class="font-semibold">With a supplier workspace you can:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>
            Highlight your product range or services to the right audience.
          </li>
          <li>Connect with decision makers inside FireUX apps.</li>
          <li>Earn trust by maintaining a consistent business identity.</li>
          <li>Increase visibility as the supplier network expands.</li>
        </ul>
      </div>

      <p>
        Future releases will bring catalogue tools, ordering workflows, and more
        ways to collaborate with the teams that rely on your supply chain.
      </p>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({ title: 'Supplier · Learn More' })
</script>
