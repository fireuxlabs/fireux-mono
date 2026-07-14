// Shared tenant page pass-ins: docs/concepts/family-tenant-global.md
export const baerenRinggenbergContent = {
  brand: {
    name: 'Hotel Bären Ringgenberg',
    placeId: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    address: 'Hauptstrasse 128, 3852 Ringgenberg, Switzerland',
  },
  assets: {
    backdrop: {
      src: '/img/brand/baeren-mark.svg',
      alt: 'Bären Ringgenberg mark',
    },
    galleryPreview: {
      src: '/img/brand/baeren-mark.svg',
      alt: 'Bären Ringgenberg mark',
    },
    miseboxWordmark: {
      lightSrc: '/img/ecosystem/wordmark-light.png',
      darkSrc: '/img/ecosystem/wordmark-dark.png',
    },
  },
  links: {
    miseboxPlace: 'https://misebox.app/kitchens/baeren-ringgenberg',
    googleMapEmbed:
      'https://www.google.com/maps?q=Hotel%20B%C3%A4ren%20Ringgenberg%20Hauptstrasse%20128%203852%20Ringgenberg&output=embed',
  },
  pages: {
    index: {
      seoTitle: 'Hotel Bären Ringgenberg',
      seoDescription: 'Public menu and venue page for Hotel Bären Ringgenberg.',
    },
    home: {
      title: 'Pizza, snacks and drinks in Ringgenberg.',
      subtitle:
        'Hotel, restaurant and bar on the north shore of Lake Brienz.',
      copy: [
        'Browse the existing Bären menu for pizza, snacks and drinks, with collection and delivery options shown when available.',
      ],
      seoTitle: 'Hotel Bären Ringgenberg | Home',
      seoDescription:
        'Pizza, snacks, drinks, collection, and delivery at Hotel Bären Ringgenberg.',
    },
    gallery: {
      title: 'Gallery.',
      subtitle: 'The Bären mark from the existing Misebox kitchen record.',
      seoTitle: 'Hotel Bären Ringgenberg | Gallery',
      seoDescription: 'Bären Ringgenberg venue identity and Misebox kitchen link.',
    },
    info: {
      title: 'Information.',
      subtitleFallback: 'Address, phone, website, and map.',
      seoTitle: 'Hotel Bären Ringgenberg | Info',
      seoDescription: 'Contact, website, and map information for Hotel Bären Ringgenberg.',
    },
    location: {
      title: 'Find us.',
      seoTitle: 'Hotel Bären Ringgenberg | Location',
      seoDescription: 'Map and address for Hotel Bären Ringgenberg.',
    },
  },
} as const
