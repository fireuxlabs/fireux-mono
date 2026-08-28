import type { DemandFamily } from './analysis'

export const operationsDemandFamilies: DemandFamily[] = [
  {
    id: 'mise-production',
    title: 'Mise and production',
    confidence: 'strong',
    intents: ['learn', 'choose', 'perform'],
    operatorJob:
      'Work out what must be prepared, by whom, at which station and by when.',
    interpretation:
      'Prep-list demand repeatedly uses template, app, example and Kitchen-specific language.',
    gap: 'Research pars, forecasting, batch production, carry-over, readiness, station assignment and planned-versus-produced quantities.',
    seeds: [
      {
        seed: 'restaurant prep list',
        suggestions: [
          'restaurant prep list template',
          'restaurant prep list app',
          'restaurant prep list example',
          'restaurant kitchen prep list',
          'restaurant food prep list',
        ],
      },
    ],
  },
  {
    id: 'orders-service',
    title: 'Orders and Kitchen service',
    confidence: 'strong',
    intents: ['compare', 'choose', 'perform', 'troubleshoot'],
    operatorJob:
      'Receive, route, prepare and complete live orders without losing timing or context.',
    interpretation:
      'KDS searches include app, free, open-source, price and restaurant modifiers; order searches include system and template language.',
    boundary:
      'Tables, guest service and payment remain Front-of-House concerns even when their orders feed the Kitchen.',
    gap: 'Research ticket time, station routing, expo, coursing, aggregation, throttling and 86 communication.',
    seeds: [
      {
        seed: 'kitchen display system',
        suggestions: [
          'kitchen display system app',
          'kitchen display system app free',
          'kitchen display system open source',
          'kitchen display system price',
          'kitchen display system for restaurant',
        ],
      },
      {
        seed: 'restaurant order management system',
        suggestions: [
          'restaurant order management system',
          'restaurant order management system free',
          'restaurant order management system design',
          'restaurant order management system template',
        ],
      },
    ],
  },
  {
    id: 'menus',
    title: 'Menus and menu engineering',
    confidence: 'strong',
    intents: ['learn', 'compare', 'choose', 'perform'],
    operatorJob:
      'Build, publish and evaluate menus connected to dishes, prices and service.',
    interpretation:
      'Observed searches cover menu-management systems and software plus menu-engineering matrices, examples and PDFs.',
    boundary:
      'Menu engineering needs product-mix evidence and defensible cost inputs; popularity alone is not profitability.',
    gap: 'Research publishing, QR access, translations, availability, modifiers, pricing and channel-specific menus.',
    seeds: [
      {
        seed: 'restaurant menu management',
        suggestions: [
          'restaurant menu management system',
          'restaurant menu management software',
          'restaurant menu management ui',
        ],
      },
      {
        seed: 'restaurant menu engineering',
        suggestions: [
          'restaurant menu engineering matrix',
          'restaurant menu engineering examples',
          'restaurant menu engineering pdf',
        ],
      },
    ],
  },
  {
    id: 'team-training',
    title: 'Kitchen team and training',
    confidence: 'moderate',
    intents: ['learn', 'choose', 'perform'],
    operatorJob:
      'Give Kitchen staff clear responsibilities, current knowledge and consistent ways of working.',
    interpretation:
      'Training searches appear, but this sample does not yet separate Kitchen operations from wider workforce software.',
    boundary:
      'Payroll and generic HR are not Kitchen capabilities; roles, station competence and operational training can be.',
    gap: 'Research station training, recipe execution, skills matrices, shift handover, communication and scheduling separately.',
    seeds: [
      {
        seed: 'restaurant employee training checklist',
        suggestions: ['restaurant employee training checklist'],
      },
      {
        seed: 'restaurant shift handover',
        suggestions: [
          'restaurant shift handover checklist',
          'restaurant shift handover template',
        ],
      },
    ],
  },
  {
    id: 'equipment-maintenance',
    title: 'Equipment and maintenance',
    confidence: 'early',
    intents: ['learn', 'choose', 'perform', 'troubleshoot'],
    operatorJob: 'Keep Kitchen equipment safe, available and serviced.',
    interpretation:
      'Live results establish maintenance logs and specialist software vocabulary, but the tested autocomplete seed produced no expansions.',
    gap: 'Research asset registers, planned maintenance, faults, service history, calibration, warranties and cleaning certification.',
    seeds: [],
  },
  {
    id: 'reports-analysis',
    title: 'Kitchen reports and analysis',
    confidence: 'moderate',
    intents: ['learn', 'perform', 'troubleshoot'],
    operatorJob:
      'Understand sales, product mix, service speed, food safety, stock, waste and cost from operational evidence.',
    interpretation:
      'Demand uses specific report names more reliably than the vague phrase “Kitchen reports”.',
    boundary:
      'Do not promise profit, labour, tax or accounting reports without authoritative producers.',
    gap: 'Research each report by its real name: sales, product mix, ticket time, HACCP, stock variance, waste and food cost.',
    seeds: [],
  },
  {
    id: 'formats-scale',
    title: 'Kitchen formats and scale',
    confidence: 'strong',
    intents: ['learn', 'compare', 'choose'],
    operatorJob:
      'Operate the same core Kitchen jobs across a specialist format, production model or group of locations.',
    interpretation:
      'Search language distinguishes bakery, catering, cloud, ghost, commissary, commercial and institutional Kitchens. These are market segments with capability variants, not automatically separate capabilities.',
    boundary:
      'The Level-one Kitchen map records these operator contexts without allowing one format to define the whole domain.',
    gap: 'Research hotels, healthcare, education, contract catering, central production and multi-location control independently.',
    seeds: [
      {
        seed: 'bakery management software',
        suggestions: [
          'bakery order management software',
          'bakery inventory management software',
          'best bakery management software',
          'bakery production management software',
        ],
      },
      {
        seed: 'cloud kitchen management',
        suggestions: [
          'cloud kitchen management software',
          'cloud kitchen management system',
          'cloud kitchen management app',
          'cloud kitchen order management system',
        ],
      },
      {
        seed: 'ghost kitchen software',
        suggestions: ['ghost kitchen management software'],
      },
      {
        seed: 'catering management software',
        suggestions: [
          'catering event management software',
          'catering business management software',
          'catering order management software',
        ],
      },
      {
        seed: 'commissary kitchen software',
        suggestions: [
          'commissary kitchen software',
          'commissary kitchen management software',
        ],
      },
      {
        seed: 'commercial kitchen management',
        suggestions: [
          'commercial kitchen management software',
          'commercial kitchen waste management',
        ],
      },
      {
        seed: 'institutional food service management',
        suggestions: [
          'institutional food service management',
          'institutional food service management pdf',
        ],
      },
    ],
  },
]

