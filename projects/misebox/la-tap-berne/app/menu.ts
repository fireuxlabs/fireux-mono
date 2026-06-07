export type LaTapBerneMenuItem = {
  name: string
  description: string
  price: string
}

export type LaTapBerneMenuSection = {
  label: string
  items: LaTapBerneMenuItem[]
}

export const laTapBerneMenuSections: LaTapBerneMenuSection[] = [
  {
    label: 'Las Tapas',
    items: [
      {
        name: 'Aioli',
        description: 'Knoblauch-Mayonnaise',
        price: '9.50',
      },
      {
        name: 'Bravas',
        description: 'Scharfe Sauce',
        price: '9.50',
      },
      {
        name: 'Tortilla de Patata',
        description: 'Die spanische Kartoffel-Omelette. Ø24cm. Klein 9.50, mittel 16.-, gross 25.-',
        price: '9.50 / 16 / 25',
      },
      {
        name: 'Gebratene Pimientos de Padrón',
        description: 'mit Meersalzflocken',
        price: '9',
      },
      {
        name: 'Portobello al Ajillo',
        description: 'Portobello-Pilze in Knoblauch-Chili-Öl',
        price: '16',
      },
      {
        name: 'Panierte Camembert',
        description: 'und Tomatenmarmelade',
        price: '16',
      },
      {
        name: 'Buffalo-Schwein Ribs',
        description: 'mit scharfer Sauce. Mit Pommes 27.-',
        price: '23',
      },
      {
        name: '"The Famous" Schweinebauch Albariño Teriyaki',
        description: 'Wakame-Salat, Cipollotte und Sesam. Mit Pommes 25.-',
        price: '21',
      },
      {
        name: 'Crispy Chicken Fingers',
        description: '5 selbstgemachte knusprige Poulet Fingers, scharfe Pickles, Guacamole und Aioli Sauce. Mit Pommes 25.-',
        price: '21',
      },
    ],
  },
  {
    label: 'Ein bisschen Meer',
    items: [
      {
        name: 'Black Tiger al Ajillo',
        description: 'Garnelen in Knoblauch-Chili-Öl',
        price: '18',
      },
      {
        name: 'Calamares Knusperli',
        description: 'mit Aioli und gegrillter Zitrone',
        price: '18',
      },
      {
        name: 'Pulpo a la Gallega',
        description: 'Tintenfisch nach galizischer Art mit Olivenöl, geräuchertem Paprikapulver und Kartoffeln "cachelos"',
        price: '25',
      },
      {
        name: 'Gegrillter Pulpo',
        description: 'Chimichurri und Hummus pikant',
        price: '25',
      },
    ],
  },
  {
    label: 'Kroketten',
    items: [
      {
        name: 'Jamón',
        description: 'Serrano Schinken',
        price: '10',
      },
      {
        name: 'Trüffel',
        description: 'Champignons und Trüffelöl',
        price: '10',
      },
    ],
  },
  {
    label: 'Salats',
    items: [
      {
        name: 'Gemischter Salat',
        description: 'mit La Tapberne Salatsauce',
        price: '10',
      },
      {
        name: 'Bloody Mary Burrata',
        description: 'Tomaten, Sellerie, rote Zwiebeln und Bloody Mary Sauce',
        price: '19',
      },
      {
        name: 'Tapberne Nüssler Salat',
        description: 'Schweinebauch, Ei, geröstetes Brot und Sauce',
        price: '21',
      },
      {
        name: 'Caesar Crispy Poulet Salat',
        description: 'Speck, Manchego Käse und Caesar Dressing',
        price: '21',
      },
    ],
  },
  {
    label: 'Hauptgerichte',
    items: [
      {
        name: 'Zorza Schwein/Poulet',
        description: 'Marinierte Streifen auf Pommes allumettes und geröstete Paprika. Add-ons: Manchego 2.50, Spiegelei 2.50',
        price: '27',
      },
      {
        name: 'Huevos Rotos con Cecina',
        description: 'Cecina Schinken, 2 Spiegeleier und Rustico Frites. Add-ons: Manchego 2.50, Trüffelöl 2.50',
        price: '24',
      },
      {
        name: 'Fish and Chips',
        description: 'Im Bierteig knusprig ausgebackene Eglifilets, frische Tartarsauce, hausgemachte Pickles und Pommes',
        price: '27',
      },
    ],
  },
  {
    label: "Chef's Special",
    items: [
      {
        name: 'El Cachopo',
        description: 'Rinds asturischer "Cordon Bleu", selbstgemacht, gefüllt mit Cecina und Manchego Käse, begleitet mit unseren Patatas und Pimientos de Padrón',
        price: '38',
      },
    ],
  },
  {
    label: '"Onlyhands"',
    items: [
      {
        name: 'Picanha Smashburger',
        description: 'Zwei selbstgemachte Rinds-Hüftdeckel Patties, doppeltem Käse, Romesco Sauce, Nüsslisalat, Röstzwiebeln, Brioche Brot dazu Rustico Frites',
        price: '28',
      },
      {
        name: 'The Vegi Smashburger',
        description: '',
        price: '25',
      },
      {
        name: 'La Tapberne Francesinha Pulled Beef Sandwich',
        description: 'Toastbrot, Pulled Beef, Cecina, Käse überbacken, Spiegelei und "Francesinha" Sauce, dazu Pommes',
        price: '28',
      },
      {
        name: 'Hot Dog',
        description: 'Zwei Käsesorten, Tomatenmarmelade, Senf, rote Zwiebel-Pickles und Schweinebauch Chips "Torreznos", dazu Pommes',
        price: '18',
      },
      {
        name: 'Hot Dog Vegi',
        description: '',
        price: '18',
      },
      {
        name: 'Egli Sandwich',
        description: 'Einfach und lecker, Egli Knusperli auf einem Ciabatta Brot mit Tartarsauce und Salat',
        price: '17',
      },
      {
        name: 'Serrano Sandwich',
        description: 'mit Jamón Serrano, Burrata, Tomate und Ciabatta Brot',
        price: '16',
      },
    ],
  },
  {
    label: 'Öppis süss!',
    items: [
      {
        name: 'Churro Bites',
        description: 'Kleine Churro-Snacks mit Zimtzucker und Schokoladensauce',
        price: '10',
      },
      {
        name: 'Cheesecake',
        description: 'Kalt und mit hausgemachter Konfitüre',
        price: '10',
      },
      {
        name: 'Happy Tarta de Santiago',
        description: 'Der spanische Mandelkuchen mit Rahm-Rum-Rosinen-Eis',
        price: '10',
      },
    ],
  },
]
