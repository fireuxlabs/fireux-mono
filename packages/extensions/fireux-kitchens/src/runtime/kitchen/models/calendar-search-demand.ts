export const kitchenCalendarSearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question:
    'What do Kitchen operators need to understand and act on for a selected date?',
  method:
    'Current search results establish demand for shift-based checklists, readiness and accountable daily work. The Kitchen capability catalogue then identifies which child capability owns each record and action.',
  seeds: [
    {
      seed: 'daily Kitchen work',
      queries: [
        'restaurant daily operations checklist',
        'restaurant manager daily checklist',
        'kitchen daily task list',
        'restaurant shift checklist',
      ],
    },
    {
      seed: 'opening and readiness',
      queries: [
        'restaurant opening checklist',
        'kitchen opening checklist',
        'restaurant pre shift checklist',
        'kitchen readiness checklist',
      ],
    },
    {
      seed: 'closing and handover',
      queries: [
        'restaurant closing checklist',
        'kitchen closing checklist',
        'restaurant shift handover checklist',
        'kitchen manager end of day checklist',
      ],
    },
  ],
  clusters: [
    {
      id: 'prepare',
      title: 'Prepare for the next service',
      operatorJob:
        'See due Mise, expected Receiving, stock exceptions and required Food Safety checks in one time-bound view.',
      owners: ['Mise', 'Receiving', 'Inventory', 'Food Safety'],
      interpretation:
        'Calendar may order and link these records for the selected date, but it does not copy or complete them.',
    },
    {
      id: 'service',
      title: 'Run the current service',
      operatorJob:
        'See active Orders, Station workload, unavailable items and operational exceptions that need attention now.',
      owners: ['Orders & Service', 'Stations', 'Menus', 'Inventory'],
      interpretation:
        'Every status and action remains authoritative in its child capability.',
    },
    {
      id: 'close',
      title: 'Close and hand over',
      operatorJob:
        'See incomplete work, Waste records, Food Safety exceptions and the bounded Sales result for the completed period.',
      owners: ['Mise', 'Waste', 'Food Safety', 'Sales', 'Team'],
      interpretation:
        'Calendar can expose gaps and route follow-up; it cannot infer completion, causes, cost or compliance.',
    },
  ],
  validationSources: [
    {
      label: 'Toast restaurant opening and closing checklists',
      url: 'https://pos.toasttab.com/blog/on-the-line/restaurant-opening-and-closing-checklist',
      note: 'Validates time-bound opening and closing work across preparation, stock, deliveries, Stations, safety and management review.',
    },
    {
      label: '7shifts restaurant manager checklist',
      url: 'https://www.7shifts.com/resources/templates/restaurant-manager-checklist-template/',
      note: 'Validates distinct opening, ongoing and closing duties rather than one undifferentiated dashboard.',
    },
    {
      label: 'National Restaurant Association Kitchen role guidance',
      url: 'https://restaurant.org/education-and-resources/learning-center/workforce-engagement/restaurant-industry-job-descriptions/',
      note: 'Validates daily coordination across food safety, Station setup, timing, Orders and Inventory.',
    },
  ],
  recordQuestions: [
    'Which selected Kitchen, local date, service and timezone define the selected Calendar day?',
    'Which child capability owns each displayed record and action?',
    'Which items are due, late, blocked, exceptional or awaiting approval?',
    'Which status is current source evidence and which is an AI deduction?',
    'Can an operator open the owning capability directly from every item?',
    'Which child records are unavailable or incomplete rather than safely empty?',
    'Which actions require approval, and where will that approval be recorded?',
  ],
  doorwayGroups: [
    {
      title: 'Prepare',
      items: [
        {
          label: 'Receiving',
          to: '/workspace/kitchen/stock/receiving',
          question: 'What is expected to arrive?',
        },
        {
          label: 'Inventory',
          to: '/workspace/kitchen/stock/inventory',
          question: 'Which stock needs attention?',
        },
        {
          label: 'Food Safety',
          to: '/workspace/kitchen/food-safety',
          question: 'Which checks are required?',
        },
      ],
    },
    {
      title: 'Service',
      items: [
        {
          label: 'Orders',
          to: '/workspace/kitchen/orders',
          question: 'What is active in service?',
        },
        {
          label: 'Stations',
          to: '/workspace/kitchen/stations',
          question: 'Where is work routed?',
        },
        {
          label: 'Menus',
          to: '/workspace/kitchen/food-and-drink/menus',
          question: 'What is available to sell?',
        },
      ],
    },
    {
      title: 'Review',
      items: [
        {
          label: 'Waste',
          to: '/workspace/kitchen/stock/waste',
          question: 'What loss must be recorded?',
        },
        {
          label: 'Sales',
          to: '/workspace/kitchen/reports/finance',
          question: 'What bounded Sales evidence exists?',
        },
        {
          label: 'Team',
          to: '/workspace/kitchen/team',
          question: 'What needs handing over?',
        },
      ],
    },
  ],
  boundary: {
    owns: 'Presentation order, time scope, source labels and routes into owning child capabilities.',
    doesNotOwn:
      'Operational records, mutations, specialist Tools, a CalendarAI, generic task storage or copied child state.',
    kitchenAI:
      'KitchenAI may summarise authorized child evidence, explain unknowns and propose contextual actions through the owning capability.',
  },
  conclusion:
    'Calendar is the Kitchen Workspace date-scoped coordination surface. It opens on today and becomes useful incrementally as child capabilities produce time-bound evidence; it never becomes a second operational authority.',
} as const
