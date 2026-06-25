export const banginCoffeeLinks = {
  website: 'https://bangincoffee.co.uk',
  instagram: 'https://www.instagram.com/bangincoffeeltd/',
  facebook: 'https://www.facebook.com/profile.php?id=100085508626256',
  contactForm: 'https://form.jotform.com/261122681772052?canva-app=1&_height=691',
} as const

export const banginCoffeeTheme = {
  cssVariables: `
    :root {
      --bangin-bg: #17110d;
      --bangin-ink: #fff7e5;
      --bangin-muted: #d6b77a;
      --bangin-cream: #fff2cc;
      --bangin-roast: #5b341c;
      --bangin-gold: #f2b84b;
      --bangin-copper: #c46a2a;
      --bangin-card: rgba(255, 247, 229, 0.09);
      --bangin-border: rgba(255, 247, 229, 0.18);
    }
  `,
} as const

export const banginCoffeeContent = {
  hero: {
    eyebrow: 'Mobile coffee bar',
    title: 'Bangin Coffee',
    subtitle: 'In-house roasted coffee, pulled fresh from a mobile bar.',
    description:
      'A mobile coffee and event bar for weddings, corporate events, festivals, and private parties.',
  },
  roast: {
    title: 'Roasted for the booking',
    body:
      'Bangin Coffee sources beans from farms around the world and roasts in small batches before events.',
  },
  cards: [
    {
      title: 'Coffee first',
      description:
        'Espresso-based drinks are the core service, with a focus on fresh roast and efficient service.',
      icon: 'i-lucide-coffee',
    },
    {
      title: 'Events ready',
      description:
        'Built for weddings, corporate days, festivals, and private parties where service needs to flow.',
      icon: 'i-lucide-calendar-heart',
    },
    {
      title: 'More than coffee',
      description:
        'Optional drinks, cakes, pastries, and alcohol packages can extend the event bar offer.',
      icon: 'i-lucide-glass-water',
    },
  ],
  proof: [
    'Mobile horse trailer bar',
    'In-house roasted beans',
    'Coffee, cakes, pastries, and event packages',
  ],
} as const
