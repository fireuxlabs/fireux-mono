import {
  buildPublicInfoResponse,
  type InfoPage,
  type InfoPageTranslationCache,
  type Place,
  type PublicInfoPageResponse,
} from 'fireux-sproochli/runtime/info'

export type SproochliLanguage = 'en' | 'de' | 'fr' | 'it' | 'ar'

export const sproochliLanguages: Array<{
  code: SproochliLanguage
  label: string
  source: 'original' | 'certified' | 'cached'
}> = [
  { code: 'en', label: 'English', source: 'original' },
  { code: 'de', label: 'Deutsch', source: 'certified' },
  { code: 'fr', label: 'Français', source: 'certified' },
  { code: 'it', label: 'Italiano', source: 'certified' },
  { code: 'ar', label: 'العربية', source: 'cached' },
]

export const samplePlaces: Place[] = [
  {
    id: 'place-bern-bike-rental',
    slug: 'bern-bike-rental',
    name: 'Bern Bike Rental',
    primary_language: 'en',
    supported_languages: ['en', 'de', 'fr', 'it', 'ar'],
    contact: '+41 00 000 00 00',
  },
]

export const sampleInfoPages: InfoPage[] = [
  {
    id: 'info-bike-rental-instructions',
    place_id: 'place-bern-bike-rental',
    slug: 'rental-instructions',
    title: 'Bike Rental Instructions',
    description: 'Clear rental steps for visitors picking up, using, and returning a bike in Bern.',
    original_language: 'en',
    titles: {
      de: 'Velo-Mietanleitung',
      fr: 'Instructions de location de vélo',
      it: 'Istruzioni per il noleggio bici',
    },
    descriptions: {
      de: 'Klare Schritte für Gäste, die in Bern ein Velo abholen, nutzen und zurückgeben.',
      fr: 'Des étapes claires pour retirer, utiliser et rendre un vélo à Berne.',
      it: 'Passaggi chiari per ritirare, usare e restituire una bici a Berna.',
    },
    active: true,
    published: true,
    sort_order: 10,
    sections: [
      {
        id: 'before-you-ride',
        title: 'Before you ride',
        titles: {
          de: 'Bevor Sie losfahren',
          fr: 'Avant de partir',
          it: 'Prima di partire',
        },
        description: 'Bring your documents and check the bike before leaving.',
        descriptions: {
          de: 'Bringen Sie Ihre Unterlagen mit und prüfen Sie das Velo vor der Abfahrt.',
          fr: 'Apportez vos documents et vérifiez le vélo avant de partir.',
          it: 'Porta i documenti e controlla la bici prima di partire.',
        },
        sort_order: 10,
        blocks: [
          {
            id: 'id-and-deposit',
            type: 'text',
            body: 'Please bring a valid ID and deposit before renting a bike.',
            bodies: {
              de: 'Bitte bringen Sie vor der Velomiete einen gültigen Ausweis und ein Depot mit.',
              fr: 'Veuillez apporter une pièce d’identité valide et une caution avant de louer un vélo.',
              it: 'Porta un documento valido e un deposito prima di noleggiare una bici.',
            },
            sort_order: 10,
          },
          {
            id: 'bike-check',
            type: 'list',
            body: 'Check the brakes, tyres, lights, and bell before you leave.',
            bodies: {
              de: 'Prüfen Sie Bremsen, Reifen, Lichter und Klingel, bevor Sie losfahren.',
              fr: 'Vérifiez les freins, les pneus, les lumières et la sonnette avant de partir.',
              it: 'Controlla freni, gomme, luci e campanello prima di partire.',
            },
            sort_order: 20,
          },
        ],
      },
      {
        id: 'during-the-rental',
        title: 'During the rental',
        titles: {
          de: 'Während der Miete',
          fr: 'Pendant la location',
          it: 'Durante il noleggio',
        },
        description: 'Ride safely and keep the bike secured.',
        descriptions: {
          de: 'Fahren Sie sicher und sichern Sie das Velo.',
          fr: 'Roulez prudemment et gardez le vélo en sécurité.',
          it: 'Pedala in sicurezza e tieni la bici al sicuro.',
        },
        sort_order: 20,
        blocks: [
          {
            id: 'lock-bike',
            type: 'warning',
            body: 'Always lock the bike when parked.',
            bodies: {
              de: 'Schliessen Sie das Velo immer ab, wenn es parkiert ist.',
              fr: 'Attachez toujours le vélo lorsqu’il est stationné.',
              it: 'Chiudi sempre la bici quando è parcheggiata.',
            },
            sort_order: 10,
          },
          {
            id: 'traffic-rules',
            type: 'text',
            body: 'Use bike lanes where available and follow local traffic rules.',
            bodies: {
              de: 'Nutzen Sie Velowege, wo vorhanden, und beachten Sie die lokalen Verkehrsregeln.',
              fr: 'Utilisez les pistes cyclables lorsqu’elles existent et respectez le code de la route local.',
              it: 'Usa le piste ciclabili dove disponibili e rispetta le regole locali del traffico.',
            },
            sort_order: 20,
          },
        ],
      },
      {
        id: 'returning-the-bike',
        title: 'Returning the bike',
        titles: {
          de: 'Velo zurückgeben',
          fr: 'Retour du vélo',
          it: 'Restituzione della bici',
        },
        description: 'Return on time and tell the team about any damage.',
        descriptions: {
          de: 'Geben Sie das Velo rechtzeitig zurück und melden Sie Schäden sofort.',
          fr: 'Rendez le vélo à l’heure et signalez tout dommage immédiatement.',
          it: 'Restituisci la bici in tempo e segnala subito eventuali danni.',
        },
        sort_order: 30,
        blocks: [
          {
            id: 'closing-time',
            type: 'text',
            body: 'Return the bike before closing time.',
            bodies: {
              de: 'Geben Sie das Velo vor Ladenschluss zurück.',
              fr: 'Rendez le vélo avant l’heure de fermeture.',
              it: 'Restituisci la bici prima dell’orario di chiusura.',
            },
            sort_order: 10,
          },
          {
            id: 'damage-report',
            type: 'warning',
            body: 'Report any damage immediately.',
            bodies: {
              de: 'Melden Sie Schäden sofort.',
              fr: 'Signalez tout dommage immédiatement.',
              it: 'Segnala subito qualsiasi danno.',
            },
            sort_order: 20,
          },
        ],
      },
      {
        id: 'emergency-contact',
        title: 'Emergency contact',
        titles: {
          de: 'Notfallkontakt',
          fr: 'Contact d’urgence',
          it: 'Contatto di emergenza',
        },
        description: 'Use this number if something urgent happens during your rental.',
        descriptions: {
          de: 'Nutzen Sie diese Nummer, wenn während der Miete etwas Dringendes passiert.',
          fr: 'Utilisez ce numéro en cas d’urgence pendant votre location.',
          it: 'Usa questo numero se succede qualcosa di urgente durante il noleggio.',
        },
        sort_order: 40,
        blocks: [
          {
            id: 'emergency-phone',
            type: 'contact',
            body: 'Emergency contact: +41 00 000 00 00',
            bodies: {
              de: 'Notfallkontakt: +41 00 000 00 00',
              fr: 'Contact d’urgence : +41 00 000 00 00',
              it: 'Contatto di emergenza: +41 00 000 00 00',
            },
            sort_order: 10,
          },
        ],
      },
    ],
  },
]

export const sampleTranslationCaches: Record<string, InfoPageTranslationCache> = {
  'info-bike-rental-instructions': {
    language: 'ar',
    title: 'تعليمات استئجار الدراجة',
    description: 'خطوات واضحة لاستلام الدراجة واستخدامها وإعادتها في Bern.',
    sections: {
      'before-you-ride': {
        title: 'قبل الانطلاق',
        description: 'أحضر مستنداتك وافحص الدراجة قبل المغادرة.',
        blocks: {
          'id-and-deposit': {
            body: 'يرجى إحضار هوية سارية ومبلغ تأمين قبل استئجار الدراجة.',
          },
          'bike-check': {
            body: 'افحص الفرامل والإطارات والأضواء والجرس قبل المغادرة.',
          },
        },
      },
      'during-the-rental': {
        title: 'أثناء فترة الاستئجار',
        description: 'قد بأمان وحافظ على الدراجة مؤمنة.',
        blocks: {
          'lock-bike': {
            body: 'اقفل الدراجة دائما عند إيقافها.',
          },
          'traffic-rules': {
            body: 'استخدم مسارات الدراجات عند توفرها واتبع قواعد المرور المحلية.',
          },
        },
      },
      'returning-the-bike': {
        title: 'إعادة الدراجة',
        description: 'أعد الدراجة في الوقت المحدد وأبلغ الفريق عن أي ضرر فورا.',
        blocks: {
          'closing-time': {
            body: 'أعد الدراجة قبل وقت الإغلاق.',
          },
          'damage-report': {
            body: 'أبلغ عن أي ضرر فورا.',
          },
        },
      },
      'emergency-contact': {
        title: 'جهة الاتصال للطوارئ',
        description: 'استخدم هذا الرقم إذا حدث أمر طارئ أثناء الاستئجار.',
        blocks: {
          'emergency-phone': {
            body: 'جهة الاتصال للطوارئ: +41 00 000 00 00',
          },
        },
      },
    },
  },
}

export function resolveSproochliInfoPage(
  placeSlug: string,
  pageSlug: string,
  requestedLanguage = 'en'
): PublicInfoPageResponse | null {
  const place = samplePlaces.find((entry) => entry.slug === placeSlug)
  if (!place) return null

  const page = sampleInfoPages.find(
    (entry) => entry.place_id === place.id && entry.slug === pageSlug && entry.active && entry.published
  )
  if (!page) return null

  const cache = sampleTranslationCaches[page.id]

  return buildPublicInfoResponse(place, page, requestedLanguage, cache)
}
