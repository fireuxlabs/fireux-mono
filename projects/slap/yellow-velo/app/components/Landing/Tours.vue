<template>
  <UPageSection
    id="tours"
    headline="Tours & social rides"
    title="See Interlaken from the saddle."
    description="Yellow Velo runs guided bike tours and social rides around Interlaken. Ask the shop about your dates, your group and the kind of riding you enjoy."
    :links="[
      {
        label: 'Ask about a tour',
        to: 'https://www.instagram.com/yellow.velo.interlaken/',
        target: '_blank',
        icon: 'i-lucide-instagram',
      },
      {
        label: 'See the rides',
        to: 'https://www.instagram.com/yellow.velo.interlaken/reel/DKrUtMqMOcx/',
        target: '_blank',
        color: 'neutral',
        variant: 'outline',
      },
    ]"
  >
    <UPageGrid>
      <UPageCard
        title="Guided bike tours"
        description="Discover the region by bike with Yellow Velo. Contact the shop to discuss a route and make arrangements."
        icon="i-lucide-route"
      />
      <UPageCard
        title="Social rides"
        description="Ride together and get to know the local cycling community. Ask Yellow Velo about upcoming rides."
        icon="i-lucide-users"
      />
      <UPageCard
        title="Need a bike?"
        description="Yellow Velo offers gravel, road, retro mountain bike and e-bike rentals. Ask the shop about availability and the right bike for your ride."
        icon="i-lucide-bike"
      />
    </UPageGrid>
    <p>
      Routes, dates, meeting points, prices and availability are arranged with
      the shop. Opening Instagram does not make a reservation.
    </p>
  </UPageSection>
</template>
