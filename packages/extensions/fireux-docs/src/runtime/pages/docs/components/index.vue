<template>
  <UPage>
    <UPageHeader
      title="Components"
      description="Shared FireUX components and usage guides."
    />
    <UPageBody>
      <p>
        The former Core component catalogue has been removed. Existing component
        guides and examples remain available; we have not selected a replacement
        catalogue strategy yet.
      </p>
      <p>
        Use <ULink to="https://ui.nuxt.com/docs/components">Nuxt UI</ULink>
        for native controls.
      </p>
      <UButton
        to="/docs/components/bookings"
        label="Booking component example"
        color="neutral"
        variant="soft"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'docs', title: 'Components' })
useSeoMeta({
  title: 'Components · FireUX',
  description: 'FireUX component examples and usage guides.',
})
</script>
