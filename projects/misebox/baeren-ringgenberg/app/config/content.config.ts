// Shared tenant page pass-ins: docs/concepts/family-tenant-global.md
export const baerenRinggenbergContent = {
  brand: {
    name: 'Hotel Bären Ringgenberg',
    placeId: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    address: 'Hauptstrasse 128, 3852 Ringgenberg, Switzerland',
  },
  assets: {
    backdrop: {
      src: '/img/app/background.png',
      alt: 'Ringgenberg and Lake Brienz at sunset',
    },
    galleryPreview: {
      src: '/img/app/logo.png',
      alt: 'Bären Ringgenberg mark',
    },
    miseboxWordmark: {
      lightSrc: '/img/ecosystem/wordmark-light.png',
      darkSrc: '/img/ecosystem/wordmark-dark.png',
    },
  },
  links: {
    miseboxPlace: 'https://misebox.app/kitchens/baeren-ringgenberg',
    booking: 'https://booking.roomraccoon.ch/hotel-b-ren-ringgenberg/de/',
    googleMapEmbed:
      'https://www.google.com/maps?q=Hotel%20B%C3%A4ren%20Ringgenberg%20Hauptstrasse%20128%203852%20Ringgenberg&output=embed',
  },
  contacts: {
    hotel: {
      label: 'Hotel and reservations',
      email: 'hotel@baeren-ringgenberg.ch',
      phone: '+41 79 218 88 13',
    },
    restaurant: {
      label: 'Restaurant and bar',
      email: 'restaurant@baeren-ringgenberg.ch',
      phone: '+41 79 840 41 17',
    },
    events: {
      label: 'Events',
      email: 'events@baeren-ringgenberg.ch',
      phone: '+41 33 822 19 31',
    },
  },
  pages: {
    home: {
      title: 'Hotel Bären Ringgenberg',
      intro:
        'Hotel, restaurant and bar in Ringgenberg. Browse the existing Bären menu or find the venue.',
      actions: [
        { label: 'Hotel', to: '/hotel', icon: 'i-lucide-bed-double', color: 'primary', variant: 'solid' },
        { label: 'Menu', to: '/menu', icon: 'i-lucide-utensils', color: 'neutral', variant: 'solid' },
        { label: 'Events', to: '/events', icon: 'i-lucide-calendar-days', color: 'neutral', variant: 'solid' },
        { label: 'Location', to: '/location', icon: 'i-lucide-map-pin', color: 'neutral', variant: 'solid' },
      ],
      highlights: [
        {
          title: 'Hotel',
          description: '37 guest rooms close to Lake Brienz and Interlaken.',
          to: '/hotel',
          icon: 'i-lucide-bed-double',
        },
        {
          title: 'Restaurant and bar',
          description: 'Regional cooking, pizza, snacks and drinks.',
          to: '/menu',
          icon: 'i-lucide-utensils',
        },
        {
          title: 'Events',
          description: 'Weddings, celebrations, meetings and live events.',
          to: '/events',
          icon: 'i-lucide-calendar-days',
        },
      ],
    },
    gallery: {
      title: 'Gallery.',
      subtitle: 'The Bären mark from the existing Misebox kitchen record.',
      seoTitle: 'Hotel Bären Ringgenberg | Gallery',
      seoDescription: 'Bären Ringgenberg venue identity and Misebox kitchen link.',
    },
    hotel: {
      title: 'Stay in Ringgenberg.',
      subtitle: 'A chalet-style hotel between Lake Brienz and Interlaken.',
      seoTitle: 'Hotel rooms | Hotel Bären Ringgenberg',
      seoDescription: 'Stay at Hotel Bären Ringgenberg, close to Lake Brienz and Interlaken.',
    },
    events: {
      title: 'Events at the Bären.',
      subtitle: 'A place for weddings, celebrations, meetings and live events.',
      seoTitle: 'Events | Hotel Bären Ringgenberg',
      seoDescription: 'Plan a wedding, celebration, meeting or event at Hotel Bären Ringgenberg.',
    },
    about: {
      title: 'About and contact.',
      subtitle: 'Hotel, restaurant and bar in the centre of Ringgenberg.',
      seoTitle: 'About and contact | Hotel Bären Ringgenberg',
      seoDescription: 'About Hotel Bären Ringgenberg and contact details for hotel, restaurant and events.',
    },
    location: {
      title: 'Find us.',
      seoTitle: 'Hotel Bären Ringgenberg | Location',
      seoDescription: 'Map and address for Hotel Bären Ringgenberg.',
    },
  },
} as const
