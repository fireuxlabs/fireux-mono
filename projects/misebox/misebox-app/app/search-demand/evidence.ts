import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'
import { demandFamilies } from './analysis'

const observedAt = '2026-08-22'
const validationObservedAt = '2026-08-28'

export const autocompleteObservations: AppSearchDemand['observations'] =
  demandFamilies.flatMap((family) =>
    family.seeds.flatMap(({ seed, suggestions }) =>
      suggestions.map((query) => ({
        query,
        source: 'google-autocomplete' as const,
        geography: 'Switzerland',
        language: 'English',
        observed_at: observedAt,
        metrics: [{ label: 'Seed', value: seed }],
        note: 'Suggested by Google Autocomplete for the named seed. This establishes current query language, not absolute search volume.',
        source_url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      }))
    )
  )

export const validationObservations: AppSearchDemand['observations'] = [
  {
    query: 'restaurant recipe management and food costing software pricing',
    source: 'live-search-results',
    geography: 'English-language web',
    language: 'English',
    observed_at: validationObservedAt,
    metrics: [
      {
        label: 'Public annual-billing price',
        value: 'USD 19–179/month before add-ons',
      },
    ],
    note: 'meez packages Recipes, scaling, unit conversion, yields, costing and Inventory at progressively higher paid tiers. This is historical product-language and pricing evidence, not demonstrated willingness to pay, search volume or proof that Misebox should copy the bundle.',
    source_url: 'https://www.getmeez.com/pricing',
  },
  {
    query: 'restaurant invoice automation inventory recipe costing pricing',
    source: 'live-search-results',
    geography: 'United States',
    language: 'English',
    observed_at: validationObservedAt,
    metrics: [{ label: 'Public price', value: 'USD 179–279/location/month' }],
    note: 'Toast xtraCHEF separates invoice automation from the higher-priced Inventory and Recipe Costing tier. It demonstrates a commercial offering around connected price, Recipe and stock evidence; published pricing does not establish adoption or Swiss willingness to pay.',
    source_url:
      'https://support.toasttab.com/en/article/xtraCHEF-by-Toast-Requesting-a-Demo',
  },
  {
    query: 'restaurant management software recipe costing pricing',
    source: 'live-search-results',
    geography: 'United States',
    language: 'English',
    observed_at: validationObservedAt,
    metrics: [{ label: 'Public price', value: 'USD 350/location/month' }],
    note: 'MarginEdge sells invoice and sales processing, Recipe Costing and operational cost insight at a material per-location price. It demonstrates a commercial cost-control offering, not verified buyer intent or a broad Misebox ERP decision.',
    source_url: 'https://www.marginedge.com/pricing/',
  },
  {
    query: 'Rezeptkalkulation Gastronomie Software Schweiz Preise',
    source: 'live-search-results',
    geography: 'Switzerland and DACH',
    language: 'German',
    observed_at: validationObservedAt,
    metrics: [
      { label: 'Public price', value: 'Free, CHF 79/month, CHF 179/month' },
    ],
    note: 'GastroKalk uses local buying language around Rezeptkalkulation, Warenbestand, Lieferschein scanning, HACCP checklists and price monitoring. The product describes itself as still in development, so this is local positioning evidence rather than adoption evidence.',
    source_url: 'https://gastrokalk.ch/preise',
  },
  {
    query: 'Swiss restaurant recipe costing and menu planning software pricing',
    source: 'live-search-results',
    geography: 'Switzerland',
    language: 'English',
    observed_at: validationObservedAt,
    metrics: [
      { label: 'Public price', value: 'Free, CHF 119/month, CHF 299/month' },
    ],
    note: 'Stüvetta positions Recipe Costing, Menu planning and daily margin visibility for independent Swiss restaurants. This reinforces local commercial language but does not establish adoption or query volume.',
    source_url: 'https://stuvetta.ch/',
  },
  {
    query: 'Swiss kitchen recipe product allergen supplier software',
    source: 'live-search-results',
    geography: 'Switzerland',
    language: 'German',
    observed_at: validationObservedAt,
    note: 'Optisoft joins Recipes, products, suppliers, nutrition, allergens and Warenaufwand in a modular Swiss Kitchen product. This validates the connected record graph while leaving each capability and purchase decision distinct.',
    source_url: 'https://optisoft.ch/preise-und-produkte/',
  },
  {
    query: 'Swiss food-business HACCP self-control guidance',
    source: 'live-search-results',
    geography: 'Switzerland',
    language: 'German',
    observed_at: validationObservedAt,
    note: 'The Swiss federal food-safety authority says food businesses must maintain good practice and apply HACCP-based self-control, and notes that this is demanding for smaller businesses. This proves a regulated operator job, not software demand or permission to give legal advice.',
    source_url:
      'https://www.blv.admin.ch/de/leitlinien-fuer-gute-verfahrenspraxis-lebensmittelbetriebe',
  },
  {
    query: 'Swiss catering allergen documentation dishes',
    source: 'live-search-results',
    geography: 'Switzerland',
    language: 'German',
    observed_at: validationObservedAt,
    note: 'Swiss federal guidance recommends current written allergen documentation across dishes and supplier communication about allergens and Recipe changes. This supports traceable Ingredient–Recipe–Menu evidence, not a generic compliance claim.',
    source_url:
      'https://www.blv.admin.ch/de/gemeinschaftsgastronomie-bereich-business',
  },
  {
    query: 'EU restaurant non-prepacked food allergen information',
    source: 'live-search-results',
    geography: 'European Union',
    language: 'English',
    observed_at: validationObservedAt,
    note: 'European Commission guidance requires allergen information for non-prepacked restaurant food and written availability on request. Switzerland, the EU and the UK still require separate jurisdiction checks.',
    source_url:
      'https://food.ec.europa.eu/food-safety/campaign-2026/allergies_en',
  },
  {
    query: 'restaurant inventory recipe costing spreadsheet pain',
    source: 'live-search-results',
    geography: 'English-language operator discussion',
    language: 'English',
    observed_at: validationObservedAt,
    note: 'Operators describe Ingredient price updates, portion conversions and item-level Recipe cost as recurring spreadsheet work. This is anecdotal problem evidence and must not be treated as representative market size.',
    source_url: 'https://www.reddit.com/r/restaurantowners/comments/1gv5dwq/',
  },
  {
    query: 'restaurant software stack too many tools',
    source: 'live-search-results',
    geography: 'English-language operator discussion',
    language: 'English',
    observed_at: validationObservedAt,
    note: 'Operators report separate POS, accounting, Inventory, costing, scheduling, ordering and analytics products. This validates integration and duplicate-work pain while warning against an unproved all-in-one promise.',
    source_url: 'https://www.reddit.com/r/restaurantowners/comments/18bftwp/',
  },
  {
    query: 'restaurant food costing software spreadsheet price sensitivity',
    source: 'live-search-results',
    geography: 'English-language operator discussion',
    language: 'English',
    observed_at: validationObservedAt,
    note: 'Operators also question paid costing software when maintained spreadsheets and supplier order guides meet the job. This is anecdotal evidence of price sensitivity, switching friction and the need to prove time saved.',
    source_url:
      'https://www.reddit.com/r/Chefit/comments/1tczir6/food_costing_software/',
  },
]
