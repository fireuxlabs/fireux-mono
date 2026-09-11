export default defineAppConfig({
  menuDiscovery: {
    highlights: [
      {
        sourceAppId: 'baeren-ringgenberg',
        kitchenId: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
        description:
          'A restaurant and bar in Ringgenberg serving pizza, burgers and hearty snacks.',
        title: 'Pizza Sunday · CHF 11',
        terms: 'Every pizza, every Sunday, 12:00–20:30 at Hotel Bären.',
        sourceUrl: 'https://www.baeren-ringgenberg.ch/index.php/de/aktuelles',
      },
    ],
  },
  navigation: {
    hiddenKeys: ['products', 'blog'],
    overrides: {
      kitchens: {
        order: 10,
        layouts: ['default', 'landing'],
        position: 'top',
      },
      operations: {
        order: 20,
        position: 'top',
      },
      demo: {
        label: 'Product Demo',
        order: 30,
        position: 'top',
      },
      jobs: {
        label: 'Misebox Jobs',
        order: 40,
        position: 'bottom',
        layouts: ['default', 'landing'],
      },
      professionals: {
        label: 'Hospitality professionals',
        order: 41,
        position: 'bottom',
        layouts: ['default'],
      },
    },
  },
  ui: {
    colors: {
      primary: 'theme',
      neutral: 'slate',
    },
    safelistColors: ['theme'],
  },
})
