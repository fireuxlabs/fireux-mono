<template>
  <UPageSection title="How Menu Express works">
    <UPageGrid>
      <UPageCard
        title="1. Send your menu"
        description="Supply a PDF, photos or a menu link and your venue details."
        icon="i-lucide-file-up"
      />
      <UPageCard
        title="2. Review the draft"
        description="Check dishes, descriptions and prices. Request corrections, then approve the Menu."
        icon="i-lucide-list-checks"
      />
      <UPageCard
        title="3. Receive your Menu and QR"
        description="Open your published Menu and download its QR to share with guests."
        icon="i-lucide-qr-code"
      />
    </UPageGrid>
  </UPageSection>
  <UPageCTA
    title="Let Misebox prepare your Menu"
    description="Price, scope and delivery terms are agreed before purchase. Submitting a request does not charge you."
    :links="[{ label: 'Send us your menu', to: '/menu-express' }]"
  />
  <UPageSection
    title="Prefer to prepare it yourself?"
    description="Kitchen teams can upload, process, review and publish their own Menu in Workspace. No Menu Express purchase is required; ordinary Kitchen access and processing limits still apply."
    :links="[
      {
        label: 'Prepare a Menu in Kitchen Workspace',
        to: '/workspace/kitchen/food-and-drink/menus/prepare',
        variant: 'outline',
      },
    ]"
  />
</template>
