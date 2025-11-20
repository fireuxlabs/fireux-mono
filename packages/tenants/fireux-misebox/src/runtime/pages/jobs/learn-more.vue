<template>
  <UPage>
    <UPageHeader
      title="Misebox Jobs"
      description="How Misebox kitchens can hire faster with the FireUX jobs engine."
    />

    <UPageBody class="space-y-8">
      <section class="space-y-3">
        <h2 class="text-lg font-semibold">Why publish through Misebox</h2>
        <p class="text-sm text-gray-600">
          Misebox taps into the shared FireUX jobs infrastructure so every
          posting reaches trained culinary talent while still feeling
          tenant-native.
        </p>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">What you can do today</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>
            Draft Misebox jobs with role, description, status, and pay in
            minutes.
          </li>
          <li>Keep drafts private until you are ready to open requisitions.</li>
          <li>
            Update copy or pay at any time; changes sync across the platform
            instantly.
          </li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Roadmap highlights</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li>
            Chef-specific application flows with staging, tasting, and shift
            trials.
          </li>
          <li>
            Matching insights based on cuisine, brigade composition, and
            equipment.
          </li>
          <li>Automated comms for interview scheduling and confirmations.</li>
        </ul>
      </section>

      <section class="space-y-3">
        <h3 class="text-base font-semibold">Next steps</h3>
        <p class="text-sm text-gray-600">
          Create your Misebox agent profile, draft your first job, and keep
          your team rostered ahead of service windows.
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton to="/jobs/create" color="primary"
            >Create a Misebox job</UButton
          >
          <UButton to="/chefs" variant="ghost">Browse chefs</UButton>
        </div>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({ title: 'Learn more about Misebox Jobs' })
</script>
