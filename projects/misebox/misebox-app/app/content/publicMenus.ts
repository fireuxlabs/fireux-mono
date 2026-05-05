export type MenuLanguageCode = 'de' | 'en' | 'gsw' | 'hi' | 'ar' | 'ko'

export type MenuTranslation = {
  name?: string
  title?: string
  description?: string
}

export type PublicMenuItem = {
  id: string
  sectionId: string
  price?: number
  currency: 'CHF'
  isAvailable: boolean
  isSpicy?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  containsGluten?: boolean
  containsDairy?: boolean
  containsNuts?: boolean
  translations: Partial<Record<MenuLanguageCode, MenuTranslation>>
}

export type PublicMenuSection = {
  id: string
  order: number
  translations: Partial<Record<MenuLanguageCode, MenuTranslation>>
}

export type PublicRestaurantMenu = {
  slug: string
  restaurantName: string
  location: string
  currency: 'CHF'
  sourceLanguages: MenuLanguageCode[]
  languages: ReadonlyArray<{
    code: MenuLanguageCode
    label: string
    shortLabel: string
    nativeLabel: string
    dir?: 'ltr' | 'rtl'
  }>
  sections: PublicMenuSection[]
  items: PublicMenuItem[]
}

export const menuLanguageFallback: MenuLanguageCode = 'en'

export const publicMenus: Record<string, PublicRestaurantMenu> = {
  'luna-piccante': {
    slug: 'luna-piccante',
    restaurantName: 'Luna Piccante',
    location: 'Bern',
    currency: 'CHF',
    sourceLanguages: ['de', 'en'],
    languages: [
      { code: 'de', label: 'Deutsch', shortLabel: 'DE', nativeLabel: '🇩🇪 Deutsch' },
      { code: 'en', label: 'English', shortLabel: 'EN', nativeLabel: '🇬🇧 English' },
      { code: 'gsw', label: 'Bärndütsch', shortLabel: 'CH', nativeLabel: '🇨🇭 Bärndütsch' },
      { code: 'hi', label: 'Hindi', shortLabel: 'HI', nativeLabel: '🇮🇳 हिन्दी' },
      { code: 'ar', label: 'Arabic', shortLabel: 'AR', nativeLabel: '🇸🇦 العربية', dir: 'rtl' },
      { code: 'ko', label: 'Korean', shortLabel: 'KO', nativeLabel: '🇰🇷 한국어' },
    ],
    sections: [
      {
        id: 'antipasti',
        order: 10,
        translations: {
          de: { title: 'Antipasti', description: 'Kleine Teller zum Teilen.' },
          en: { title: 'Antipasti', description: 'Small plates to share.' },
          gsw: { title: 'Antipasti', description: 'Chlini Taeller zum Teile.' },
          hi: { title: 'एंटीपास्टी', description: 'साझा करने के लिए छोटे प्लेट्स।' },
          ar: { title: 'مقبلات', description: 'أطباق صغيرة للمشاركة.' },
          ko: { title: '안티파스티', description: '나누어 먹기 좋은 작은 접시.' },
        },
      },
      {
        id: 'pizzas',
        order: 20,
        translations: {
          de: { title: 'Pizza', description: 'Aus dem Steinofen.' },
          en: { title: 'Pizza', description: 'From the stone oven.' },
          gsw: { title: 'Pizza', description: 'Us em Steiofe.' },
          hi: { title: 'पिज्जा', description: 'स्टोन ओवन से।' },
          ar: { title: 'بيتزا', description: 'من فرن حجري.' },
          ko: { title: '피자', description: '화덕에서 구운 피자.' },
        },
      },
      {
        id: 'dolci',
        order: 30,
        translations: {
          de: { title: 'Dolci', description: 'Suesse Klassiker.' },
          en: { title: 'Desserts', description: 'Sweet classics.' },
          gsw: { title: 'Dolci', description: 'Sueessi Klassiker.' },
          hi: { title: 'मिठाइयाँ', description: 'क्लासिक डेजर्ट।' },
          ar: { title: 'حلويات', description: 'حلويات كلاسيكية.' },
          ko: { title: '디저트', description: '달콤한 클래식 디저트.' },
        },
      },
    ],
    items: [
      {
        id: 'bruschetta',
        sectionId: 'antipasti',
        price: 12,
        currency: 'CHF',
        isAvailable: true,
        isVegetarian: true,
        isVegan: true,
        containsGluten: true,
        translations: {
          de: {
            name: 'Bruschetta al Pomodoro',
            description: 'Geroestetes Brot, Tomaten, Basilikum, Olivenoel.',
          },
          en: {
            name: 'Tomato Bruschetta',
            description: 'Toasted bread, tomatoes, basil, olive oil.',
          },
          gsw: {
            name: 'Bruschetta mit Tomate',
            description: 'Groestets Brot, Tomate, Basilikum, Olivenoel.',
          },
          hi: {
            name: 'टोमैटो ब्रुशेट्टा',
            description: 'टोस्टेड ब्रेड, टमाटर, तुलसी, जैतून का तेल।',
          },
          ar: {
            name: 'بروشيتا بالطماطم',
            description: 'خبز محمص، طماطم، ريحان، زيت زيتون.',
          },
          ko: {
            name: '토마토 브루스케타',
            description: '구운 빵, 토마토, 바질, 올리브 오일.',
          },
        },
      },
      {
        id: 'caprese',
        sectionId: 'antipasti',
        price: 16,
        currency: 'CHF',
        isAvailable: true,
        isVegetarian: true,
        containsDairy: true,
        translations: {
          de: {
            name: 'Insalata Caprese',
            description: 'Mozzarella, Tomaten, Basilikum, Balsamico.',
          },
          en: {
            name: 'Caprese Salad',
            description: 'Mozzarella, tomatoes, basil, balsamic.',
          },
          gsw: {
            name: 'Insalata Caprese',
            description: 'Mozzarella, Tomate, Basilikum, Balsamico.',
          },
          hi: {
            name: 'कैप्रेसे सलाद',
            description: 'मोज़ारेला, टमाटर, तुलसी, बाल्समिक।',
          },
          ar: {
            name: 'سلطة كابريزي',
            description: 'موزاريلا، طماطم، ريحان، بلسميك.',
          },
          ko: {
            name: '카프레제 샐러드',
            description: '모차렐라, 토마토, 바질, 발사믹.',
          },
        },
      },
      {
        id: 'pizza-margherita',
        sectionId: 'pizzas',
        price: 21,
        currency: 'CHF',
        isAvailable: true,
        isVegetarian: true,
        containsGluten: true,
        containsDairy: true,
        translations: {
          de: {
            name: 'Pizza Margherita',
            description: 'Tomatensauce, Mozzarella, Basilikum.',
          },
          en: {
            name: 'Pizza Margherita',
            description: 'Tomato sauce, mozzarella, basil.',
          },
          gsw: {
            name: 'Pizza Margherita',
            description: 'Tomatesauce, Mozzarella, Basilikum.',
          },
          hi: {
            name: 'पिज्जा मार्गरीटा',
            description: 'टमाटर सॉस, मोज़ारेला, तुलसी।',
          },
          ar: {
            name: 'بيتزا مارغريتا',
            description: 'صلصة طماطم، موزاريلا، ريحان.',
          },
          ko: {
            name: '마르게리타 피자',
            description: '토마토 소스, 모차렐라, 바질.',
          },
        },
      },
      {
        id: 'pizza-diavola',
        sectionId: 'pizzas',
        price: 24,
        currency: 'CHF',
        isAvailable: true,
        isSpicy: true,
        containsGluten: true,
        containsDairy: true,
        translations: {
          de: {
            name: 'Pizza Diavola',
            description: 'Tomatensauce, Mozzarella, scharfe Salami, Chili.',
          },
          en: {
            name: 'Pizza Diavola',
            description: 'Tomato sauce, mozzarella, spicy salami, chilli.',
          },
          gsw: {
            name: 'Pizza Diavola',
            description: 'Tomatesauce, Mozzarella, scharfi Salami, Chili.',
          },
          hi: {
            name: 'पिज्जा डियावोला',
            description: 'टमाटर सॉस, मोज़ारेला, तीखी सलामी, मिर्च।',
          },
          ar: {
            name: 'بيتزا ديافولا',
            description: 'صلصة طماطم، موزاريلا، سلامي حار، فلفل حار.',
          },
          ko: {
            name: '디아볼라 피자',
            description: '토마토 소스, 모차렐라, 매운 살라미, 칠리.',
          },
        },
      },
      {
        id: 'tiramisu',
        sectionId: 'dolci',
        price: 11,
        currency: 'CHF',
        isAvailable: true,
        isVegetarian: true,
        containsGluten: true,
        containsDairy: true,
        translations: {
          de: {
            name: 'Tiramisu',
            description: 'Mascarpone, Espresso, Kakao, Loeffelbiskuit.',
          },
          en: {
            name: 'Tiramisu',
            description: 'Mascarpone, espresso, cocoa, ladyfingers.',
          },
          gsw: {
            name: 'Tiramisu',
            description: 'Mascarpone, Espresso, Kakao, Loeffelbiskuit.',
          },
          hi: {
            name: 'तिरामिसू',
            description: 'मस्कारपोन, एस्प्रेसो, कोको, लेडीफिंगर्स।',
          },
          ar: {
            name: 'تيراميسو',
            description: 'ماسكاربوني، إسبريسو، كاكاو، بسكويت.',
          },
          ko: {
            name: '티라미수',
            description: '마스카르포네, 에스프레소, 코코아, 레이디핑거.',
          },
        },
      },
    ],
  },
}

export function getPublicMenu(slug: string) {
  return publicMenus[slug]
}
