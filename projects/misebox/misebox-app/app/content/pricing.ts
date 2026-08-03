const contactEmail = 'misebox@misebox.app'
const enquiryButton = {
  color: 'neutral' as const,
  variant: 'soft' as const,
  trailingIcon: 'i-lucide-arrow-right',
}

export const miseboxPlans = {
  free: {
    id: 'free',
    title: 'Misebox Free',
    shortTitle: 'Free',
    description: 'Hire and start operating.',
    price: 'CHF 0',
    priceCurrency: 'CHF',
    features: [
      'One Kitchen workspace',
      'One published menu',
      'Unlimited permanent and fixed-term job posts and hires',
      'Unlimited temporary job advertising',
      'One active temporary engagement',
      'Applications, offers and hire tracking',
      'Self-service setup',
    ],
    landingFeatures: [
      'One Kitchen workspace',
      'One published menu',
      'Self-service setup',
    ],
    button: {
      ...enquiryButton,
      label: 'Start free',
      to: '/get-started',
    },
  },
  premium: {
    id: 'premium',
    title: 'Misebox Premium',
    shortTitle: 'Premium',
    description: 'Coordinate the whole operation.',
    price: 'CHF 20',
    priceCurrency: 'CHF',
    billingCycle: '/month',
    features: [
      'Everything in Free',
      'Multiple active temporary engagements',
      'Multiple menus',
      'Team access and permissions',
      'Preparation, stations, tables and orders',
      'Suppliers, costing and finance views',
      'Multilingual menus and advanced branding',
    ],
    landingFeatures: [
      'Multiple menus',
      'Team access and permissions',
      'Preparation, stations, tables and orders',
    ],
    highlight: true,
    scale: true,
    button: {
      ...enquiryButton,
      label: 'Choose Premium',
      to: '/get-started',
    },
  },
  managed: {
    id: 'managed',
    title: 'Managed Misebox',
    shortTitle: 'Managed',
    description: 'Let us manage the system with you.',
    price: 'CHF 50',
    priceCurrency: 'CHF',
    billingCycle: '/month',
    features: [
      'Everything in Premium',
      'Initial workspace and menu setup',
      'Brand, QR and team configuration',
      'Help importing menu and supplier information',
      'Agreed monthly content updates',
      'Priority assistance',
    ],
    landingFeatures: [
      'Initial workspace and menu setup',
      'Brand, QR and team configuration',
      'Menu and supplier import assistance',
    ],
    button: {
      ...enquiryButton,
      label: 'Ask about Managed',
      href: `mailto:${contactEmail}?subject=Managed%20Misebox`,
    },
  },
  dedicated: {
    id: 'dedicated',
    title: 'Dedicated App',
    description: 'Make Misebox entirely yours.',
    price: 'CHF 600',
    priceCurrency: 'CHF',
    billingPeriod: 'setup',
    features: [
      'Your own branding and web address',
      'A dedicated landing, menu and QR experience',
      'Selected Misebox modules',
      'CHF 20/month self-managed',
      'CHF 50/month managed',
      'A configured Misebox deployment—not bespoke software',
    ],
    button: {
      ...enquiryButton,
      label: 'Discuss a Dedicated App',
      href: `mailto:${contactEmail}?subject=Dedicated%20Misebox%20App`,
    },
  },
} as const

export const miseboxPlanGroups = [
  {
    id: 'misebox-workspace',
    title: 'Misebox workspace',
    description:
      'Permanent hiring stays free. Premium adds concurrent temporary engagements and deeper Kitchen operations.',
    plans: [miseboxPlans.free, miseboxPlans.premium],
  },
  {
    id: 'service-and-branding',
    title: 'Service and branding',
    description:
      'The same Kitchen Console, with hands-on help or a dedicated identity.',
    plans: [miseboxPlans.managed, miseboxPlans.dedicated],
  },
] as const

export const miseboxLandingPlans = [
  miseboxPlans.free,
  miseboxPlans.premium,
  miseboxPlans.managed,
] as const
