// Shared tenant page pass-ins: docs/concepts/family-tenant-global.md
export const laTapBerneContent = {
  brand: {
    name: 'La Tap Berne',
    placeId: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
    address: 'Hauptstrasse 49, 3800 Matten bei Interlaken, Switzerland.',
  },
  assets: {
    backdrop: {
      src: '/img/gallery/image-1.png',
      alt: 'La Tap Berne terrace food',
    },
    galleryPreview: {
      src: '/img/gallery/image-1.png',
      alt: 'La Tap Berne terrace plate',
    },
    miseboxWordmark: {
      lightSrc: '/img/ecosystem/wordmark-light.png',
      darkSrc: '/img/ecosystem/wordmark-dark.png',
    },
  },
  links: {
    miseboxPlace: 'https://misebox.app/places/la-tapberne',
    googleMapEmbed:
      'https://www.google.com/maps?q=La%20Tapberne%20Hauptstrasse%2049%203800%20Matten%20bei%20Interlaken&output=embed',
  },
  pages: {
    index: {
      seoTitle: 'La Tap Berne',
      seoDescription: 'Public menu and venue page for La Tap Berne.',
    },
    home: {
      title: 'Spanish plates in Matten bei Interlaken.',
      subtitle:
        'La Tap Berne is a relaxed pub for tapas, Comida Casera, and easy drinks just off the Interlaken rhythm.',
      copy: [
        'Come for Iberian small plates, tortilla, bravas, pimientos, ribs, and the kind of food that turns a quick drink into something more.',
      ],
      seoTitle: 'La Tap Berne | Home',
      seoDescription:
        'Spanish-style plates, tapas, drinks, and terrace moments at La Tap Berne in Matten bei Interlaken.',
    },
    gallery: {
      title: 'Gallery.',
      subtitle: 'A first look at the terrace, the plate, and the mood.',
      seoTitle: 'La Tap Berne | Gallery',
      seoDescription: 'Gallery and social link surface for La Tap Berne.',
    },
    info: {
      title: 'Information.',
      subtitleFallback: 'Address, phone, website, and map.',
      seoTitle: 'La Tap Berne | Info',
      seoDescription: 'Contact, website, and map information for La Tap Berne.',
    },
    location: {
      title: 'Find us.',
      seoTitle: 'La Tap Berne | Location',
      seoDescription: 'Map and address for La Tap Berne in Matten bei Interlaken.',
    },
  },
} as const
