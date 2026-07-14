export interface BaerenNewsPost {
  slug: string
  title: string
  publishedAt: string
  summary: string
  body: string[]
}

export const baerenNewsPosts: BaerenNewsPost[] = [
  {
    slug: 'oktoberfest-mit-dem-rimo-quintett',
    title: 'Oktoberfest mit dem Rimo Quintett',
    publishedAt: '2023-10-09',
    summary: 'Ankündigung des Oktoberfests vom 20. Oktober 2023 mit dem Rimo Quintett und Buffet im Arvenstübli.',
    body: [
      'Am 20. Oktober 2023 veranstaltete das Hotel Bären ein Oktoberfest mit dem Rimo Quintett.',
      'Der Abend begann um 18.30 Uhr und umfasste ein grosses Buffet im Arvenstübli.',
    ],
  },
  {
    slug: 'neue-menuekarte',
    title: 'Neue Menükarte',
    publishedAt: '2023-08-22',
    summary: 'Die neue Menükarte wurde am 22. August 2023 eingeführt.',
    body: [
      'Das Restaurant führte am 22. August 2023 seine damalige neue Menükarte ein.',
      'Diese Meldung gehört zum Archiv. Die aktuelle Auswahl finden Sie auf unserer Menüseite.',
    ],
  },
  {
    slug: 'sleepwalkers-station-spontankonzert',
    title: "Sleepwalker's Station Spontankonzert",
    publishedAt: '2023-05-16',
    summary: "Ankündigung eines spontanen Indie-Folk-Konzerts von Sleepwalker's Station am 18. Mai 2023.",
    body: [
      "Sleepwalker's Station spielte am 18. Mai 2023 ein spontanes Konzert im Hotel Bären.",
      'Die Band präsentierte Indie Folk in mehreren Sprachen.',
    ],
  },
  {
    slug: 'tain-irish-scottish-folk',
    title: 'Táin – Irish & Scottish Folk',
    publishedAt: '2023-04-25',
    summary: 'Ankündigung des Folk-Konzerts von Táin vom 13. Mai 2023.',
    body: [
      'Táin war am 13. Mai 2023 im Hotel Bären zu Gast.',
      'Die Musikerinnen und Musiker brachten ihre gemeinsame Leidenschaft für irischen und schottischen Folk auf die Bühne.',
    ],
  },
  {
    slug: 'total-minimal-live-konzert',
    title: 'Total Minimal – Live Konzert',
    publishedAt: '2023-03-16',
    summary: 'Ankündigung des Live-Konzerts von Total Minimal vom 8. April 2023.',
    body: [
      'Total Minimal spielte am 8. April 2023 im Hotel Bären.',
      'Das Trio trat mit drei Instrumenten und drei Stimmen auf.',
    ],
  },
  {
    slug: 'theatergruppe-ringgenberg-im-siebete-himmel',
    title: 'Theatergruppe Ringgenberg – Im siebete Himmel',
    publishedAt: '2023-03-13',
    summary: 'Ankündigung der Aufführungen der Theatergruppe Ringgenberg vom 17. und 18. März 2023.',
    body: [
      'Die Theatergruppe Ringgenberg führte am 17. und 18. März 2023 den Dreiakter «Im siebete Himmel» von Hans Wälti auf.',
      'Die Vorstellungen begannen jeweils um 20 Uhr.',
    ],
  },
]

export function findBaerenNewsPost(slug: string) {
  return baerenNewsPosts.find(post => post.slug === slug)
}
