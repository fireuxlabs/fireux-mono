export const roadmapBySlug: Record<
  string,
  { title: string; description: string; icon?: string; color?: string }[]
> = {
  'fireux-kitchens': [
    {
      title: 'Now',
      description: 'Kitchen profile plus menus, ingredients, mise, team, and costs sections.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Structured prep lists, inventory workflows, and kitchen ops tooling.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Station workflows, touch-friendly order handling, and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-jobs': [
    {
      title: 'Now',
      description: 'Jobs list/detail pages, create/edit posts, and professional profiles.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Applicant workflow, messaging, and status tracking.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Payments, verified applicants, and advanced analytics.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-places': [
    {
      title: 'Now',
      description: 'Places list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Map views, search filters, and richer discovery.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Multi-location analytics and integrations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-companies': [
    {
      title: 'Now',
      description: 'Company list/detail pages plus create/edit flows.',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Team pages, org charts, and richer company data.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'B2B verification and partner tooling.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
  'fireux-suppliers': [
    {
      title: 'Now',
      description: 'Module scaffold only (no UI yet).',
      icon: 'i-lucide-check-circle',
      color: 'primary',
    },
    {
      title: 'Next',
      description: 'Launch pages, drop schedules, and basic campaign flow.',
      icon: 'i-lucide-clock-3',
      color: 'warning',
    },
    {
      title: 'Later',
      description: 'Timed releases, inventory hooks, and marketing automations.',
      icon: 'i-lucide-rocket',
      color: 'neutral',
    },
  ],
}
