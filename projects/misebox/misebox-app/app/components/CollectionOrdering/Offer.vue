<template>
  <UPageSection
    title="Who it is for"
    description="For food businesses taking orders for customer collection, with one place for the Kitchen team to manage the work."
  />
  <UPageSection title="How Collection Ordering works">
    <UPageGrid>
      <UPageCard
        title="1. Set up your Kitchen"
        description="Choose the published Menus and serving hours for Collection in Kitchen Workspace."
        icon="i-lucide-settings"
      />
      <UPageCard
        title="2. Share your ordering page"
        description="Customers choose food and drinks, review their basket and submit a Collection order."
        icon="i-lucide-shopping-bag"
      />
      <UPageCard
        title="3. Manage the same orders"
        description="Your Kitchen team receives orders on the order board and updates their status. Customers can return to their confirmation."
        icon="i-lucide-panels-top-left"
      />
    </UPageGrid>
  </UPageSection>
  <UPageCTA
    title="Use Collection in your Kitchen"
    description="Use the existing Kitchen tools directly. No separate Product purchase is required. Existing Kitchen access and service availability apply."
    :links="[
      {
        label: 'Set up Collection',
        to: '/workspace/kitchen/food-and-drink/services',
      },
      {
        label: 'Open the order board',
        to: '/workspace/kitchen/orders/board',
        variant: 'outline',
      },
    ]"
  />
  <UPageSection
    title="See the customer entrance"
    description="Open a Kitchen and choose its Collection menu. Availability follows that Kitchen’s current Menus and serving hours. This preview does not provide online payment."
    :links="[{ label: 'Browse Kitchens', to: '/kitchens', variant: 'outline' }]"
  />
  <UButton
    to="/products"
    label="Browse all products"
    color="neutral"
    variant="outline"
  />
</template>
