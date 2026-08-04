<template>
  <UPage>
      <UPageHeader
      title="Misebox for suppliers"
      description="Keep one Supplier identity and work from the catalogue, item, ingredient and team records it owns."
    />

    <UPageBody class="pagebody">
      <p>
        A Supplier Console is the working home for a supplier in Misebox. The
        Supplier owns its identity and the records that describe what it can
        supply. Apps and marketplaces can later publish selected Supplier
        records without copying that authority.
      </p>

      <div>
        <h2 class="font-semibold">With a supplier workspace you can:</h2>
        <ul class="mt-2 list-disc space-y-1 pl-6">
          <li>
            Maintain one public Supplier identity.
          </li>
          <li>Work with Supplier items, catalogues and linked ingredients.</li>
          <li>Control Supplier Console access for your team.</li>
          <li>Keep marketplace publication separate from Supplier ownership.</li>
        </ul>
      </div>

      <UButton to="/suppliers/create" icon="i-lucide-arrow-right">
        Create your Supplier Console
      </UButton>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

useHead({ title: 'Supplier · Learn More' })
</script>
