#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const KITCHEN_SLUG = 'bergwelt-grindelwald'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-bergwelt-grindelwald-translation-cache'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'
const MENU_ID = 'main'
const ATTACHED_LANGUAGES = ['de', 'en']
const CACHE_LANGUAGES = ['fr', 'it', 'es', 'pt', 'ar', 'he', 'ko', 'ja']

const normalizeString = (value) => String(value ?? '').trim()

const TRANSLATIONS = {
  fr: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'Bergwelt Grindelwald',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'Dessert | Douceurs',
      information: 'Allergies / Intolérances',
      declaration: 'Déclaration & origine',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'viande séchée | fromage local | pickles',
      },
      'beef-tatar-asia-style': {
        name: 'Tartare de bœuf style asiatique',
        description: 'radis | soja | kroepoek',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'pommes de terre | sauce brava | alioli',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'blanc de poulet | bacon | Grana Padano',
      },
      'fruehlings-salat': {
        name: 'Salade de printemps',
        description: 'asperges vertes | fraises | radis',
      },
      'spicy-meat-balls': {
        name: 'Boulettes épicées',
        description: 'sugo | oignons croustillants | peperoncini',
      },
      'crispy-shrimps': {
        name: 'Crevettes croustillantes',
        description: 'ponzu | sweet chili | mayonnaise au citron',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'fromage Jungfrau | bacon | sauce BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'ponzu | sweet chili | nam satay',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'toast | jambon | gruyère',
      },
      'miso-ramen': {
        name: 'Miso Ramen',
        description: 'pak choi | œuf onsen | blanc de poulet',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'pomodoro | bolognaise | aglio & olio',
      },
      'glace-sorbet': {
        name: 'Glaces & sorbets',
        description: [
          'avec chantilly +5',
          'glaces: vanille | chocolat | caramel | yaourt | café',
          'sorbets: citron | fraise | framboise | fruit de la passion | mangue',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'vodka | sorbet citron | basilic',
      },
      'savarin-au-rhum': {
        name: 'Savarin au rhum',
        description: 'gâteau levé | thé | rhum Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Fromages Eiger Milch & Jumi',
        description: 'assortiment de fromages locaux | pain aux fruits | raisins | moutarde aux figues',
      },
      'allergien-intoleranzen': {
        name: 'Allergies / Intolérances',
        description: [
          'Veuillez nous informer de toute allergie ou intolérance.',
          'Veuillez noter que tous les produits sont préparés dans la même cuisine. Nous ne pouvons pas garantir l’absence de contaminations croisées.',
          'Notre équipe de service se fera un plaisir de vous conseiller.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'Pain',
        description: 'Nous nous approvisionnons en pain exclusivement en Suisse et toujours aussi localement que possible.',
      },
      'deklaration-herkunft': {
        name: 'Déclaration & origine',
        description: [
          'Veau: Suisse',
          'Blanc de poulet: Suisse',
          'Tartare de bœuf: Suisse',
          'Produits carnés: Suisse',
          'Crevettes: Vietnam',
        ].join('\n'),
      },
    },
  },
  it: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'Bergwelt Grindelwald',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'Dessert | Dolci',
      information: 'Allergie / Intolleranze',
      declaration: 'Dichiarazione & origine',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'carne secca | formaggio locale | sottaceti',
      },
      'beef-tatar-asia-style': {
        name: 'Tartare di manzo Asia Style',
        description: 'ravanello | soia | kroepoek',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'patate | salsa brava | alioli',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'petto di pollo | bacon | Grana Padano',
      },
      'fruehlings-salat': {
        name: 'Insalata primaverile',
        description: 'asparagi verdi | fragole | ravanelli',
      },
      'spicy-meat-balls': {
        name: 'Polpette piccanti',
        description: 'sugo | cipolle croccanti | peperoncini',
      },
      'crispy-shrimps': {
        name: 'Gamberi croccanti',
        description: 'ponzu | sweet chili | maionese al limone',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'formaggio Jungfrau | bacon | salsa BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'ponzu | sweet chili | nam satay',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'toast | prosciutto | Gruyère',
      },
      'miso-ramen': {
        name: 'Miso Ramen',
        description: 'pak choi | uovo onsen | petto di pollo',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'pomodoro | bolognese | aglio & olio',
      },
      'glace-sorbet': {
        name: 'Gelato & sorbetto',
        description: [
          'con panna +5',
          'gelato: vaniglia | cioccolato | caramello | yogurt | caffè',
          'sorbetto: limone | fragola | lampone | frutto della passione | mango',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'vodka | sorbetto al limone | basilico',
      },
      'savarin-au-rhum': {
        name: 'Savarin al rum',
        description: 'dolce lievitato | tè | rum Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Formaggi Eiger Milch & Jumi',
        description: 'selezione di formaggi locali | pane alla frutta | uva | senape ai fichi',
      },
      'allergien-intoleranzen': {
        name: 'Allergie / Intolleranze',
        description: [
          'Vi preghiamo di informarci su eventuali allergie o intolleranze.',
          'Tutti i prodotti sono preparati nella stessa cucina. Non possiamo garantire che la contaminazione incrociata venga evitata.',
          'Il nostro team di servizio sarà lieto di consigliarvi.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'Pane',
        description: 'Acquistiamo il pane esclusivamente in Svizzera e sempre il più localmente possibile.',
      },
      'deklaration-herkunft': {
        name: 'Dichiarazione & origine',
        description: [
          'Vitello: Svizzera',
          'Petto di pollo: Svizzera',
          'Tartare di manzo: Svizzera',
          'Prodotti di carne: Svizzera',
          'Gamberi: Vietnam',
        ].join('\n'),
      },
    },
  },
  es: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'Bergwelt Grindelwald',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'Postres | Dulces',
      information: 'Alergias / Intolerancias',
      declaration: 'Declaración & origen',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'carne seca | queso local | encurtidos',
      },
      'beef-tatar-asia-style': {
        name: 'Tartar de ternera estilo asiático',
        description: 'rábano | soja | kroepoek',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'patatas | salsa brava | alioli',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'pechuga de pollo | bacon | Grana Padano',
      },
      'fruehlings-salat': {
        name: 'Ensalada de primavera',
        description: 'espárragos verdes | fresas | rábanos',
      },
      'spicy-meat-balls': {
        name: 'Albóndigas picantes',
        description: 'sugo | cebollas crujientes | peperoncini',
      },
      'crispy-shrimps': {
        name: 'Gambas crujientes',
        description: 'ponzu | sweet chili | mayonesa de limón',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'queso Jungfrau | bacon | salsa BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'ponzu | sweet chili | nam satay',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'tostada | jamón | queso gruyère',
      },
      'miso-ramen': {
        name: 'Miso Ramen',
        description: 'pak choi | huevo onsen | pechuga de pollo',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'pomodoro | boloñesa | aglio & olio',
      },
      'glace-sorbet': {
        name: 'Helado & sorbete',
        description: [
          'con nata +5',
          'helado: vainilla | chocolate | caramelo | yogur | café',
          'sorbete: limón | fresa | frambuesa | fruta de la pasión | mango',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'vodka | sorbete de limón | albahaca',
      },
      'savarin-au-rhum': {
        name: 'Savarin al ron',
        description: 'bizcocho de levadura | té | ron Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Quesos Eiger Milch & Jumi',
        description: 'selección de quesos locales | pan de frutas | uvas | mostaza de higos',
      },
      'allergien-intoleranzen': {
        name: 'Alergias / Intolerancias',
        description: [
          'Infórmenos sobre cualquier alergia o intolerancia.',
          'Todos los productos se preparan en la misma cocina. No podemos garantizar que se evite la contaminación cruzada.',
          'Nuestro equipo de servicio estará encantado de asesorarle.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'Pan',
        description: 'Obtenemos nuestro pan exclusivamente de Suiza y siempre de la forma más local posible.',
      },
      'deklaration-herkunft': {
        name: 'Declaración & origen',
        description: [
          'Ternera: Suiza',
          'Pechuga de pollo: Suiza',
          'Tartar de ternera: Suiza',
          'Productos cárnicos: Suiza',
          'Gambas: Vietnam',
        ].join('\n'),
      },
    },
  },
  pt: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'Bergwelt Grindelwald',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'Sobremesas | Doces',
      information: 'Alergias / Intolerâncias',
      declaration: 'Declaração & origem',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'carne seca | queijo local | pickles',
      },
      'beef-tatar-asia-style': {
        name: 'Tártaro de vaca estilo asiático',
        description: 'rabanete | soja | kroepoek',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'batatas | molho brava | alioli',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'peito de frango | bacon | Grana Padano',
      },
      'fruehlings-salat': {
        name: 'Salada de primavera',
        description: 'espargos verdes | morangos | rabanetes',
      },
      'spicy-meat-balls': {
        name: 'Almôndegas picantes',
        description: 'sugo | cebolas crocantes | peperoncini',
      },
      'crispy-shrimps': {
        name: 'Camarões crocantes',
        description: 'ponzu | sweet chili | maionese de limão',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'queijo Jungfrau | bacon | molho BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'ponzu | sweet chili | nam satay',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'tosta | fiambre | queijo gruyère',
      },
      'miso-ramen': {
        name: 'Miso Ramen',
        description: 'pak choi | ovo onsen | peito de frango',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'pomodoro | bolonhesa | aglio & olio',
      },
      'glace-sorbet': {
        name: 'Gelado & sorvete',
        description: [
          'com chantilly +5',
          'gelado: baunilha | chocolate | caramelo | iogurte | café',
          'sorvete: limão | morango | framboesa | maracujá | manga',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'vodka | sorvete de limão | manjericão',
      },
      'savarin-au-rhum': {
        name: 'Savarin com rum',
        description: 'bolo fermentado | chá | rum Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Queijos Eiger Milch & Jumi',
        description: 'seleção de queijos locais | pão de frutas | uvas | mostarda de figo',
      },
      'allergien-intoleranzen': {
        name: 'Alergias / Intolerâncias',
        description: [
          'Informe-nos sobre quaisquer alergias ou intolerâncias.',
          'Todos os produtos são preparados na mesma cozinha. Não podemos garantir que a contaminação cruzada seja evitada.',
          'A nossa equipa de serviço terá todo o prazer em aconselhá-lo.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'Pão',
        description: 'Compramos o nosso pão exclusivamente na Suíça e sempre tão localmente quanto possível.',
      },
      'deklaration-herkunft': {
        name: 'Declaração & origem',
        description: [
          'Vitela: Suíça',
          'Peito de frango: Suíça',
          'Tártaro de vaca: Suíça',
          'Produtos de carne: Suíça',
          'Camarões: Vietname',
        ].join('\n'),
      },
    },
  },
  ar: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'بيرغفلت غريندلفالد',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'الحلويات',
      information: 'الحساسية / عدم التحمل',
      declaration: 'التصريح والمنشأ',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'لحم مجفف | جبن محلي | مخللات',
      },
      'beef-tatar-asia-style': {
        name: 'تارتار لحم بقر على الطريقة الآسيوية',
        description: 'فجل | صويا | كروبوك',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'بطاطس | صلصة برافا | أيولي',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'صدر دجاج | لحم خنزير مقدد | غرانا بادانو',
      },
      'fruehlings-salat': {
        name: 'سلطة الربيع',
        description: 'هليون أخضر | فراولة | فجل',
      },
      'spicy-meat-balls': {
        name: 'كرات لحم حارة',
        description: 'صلصة سوغو | بصل مقرمش | بيبيرونتشيني',
      },
      'crispy-shrimps': {
        name: 'روبيان مقرمش',
        description: 'بونزو | صلصة حلوة حارة | مايونيز الليمون',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'جبن يونغفراو | لحم خنزير مقدد | صلصة BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'بونزو | صلصة حلوة حارة | نام ساتاي',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'توست | لحم خنزير | جبن غرويير',
      },
      'miso-ramen': {
        name: 'رامن ميسو',
        description: 'باك تشوي | بيض أونسن | صدر دجاج',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'بومودورو | بولونيز | أغليو إي أوليو',
      },
      'glace-sorbet': {
        name: 'آيس كريم وسوربيه',
        description: [
          'مع كريمة مخفوقة +5',
          'آيس كريم: فانيليا | شوكولاتة | كراميل | زبادي | قهوة',
          'سوربيه: ليمون | فراولة | توت العليق | باشن فروت | مانجو',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'فودكا | سوربيه الليمون | ريحان',
      },
      'savarin-au-rhum': {
        name: 'Savarin au Rhum',
        description: 'كعكة مخمرة | شاي | رم Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'أجبان Eiger Milch و Jumi',
        description: 'تشكيلة من الأجبان المحلية | خبز بالفواكه | عنب | خردل التين',
      },
      'allergien-intoleranzen': {
        name: 'الحساسية / عدم التحمل',
        description: [
          'يرجى إبلاغنا بأي حساسية أو عدم تحمل.',
          'يرجى العلم أن جميع المنتجات تُحضّر في المطبخ نفسه. لا يمكننا ضمان منع التلوث المتبادل.',
          'سيسعد فريق الخدمة لدينا بتقديم المشورة لكم.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'الخبز',
        description: 'نشتري خبزنا حصرياً من سويسرا وبأكبر قدر ممكن من المصادر المحلية.',
      },
      'deklaration-herkunft': {
        name: 'التصريح والمنشأ',
        description: [
          'لحم عجل: سويسرا',
          'صدر دجاج: سويسرا',
          'تارتار لحم بقر: سويسرا',
          'منتجات لحوم: سويسرا',
          'روبيان: فيتنام',
        ].join('\n'),
      },
    },
  },
  he: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'ברגוולט גרינדלוולד',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'קינוחים',
      information: 'אלרגיות / אי סבילות',
      declaration: 'הצהרה ומקור',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: 'בשר מיובש | גבינה מקומית | חמוצים',
      },
      'beef-tatar-asia-style': {
        name: 'טרטר בקר בסגנון אסייתי',
        description: 'צנון | סויה | קרופוק',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'תפוחי אדמה | רוטב בראווה | איולי',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: 'חזה עוף | בייקון חזיר | גרנה פדאנו',
      },
      'fruehlings-salat': {
        name: 'סלט אביבי',
        description: 'אספרגוס ירוק | תותים | צנוניות',
      },
      'spicy-meat-balls': {
        name: 'קציצות חריפות',
        description: 'סוגו | בצל פריך | פלפלונים חריפים',
      },
      'crispy-shrimps': {
        name: 'שרימפס פריך',
        description: 'פונזו | צ׳ילי מתוק | מיונז לימון',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'גבינת Jungfrau | בייקון חזיר | רוטב BG’s',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'פונזו | צ׳ילי מתוק | נאם סאטאי',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'טוסט | חזיר | גבינת גרוייר',
      },
      'miso-ramen': {
        name: 'ראמן מיסו',
        description: 'פאק צ׳וי | ביצת אונסן | חזה עוף',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'פומודורו | בולונז | אליו ואוליו',
      },
      'glace-sorbet': {
        name: 'גלידה וסורבה',
        description: [
          'עם קצפת +5',
          'גלידה: וניל | שוקולד | קרמל | יוגורט | קפה',
          'סורבה: לימון | תות | פטל | פסיפלורה | מנגו',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'וודקה | סורבה לימון | בזיליקום',
      },
      'savarin-au-rhum': {
        name: 'Savarin au Rhum',
        description: 'עוגת שמרים | תה | רום Bumbu',
      },
      'eiger-milch-jumi-kaese': {
        name: 'גבינות Eiger Milch & Jumi',
        description: 'מבחר גבינות מקומיות | לחם פירות | ענבים | חרדל תאנים',
      },
      'allergien-intoleranzen': {
        name: 'אלרגיות / אי סבילות',
        description: [
          'אנא הודיעו לנו על אלרגיות או אי סבילות.',
          'שימו לב שכל המוצרים מוכנים באותו מטבח. איננו יכולים להבטיח מניעה של זיהום צולב.',
          'צוות השירות שלנו ישמח לייעץ לכם.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'לחם',
        description: 'אנו רוכשים את הלחם שלנו אך ורק משווייץ ותמיד ממקורות מקומיים ככל האפשר.',
      },
      'deklaration-herkunft': {
        name: 'הצהרה ומקור',
        description: [
          'עגל: שווייץ',
          'חזה עוף: שווייץ',
          'טרטר בקר: שווייץ',
          'מוצרי בשר: שווייץ',
          'שרימפס: וייטנאם',
        ].join('\n'),
      },
    },
  },
  ko: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: '베르그벨트 그린델발트',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: '디저트 | 스위트',
      information: '알레르기 / 불내증',
      declaration: '원산지 표시',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: '건조 육류 | 현지 치즈 | 피클',
      },
      'beef-tatar-asia-style': {
        name: '아시아 스타일 비프 타르타르',
        description: '무 | 간장 | 크로푹',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: '감자 | 브라바 소스 | 아이올리',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: '닭가슴살 | 베이컨 | 그라나 파다노',
      },
      'fruehlings-salat': {
        name: '봄 샐러드',
        description: '그린 아스파라거스 | 딸기 | 래디시',
      },
      'spicy-meat-balls': {
        name: '매콤한 미트볼',
        description: '수고 소스 | 바삭한 양파 | 페페론치니',
      },
      'crispy-shrimps': {
        name: '크리스피 슈림프',
        description: '폰즈 | 스위트 칠리 | 레몬 마요',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: '융프라우 치즈 | 베이컨 | BG’s 소스',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: '폰즈 | 스위트 칠리 | 남 사테',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: '토스트 | 햄 | 그뤼예르 치즈',
      },
      'miso-ramen': {
        name: '미소 라멘',
        description: '청경채 | 온센 에그 | 닭가슴살',
      },
      casarecce: {
        name: 'Casarecce',
        description: '포모도로 | 볼로네제 | 알리오 올리오',
      },
      'glace-sorbet': {
        name: '아이스크림 & 셔벗',
        description: [
          '샹티이 크림 추가 +5',
          '아이스크림: 바닐라 | 초콜릿 | 캐러멜 | 요거트 | 커피',
          '셔벗: 레몬 | 딸기 | 라즈베리 | 패션프루트 | 망고',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: '보드카 | 레몬 셔벗 | 바질',
      },
      'savarin-au-rhum': {
        name: 'Savarin au Rhum',
        description: '발효 케이크 | 차 | Bumbu 럼',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Eiger Milch & Jumi 치즈',
        description: '현지 치즈 모둠 | 과일 빵 | 포도 | 무화과 머스터드',
      },
      'allergien-intoleranzen': {
        name: '알레르기 / 불내증',
        description: [
          '알레르기나 불내증이 있으시면 알려 주세요.',
          '모든 제품은 같은 주방에서 준비됩니다. 교차 오염을 완전히 방지한다고 보장할 수 없습니다.',
          '서비스 팀이 기꺼이 안내해 드립니다.',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: '빵',
        description: '저희는 빵을 스위스에서만 공급받으며 가능한 한 현지에서 조달합니다.',
      },
      'deklaration-herkunft': {
        name: '원산지 표시',
        description: [
          '송아지고기: 스위스',
          '닭가슴살: 스위스',
          '비프 타르타르: 스위스',
          '육가공품: 스위스',
          '새우: 베트남',
        ].join('\n'),
      },
    },
  },
  ja: {
    menu: {
      name: 'BG’S BAR & SOUL FOOD',
      description: 'ベルグヴェルト・グリンデルワルト',
    },
    sections: {
      food: 'BG’S BAR & SOUL FOOD',
      dessert: 'デザート | スイーツ',
      information: 'アレルギー / 不耐症',
      declaration: '原産地表示',
    },
    dishes: {
      grindelwalder: {
        name: 'Grindelwalder',
        description: '乾燥肉 | 地元チーズ | ピクルス',
      },
      'beef-tatar-asia-style': {
        name: 'アジアンスタイル ビーフタルタル',
        description: '大根 | 醤油 | クロプック',
      },
      'patatas-bravas': {
        name: 'Patatas Bravas',
        description: 'ポテト | ブラバソース | アイオリ',
      },
      'cesare-cardini': {
        name: 'Cesare Cardini',
        description: '鶏むね肉 | ベーコン | グラナ・パダーノ',
      },
      'fruehlings-salat': {
        name: '春のサラダ',
        description: 'グリーンアスパラガス | いちご | ラディッシュ',
      },
      'spicy-meat-balls': {
        name: 'スパイシーミートボール',
        description: 'スーゴ | クリスピーオニオン | ペペロンチーニ',
      },
      'crispy-shrimps': {
        name: 'クリスピーシュリンプ',
        description: 'ポン酢 | スイートチリ | レモンマヨ',
      },
      'b-cheese-burger-royale': {
        name: 'B’ Cheese-Burger Royale',
        description: 'ユングフラウチーズ | ベーコン | BG’sソース',
      },
      'tungs-thai-rolls': {
        name: 'Tung’s Thai Rolls',
        description: 'ポン酢 | スイートチリ | ナムサテ',
      },
      'croque-monsieur': {
        name: 'Croque Monsieur',
        description: 'トースト | ハム | グリュイエールチーズ',
      },
      'miso-ramen': {
        name: '味噌ラーメン',
        description: 'パクチョイ | 温泉卵 | 鶏むね肉',
      },
      casarecce: {
        name: 'Casarecce',
        description: 'ポモドーロ | ボロネーゼ | アーリオ・オーリオ',
      },
      'glace-sorbet': {
        name: 'アイスクリーム & ソルベ',
        description: [
          'シャンティクリーム付き +5',
          'アイスクリーム: バニラ | チョコレート | キャラメル | ヨーグルト | コーヒー',
          'ソルベ: レモン | いちご | ラズベリー | パッションフルーツ | マンゴー',
        ].join('\n'),
      },
      'coupe-colonel': {
        name: 'Coupe Colonel',
        description: 'ウォッカ | レモンソルベ | バジル',
      },
      'savarin-au-rhum': {
        name: 'Savarin au Rhum',
        description: '発酵ケーキ | 紅茶 | Bumbuラム',
      },
      'eiger-milch-jumi-kaese': {
        name: 'Eiger Milch & Jumi チーズ',
        description: '地元チーズの盛り合わせ | フルーツブレッド | ぶどう | いちじくマスタード',
      },
      'allergien-intoleranzen': {
        name: 'アレルギー / 不耐症',
        description: [
          'アレルギーや不耐症がある場合はお知らせください。',
          'すべての商品は同じキッチンで調理されています。交差汚染を完全に防ぐことは保証できません。',
          'サービスチームが喜んでご案内いたします。',
        ].join('\n'),
      },
      'brot-herkunft': {
        name: 'パン',
        description: 'パンはスイス国内のみから、可能な限り地元で調達しています。',
      },
      'deklaration-herkunft': {
        name: '原産地表示',
        description: [
          '仔牛肉: スイス',
          '鶏むね肉: スイス',
          'ビーフタルタル: スイス',
          '肉製品: スイス',
          'エビ: ベトナム',
        ].join('\n'),
      },
    },
  },
}

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

function printHelp() {
  console.log(`
Seed Bergwelt Grindelwald tourist translation cache.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-bergwelt-grindelwald-translation-cache.mjs [--commit]

Options:
  --commit                         Write Firestore cache docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function makeMenuTranslationCacheKey(fieldId, targetLanguage) {
  const fieldHash = createHash('sha256')
    .update([normalizeString(fieldId), normalizeString(targetLanguage)].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''
  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildCacheDoc({ fieldId, sourceText, translatedText, targetLanguage, sourceLanguage = 'default' }) {
  const id = makeMenuTranslationCacheKey(fieldId, targetLanguage)

  return {
    id,
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: 'manual',
    reviewed: true,
    certified: false,
    source_hash: sourceHash(sourceText),
    usage_count: 0,
    created: updatedStamp(),
    updated: updatedStamp(),
  }
}

function menuFieldId(menuId, field) {
  return `menu:${menuId}:${field}`
}

function sectionFieldId(menuId, sectionId, field) {
  return `menu:${menuId}:section:${sectionId}:${field}`
}

function itemFieldId(menuId, sectionId, itemId, field) {
  return `menu:${menuId}:section:${sectionId}:item:${itemId}:${field}`
}

function dishFieldId(dishId, field) {
  return `dish:${dishId}:${field}`
}

function addCacheDoc(docs, missing, input) {
  const fieldId = normalizeString(input.fieldId)
  const sourceText = normalizeString(input.sourceText)
  const translatedText = normalizeString(input.translatedText)

  if (!fieldId || !sourceText) return
  if (!translatedText) {
    missing.push({
      language: input.targetLanguage,
      field_id: fieldId,
      source_text: sourceText,
    })
    return
  }

  docs.push(buildCacheDoc({
    fieldId,
    sourceText,
    translatedText,
    targetLanguage: input.targetLanguage,
    sourceLanguage: input.sourceLanguage,
  }))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-bergwelt-grindelwald-translation-cache'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', KITCHEN_SLUG).limit(1).get()

  if (slugSnap.empty) {
    throw new Error(`Kitchen not found by slug: ${KITCHEN_SLUG}`)
  }

  const kitchenRef = slugSnap.docs[0].ref
  const kitchenSnap = slugSnap.docs[0]
  const menuRef = kitchenRef.collection('menus').doc(MENU_ID)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    throw new Error(`Menu not found: ${menuRef.path}`)
  }

  const menu = menuSnap.data() || {}
  const dishIds = new Set()
  for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
    for (const item of Array.isArray(section.items) ? section.items : []) {
      const dishId = normalizeString(item.dish_id)
      if (dishId) dishIds.add(dishId)
    }
  }
  const dishSnaps = await Promise.all(
    Array.from(dishIds).map((dishId) => kitchenRef.collection('dishes').doc(dishId).get())
  )
  const dishesById = new Map(
    dishSnaps
      .filter((snap) => snap.exists)
      .map((snap) => [snap.ref.id, snap.data() || {}])
  )
  const docs = []
  const missing = []

  for (const targetLanguage of CACHE_LANGUAGES) {
    const translations = TRANSLATIONS[targetLanguage]
    const add = (fieldId, sourceText, translatedText, sourceLanguage = 'default') => {
      addCacheDoc(docs, missing, {
        fieldId,
        sourceText,
        translatedText,
        targetLanguage,
        sourceLanguage,
      })
    }

    add(menuFieldId(MENU_ID, 'name'), menu.name || MENU_ID, translations?.menu?.name)
    add(menuFieldId(MENU_ID, 'description'), menu.description, translations?.menu?.description)

    for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
      const sectionId = normalizeString(section.id)
      add(
        sectionFieldId(MENU_ID, sectionId, 'label'),
        section.label,
        translations?.sections?.[sectionId]
      )
      add(sectionFieldId(MENU_ID, sectionId, 'description'), section.description, '')

      for (const item of Array.isArray(section.items) ? section.items : []) {
        const itemId = normalizeString(item.id)
        const dishId = normalizeString(item.dish_id)
        if (!dishId) {
          const itemTranslation = translations?.items?.[itemId]
          add(itemFieldId(MENU_ID, sectionId, itemId, 'label'), item.label, itemTranslation?.label)
          add(
            itemFieldId(MENU_ID, sectionId, itemId, 'description'),
            item.description,
            itemTranslation?.description
          )
          continue
        }

        const dish = dishesById.get(dishId)
        const dishTranslation = translations?.dishes?.[dishId]
        if (!dish) {
          missing.push({
            language: targetLanguage,
            field_id: dishFieldId(dishId, 'name'),
            source_text: '[missing dish document]',
          })
          continue
        }

        add(dishFieldId(dishId, 'name'), dish.name || dishId, dishTranslation?.name)
        add(
          dishFieldId(dishId, 'description'),
          dish.description,
          dishTranslation?.description
        )
      }
    }
  }

  const docsByLanguage = Object.fromEntries(
    CACHE_LANGUAGES.map((language) => [
      language,
      docs.filter((doc) => doc.target_language === language).length,
    ])
  )

  console.log('[seed] bergwelt-grindelwald-translation-cache prepared', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    cachePath: menuRef.collection('translation_cache').path,
    show: kitchenSnap.data()?.show,
    attachedLanguages: ATTACHED_LANGUAGES,
    cacheLanguages: CACHE_LANGUAGES,
    docsByLanguage,
    totalDocs: docs.length,
    missing,
  })

  if (!commit) return
  if (missing.length) {
    throw new Error(`Refusing to write incomplete translation cache: ${missing.length} missing values`)
  }

  let batch = db.batch()
  let ops = 0

  batch.set(
    kitchenRef,
    {
      show: false,
      design: {
        color_mode: 'light',
      },
      language_settings: {
        default_language: 'de',
        supported_languages: ATTACHED_LANGUAGES,
        public_languages: FieldValue.delete(),
        attached_languages: ATTACHED_LANGUAGES,
        cache_languages: CACHE_LANGUAGES,
      },
      supported_languages: ATTACHED_LANGUAGES,
      updated: updatedStamp(),
    },
    { merge: true }
  )
  ops += 1

  for (const doc of docs) {
    batch.set(menuRef.collection('translation_cache').doc(doc.id), doc, { merge: false })
    ops += 1
    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  console.log('[seed] bergwelt-grindelwald-translation-cache done', {
    written: {
      kitchen: 1,
      cacheDocs: docs.length,
    },
    language_settings: {
      attached_languages: ATTACHED_LANGUAGES,
      cache_languages: CACHE_LANGUAGES,
    },
    routes: CACHE_LANGUAGES.map(
      (language) => `/kitchens/bergwelt-grindelwald/menus/main?lang=${language}`
    ),
  })
}

main().catch((error) => {
  console.error('[seed] bergwelt-grindelwald-translation-cache failed')
  console.error(error)
  process.exitCode = 1
})
