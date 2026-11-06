<template>
  <UPageSection
    id="rental"
    title="Find your bike."
    headline="Bike rental"
    description="Need a bike for your own ride? Tell Ben what you want to ride, your size, and where you’re headed. He’ll help find the right bike through trusted local rental partners."
    :links="[
      {
        label: 'Ask about a rental',
        to: { path: '/', query: { tour: 'Bike rental' }, hash: '#enquire' },
      },
    ]"
  />
</template>
