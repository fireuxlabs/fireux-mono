<template>
  <div class="space-y-16 pb-20">
    <section class="py-16">
      <UContainer class="space-y-6">
        <UBadge color="primary" variant="soft">User Access</UBadge>

        <div class="space-y-2">
          <AppBrandWordmark
            size="large"
            class="h-9 w-auto max-w-full object-contain"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </div>
      </UContainer>
    </section>

    <section>
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UPricingPlan
          title="Free access"
          description="Create your FireUX account and start exploring."
          price="Free"
          :features="[
            'Create a FireUX account',
            'Create profiles',
            'Browse FireUX apps',
            'Access free templates and resources',
          ]"
          :button="{
            label: 'Join now',
            to: '/auth',
            color: 'neutral',
            variant: 'soft',
            trailingIcon: 'i-lucide-arrow-right',
          }"
        />

        <UPricingPlan
          title="Operator access"
          description="For people who manage a FireUX app, team, or private workflow."
          price="$5"
          billing-cycle="/month"
          highlight
          scale
          :features="[
            'Use the FireUX console',
            'Manage your app and team access',
            'Launch support',
            'One account across connected apps',
          ]"
          :button="{
            label: 'Create account',
            to: '/auth',
            color: 'primary',
            variant: 'soft',
            trailingIcon: 'i-lucide-arrow-right',
          }"
        />
      </UContainer>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

useSeoMeta({
  title: 'User Pricing · FireUX',
  description: 'FireUX accounts are free. Operator access is $5 per month when you need to manage an app or workflow.',
})
</script>
