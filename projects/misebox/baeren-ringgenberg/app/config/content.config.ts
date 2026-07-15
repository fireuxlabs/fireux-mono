// Shared tenant page pass-ins: docs/concepts/family-tenant-global.md
export interface BaerenHomeRoute {
  key: string
  label: string
  to: string
  icon: string
  title: string
  copy: string
  featured?: boolean
  facts?: readonly string[]
}

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
      eyebrow: 'Ringgenberg · Berner Oberland',
      titleLines: ['Hotel Bären', 'Berner Oberland'],
      subtitle: 'Ihr Hotel am Brienzersee in Ringgenberg',
      directory: {
        eyebrow: 'Hotel Bären Ringgenberg',
        title: 'Alles unter einem Dach.',
        copy: 'Übernachten, essen, feiern oder einfach den Brienzersee entdecken.',
      },
      routes: [
        {
          key: 'hotel',
          label: 'Hotel',
          to: '/hotel',
          icon: 'i-lucide-bed-double',
          title: 'Übernachten zwischen Brienzersee und Interlaken.',
          copy: '37 Zimmer für Alleinreisende, Paare, Familien und Gruppen bis acht Personen.',
          featured: true,
          facts: ['37 Zimmer', '1–8 Gäste'],
        },
        {
          key: 'menu',
          label: 'Restaurant & Bar',
          to: '/menu',
          icon: 'i-lucide-utensils',
          title: 'Essen und trinken im Herzen von Ringgenberg.',
          copy: 'Regionale Küche, Pizza, Snacks und Getränke aus dem Bären Restaurant und der Bar.',
          featured: true,
        },
        {
          key: 'products',
          label: 'Produkte',
          to: '/products',
          icon: 'i-lucide-box',
          title: 'Produkte aus dem Bären.',
          copy: 'Entdecken Sie die Produkte des Hotel Bären Ringgenberg.',
        },
        {
          key: 'blog',
          label: 'Blog',
          to: '/blog',
          icon: 'i-lucide-newspaper',
          title: 'Neues aus dem Bären.',
          copy: 'Neuigkeiten, Veranstaltungen und Geschichten aus Ringgenberg.',
        },
        {
          key: 'events',
          label: 'Events',
          to: '/events',
          icon: 'i-lucide-calendar-days',
          title: 'Feiern, begegnen und bleiben.',
          copy: 'Ein Ort für Hochzeiten, Feiern, Sitzungen und Live-Veranstaltungen.',
          featured: true,
        },
        {
          key: 'about',
          label: 'Über uns & Kontakt',
          to: '/about',
          icon: 'i-lucide-circle-user-round',
          title: 'Den Bären kennenlernen.',
          copy: 'Das Haus und die direkten Kontakte für Hotel, Restaurant und Events.',
        },
        {
          key: 'location',
          label: 'Anreise',
          to: '/location',
          icon: 'i-lucide-map-pin',
          title: 'Mitten in Ringgenberg.',
          copy: 'Karte, Adresse und Ihre Route zum Hotel Bären.',
        },
        {
          key: 'jobs',
          label: 'Jobs',
          to: '/jobs',
          icon: 'i-lucide-briefcase-business',
          title: 'Arbeiten im Bären.',
          copy: 'Offene Stellen in Hotel, Restaurant, Bar und Küche.',
        },
      ] satisfies readonly BaerenHomeRoute[],
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
