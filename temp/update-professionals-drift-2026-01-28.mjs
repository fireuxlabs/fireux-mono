import { cert, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccountPath) {
  throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS')
}

const raw = await readFile(serviceAccountPath, 'utf8')
initializeApp({ credential: cert(JSON.parse(raw)), projectId: 'misebox-78f9c' })
const db = getFirestore()

const updates = [
  {
    id: 'FoPLMYVPirSiMm2eDskwsZja0q42',
    job_title: 'Chef de Partie',
    summary:
      'Experienced Chef de Partie with strong background in Michelin-recommended restaurants, private chalet dining, and high-volume hotel kitchens.',
    bio:
      'Chef de Partie with experience across fine dining, hotels, and high-volume operations. Has led sections independently, covered head chef duties, managed ordering, and trained junior staff while maintaining high standards and hygiene compliance.',
    image: '',
    positions: ['Chef de Partie', 'Sous Chef', 'Head Chef'],
    relevant_experience: [
      {
        role: 'Chef de Partie',
        responsibilities:
          'Managed the hot section and oversaw private chalet dining in a Michelin-recommended restaurant. Led the kitchen in the head chef’s absence, handled ordering, and trained junior staff, ensuring high standards using estate-sourced ingredients',
        to_year: null,
        to_month: null,
        ongoing: true,
        from_month: 'Jun',
        place_id: 'ChIJS1kBa_AGOEYRwRaP4kZIjvs',
        from_year: '2021',
      },
      {
        responsibilities:
          'Led the 300-cover hotel kitchen, managing menu planning, dish costing, and staff training. Oversaw kitchen operations, ordering, and hygiene compliance, ensuring smooth service in a high-volume environment.',
        from_year: '2020',
        role: 'Sous Chef',
        place_id: 'ChIJZYHwV2osOUYR6N1qUJ8m0jU',
        to_month: 'Jun',
        from_month: 'Jan',
        ongoing: false,
        to_year: '2021',
      },
      {
        place_id: 'ChIJy9QERoAFR0YRAnMwI2eEV8Q',
        ongoing: false,
        to_year: '2020',
        to_month: 'Dec',
        role: 'Chef de Partie',
        from_year: '2020',
        from_month: 'May',
        responsibilities:
          'Managed the hot section in a high-volume kitchen serving over 1,000 covers daily. Assisted with ordering, training junior staff, and ensuring efficient service, while maintaining high culinary standards in a fast-paced environment.',
      },
      {
        from_month: 'May',
        from_year: '2014',
        place_id: 'ChIJfQbcFs5C2EcRfPr8IZUWn6g',
        to_year: '2018',
        ongoing: false,
        to_month: 'Jun',
        role: 'Head Chef',
        responsibilities:
          'Opened and led the kitchen, growing revenue from £4,000 to £15,000 weekly. Managed menu writing, costing, staff training, and private dining for high-profile clients in the horse racing industry, while overseeing large-scale events for up to 700 guests.',
      },
    ],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
  {
    id: 'OnLDg1ZcGqh30aaopCZggBIyhbS2',
    job_title: 'Sous Chef',
    summary:
      'Sous Chef with extensive international experience in hotels and restaurants, covering à la carte, banqueting, and high-volume service.',
    bio:
      'Sous Chef with a long career across Switzerland, Portugal, and international hotels. Experienced in kitchen leadership, menu execution, staff supervision, and maintaining quality and hygiene standards in demanding environments.',
    image: '',
    positions: ['Sous Chef', 'Chef de Partie', 'Cook'],
    relevant_experience: [
      {
        from_year: '2020',
        responsibilities:
          'Managing kitchen operations, menu development, hygiene standards, team leadership, and workflow efficiency.',
        to_month: null,
        place_id: 'ChIJcUsl4xejj0cRbug8Ds7VHNc',
        role: 'Sous Chef',
        ongoing: true,
        from_month: 'Jun',
        to_year: null,
      },
      {
        from_month: 'Apr',
        place_id: 'ChIJQzGAsJCkj0cRJZIIj0XoBqA',
        responsibilities:
          'Overseeing à la carte and banquet service, kitchen organization, staff training, inventory management, and quality control.',
        ongoing: true,
        role: 'Sous Chef',
        to_month: null,
        to_year: null,
        from_year: '2019',
      },
      {
        role: 'Cook',
        from_year: '2017',
        from_month: 'Jun',
        ongoing: false,
        to_month: 'Oct',
        responsibilities:
          'Garde Manger and Entremetier, preparing cold dishes, managing ingredients, maintaining hygiene, and service prep.',
        to_year: '2018',
        place_id: 'ChIJGZLquf6bj0cRgf5eaOtK7PY',
      },
      {
        to_year: '2016',
        from_year: '2015',
        to_month: 'Mar',
        ongoing: false,
        place_id: 'ChIJTeUywPmbj0cR-wT2hmyQaUM',
        responsibilities:
          'Sous Chef overseeing Swiss cuisine, menu planning, kitchen operations, team supervision, and inventory management.',
        role: 'Chef de Partie',
        from_month: 'Dec',
      },
      {
        from_month: 'Jun',
        to_year: '2006',
        role: 'Chef de Partie',
        responsibilities:
          'At Hotel Allalin in Saas-Fee, I served as Chef de Partie, specializing in Entremetier, Saucier, and Garde-Manger roles. My responsibilities included preparing hot appetizers, sauces, and cold dishes, managing ingredient inventory, and ensuring adherence to hygiene standards. I also assisted in banquet preparations and collaborated with the kitchen team to maintain high culinary standards.',
        place_id: 'ChIJ5_TdZKNFj0cRunmn1AAOhAM',
        from_year: '2006',
        to_month: 'Aug',
        ongoing: false,
      },
      {
        place_id: 'ChIJGZLquf6bj0cRgf5eaOtK7PY',
        to_year: '2015',
        role: null,
        to_month: 'Apr',
        ongoing: false,
        from_year: '2013',
        from_month: 'Dec',
        responsibilities:
          'At Berghaus Männlichen, I served as Chef de Partie, focusing on Garde Manger and Entremetier stations. My responsibilities included preparing cold dishes and hot appetizers, managing ingredient inventory, maintaining hygiene standards, and ensuring timely service preparation. I collaborated closely with the kitchen team to deliver high-quality Swiss and international cuisine to guests.',
      },
      {
        from_year: '2013',
        from_month: 'Jun',
        to_month: 'Nov',
        to_year: '2013',
        responsibilities:
          'At Landhotel Golf in Unterseen, I worked as a Commis de Cuisine, handling Garde Manger, Entremetier, and Pâtisserie stations. My duties included preparing cold dishes, hot appetizers, and desserts, managing ingredient inventory, and maintaining hygiene standards. I collaborated with the kitchen team to deliver high-quality Swiss and Italian cuisine to our guests.',
        place_id: 'ChIJHxvMffqkj0cR7zCUD5KfxXc',
        ongoing: false,
        role: 'Commis de Cuisine',
      },
      {
        to_year: null,
        from_year: '2012',
        from_month: 'Jun',
        responsibilities:
          'At Hotel da Estrela in Lisbon, I served as Chef de Partie, focusing on Entremetier and Saucier roles. My responsibilities included preparing hot appetizers and sauces, managing ingredient inventory, and maintaining strict hygiene standards. I collaborated closely with the kitchen team to deliver high-quality Portuguese and international cuisine to our guests.',
        ongoing: true,
        to_month: null,
        place_id: 'ChIJXdh4fWQzGQ0RMxS3c5Nua04',
        role: 'Chef de Partie',
      },
      {
        to_month: 'Jun',
        responsibilities:
          'At Hotel Real Palácio in Lisbon, I served as Chef de Partie, focusing on Entremetier and Saucier roles. My responsibilities included preparing hot appetizers and sauces, managing ingredient inventory, and maintaining strict hygiene standards. I collaborated closely with the kitchen team to deliver high-quality Portuguese and international cuisine to our guests.',
        from_month: 'Jul',
        role: 'Chef de Partie (Tournant)',
        from_year: '2007',
        to_year: '2012',
        place_id: 'ChIJswCZ5HQzGQ0REazzU1ROadQ',
        ongoing: false,
      },
      {
        to_year: '2010',
        responsibilities:
          'At the Four Seasons Hotel Ritz Lisbon, I completed an apprenticeship, focusing on both banquet and à la carte services. My responsibilities included assisting in the preparation of high-quality dishes, learning various cooking techniques, and maintaining strict hygiene standards. This experience provided me with a solid foundation in luxury hospitality and refined my skills in delivering exceptional culinary experiences.',
        from_month: 'Jun',
        place_id: 'ChIJ-x5EtnEzGQ0R8am5BtQUOLs',
        ongoing: false,
        from_year: '2010',
        role: 'Apprentice',
        to_month: 'Aug',
      },
    ],
    other_experience: [],
    languages: [
      { language: 'English', proficiency: 'C1' },
      { language: 'Spanish', proficiency: 'B1' },
      { language: 'French', proficiency: 'B1' },
      { language: 'German', proficiency: 'B1' },
    ],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
  {
    id: 'WShQtlmVVVdqajd9muSHBLnm9kD2',
    job_title: '',
    summary: '',
    bio: '',
    image: '',
    positions: [],
    relevant_experience: [],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
  {
    id: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
    job_title: 'Chef de Partie',
    summary:
      'Chef with experience in Switzerland and the UK, combining relief kitchen work with building Misebox for hospitality recruitment.',
    bio:
      'Chef de Partie with broad experience across Swiss hospitality, seasonal relief work, and kitchen leadership. Also builds Misebox, a recruiting platform for hospitality, alongside freelance kitchen work.',
    image: '',
    positions: ['Chef de Partie', 'Sous Chef', 'Head Chef', 'Relief Chef'],
    relevant_experience: [
      {
        from_year: '2024',
        to_year: null,
        place_id: 'ChIJ0UF6GPmvj0cR__jYKy-J8pE',
        role: 'Aushilfe',
        from_month: 'Nov',
        to_month: null,
        ongoing: true,
        responsibilities:
          'Supporting the kitchen during a busy winter season, managing both buffet and à la carte service while ensuring high standards for fresh, locally sourced ingredients. Provided service in Swiss German and French, catering to a diverse customer base in a high-demand Swiss resort setting.',
      },
      {
        place_id: 'ChIJEbkWR0ijj0cRiHfShuHPLcc',
        from_month: 'Apr',
        from_year: '2023',
        to_month: 'Sep',
        to_year: '2023',
        ongoing: false,
        role: 'Lead Cook',
        responsibilities:
          "Lead Cook at Restaurant Bären. Managed stock and supplies, prepared à la carte and table d'hôte menus, created specials, and supported the team during busy periods.",
      },
      {
        from_year: '2019',
        to_year: null,
        place_id: 'ChIJWS2cLEkKkEcRPkeZB6EcnLk',
        role: 'Agent',
        from_month: 'November',
        to_month: null,
        ongoing: true,
        responsibilities:
          'Flexible kitchen support through Coople across hotels, events, and restaurants; roles from Chef de Partie to Sous Chef.',
      },
      {
        from_year: '2023',
        to_year: null,
        place_id: 'ChIJt0ko0AmgmkcRZJMyt51zAUg',
        role: 'Agent',
        from_month: 'April',
        to_month: null,
        ongoing: true,
        responsibilities:
          'Flexible kitchen support through Adia; adapting quickly across teams and service styles.',
      },
      {
        from_year: '2015',
        to_year: '2017',
        place_id: 'ChIJJRK8XSeue0gRAvddTH8ORtQ',
        role: 'Head Chef / Franchisee',
        from_month: 'May',
        to_month: 'May',
        ongoing: false,
        responsibilities: 'Managing the place.',
      },
    ],
    other_experience: [
      {
        from_year: '2022',
        to_year: null,
        place_id: 'ChIJM3aUezGjj0cRm9qzSb-cUao',
        role: 'Application Developer',
        from_month: 'Sep',
        to_month: null,
        ongoing: true,
        responsibilities:
          'Developing Misebox: product design, Firebase integration, UX refinement, and industry networking for a hospitality recruiting platform.',
      },
    ],
    languages: [
      { language: 'German', proficiency: 'B1' },
      { language: 'English', proficiency: 'Native' },
      { language: 'French', proficiency: 'A1' },
    ],
    certifications: [
      {
        name: 'Level 3 Supervising Food Safety in Catering',
        place_name: 'High Speed Training',
        year: '2019',
        document_url:
          'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/professionals%2FjMK33p5XlhYS8rBCEf8qUiogfMg2%2Fcertifications%2FDaniel%20Watson-Level%203%20Award%20in%20Supervising%20Food%20Safety%20in%20Catering.pdf?alt=media&token=449b552c-e600-4039-8357-4fc52dd3a7d4',
        image_url:
          'https://www.google.com/s2/favicons?sz=128&domain=highspeedtraining.co.uk',
        formatted_address: 'Riverside business park, Dansk Way, Ilkley LS29 8JZ, UK',
      },
    ],
    education: [
      {
        institution: 'Manchester Metropolitan University',
        degree: 'International Food Management',
        start_year: '2011',
        end_year: '2012',
        ongoing: false,
        document_url:
          'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/professionals%2FjMK33p5XlhYS8rBCEf8qUiogfMg2%2Feducation%2FCertificate%20-%20MMU.pdf?alt=media&token=e05334e6-512d-44ca-b7cb-e1761d525a27',
        image_url: 'https://www.google.com/s2/favicons?sz=128&domain=mmu.ac.uk',
        formatted_address: 'Ormond, Lower Ormond St, Manchester M15 6BX, UK',
      },
      {
        institution: 'University of Chester',
        degree: 'Business Information Systems',
        start_year: '2003',
        end_year: '2006',
        ongoing: false,
        document_url:
          'https://firebasestorage.googleapis.com/v0/b/misebox-78f9c.appspot.com/o/professionals%2FjMK33p5XlhYS8rBCEf8qUiogfMg2%2Feducation%2FCertificate%20-%20Chester.pdf?alt=media&token=40726cb8-cd2e-48db-ba5a-41fcb20a7c63',
        image_url: 'https://www.google.com/s2/favicons?sz=128&domain=chester.ac.uk',
        formatted_address: 'Parkgate Rd, Chester CH1 4BJ, UK',
      },
    ],
    volunteering: [
      {
        organization: 'Marraude Mentality',
        role: 'Cooking',
        from_year: '2024',
        to_year: '2024',
        ongoing: false,
        responsibilities:
          'Cooking for the homeless in Marseille; preparing food, coordinating distribution, and maintaining hygiene standards.',
      },
    ],
    projects: [
      {
        name: 'Misebox',
        role: 'Application Developer, Cook',
        from_year: '2022',
        to_year: null,
        ongoing: true,
        responsibilities:
          'Building Misebox (hospitality recruitment platform): design, coding, Firebase integration, UX, and go-to-market.',
      },
    ],
  },
  {
    id: 'rEssOnUA8wVHdNKE2JETqWAdwdm1',
    job_title: 'Kitchen Cleaner',
    summary:
      'Kitchen and service area cleaner with experience maintaining hygiene standards in hospitality environments.',
    bio:
      'Worked as a kitchen and service area cleaner, responsible for dishwashing, deep cleaning, and maintaining hygiene standards in busy hospitality settings.',
    image: '',
    positions: ['Kitchen Cleaner'],
    relevant_experience: [
      {
        role: 'Kitchen Cleaner',
        from_year: '2021',
        to_year: '2022',
        from_month: 'Mar',
        to_month: 'Mar',
        ongoing: false,
        place_id: 'ChIJ84hrmh6lj0cRoczGWuTvTtE',
        responsibilities:
          'Ensured high hygiene standards through thorough cleaning, dishwashing, and maintenance.',
      },
    ],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
  {
    id: 's9hKBxO7mJSFC5vHNOo3mt9Dgi42',
    job_title: 'Head Chef',
    summary:
      'Head Chef with experience leading teams in hotels and restaurants, including fine dining and seasonal resort kitchens.',
    bio:
      'Head Chef with experience managing kitchen teams, designing menus, and delivering consistent service in hotels, restaurants, and resort environments. Background includes sous chef and freelance roles supporting high-volume operations.',
    image: '',
    positions: ['Head Chef', 'Sous Chef', 'Freelance Sous Chef'],
    relevant_experience: [
      {
        role: 'HeadChef',
        from_year: '2022',
        to_year: '2023',
        from_month: 'Oct',
        to_month: 'Mar',
        ongoing: false,
        place_id: 'ChIJd5U3YbF0iUcR-oLtm9B0M5Y',
        responsibilities:
          'Designed and executed a rotating three-course evening menu for 100 guests daily. Led a team of four chefs, managed kitchen operations, ensured high hygiene standards, and maintained efficiency in a busy ski resort environment.',
      },
      {
        role: 'Freelance Sous Chef',
        from_year: '2022',
        to_year: '2022',
        from_month: 'Mar',
        to_month: 'Sep',
        ongoing: false,
        place_id: 'ChIJ5a7zI4yZb0gREnXFLyK2efw',
        responsibilities:
          'Worked alongside the Head Chef to develop and implement the summer menu. Managed high-volume service, preparing 400-700 covers daily while ensuring smooth kitchen operations and maintaining quality standards.',
      },
      {
        role: 'Sous Chef',
        from_year: '2020',
        to_year: '2020',
        from_month: 'Jun',
        to_month: 'Dec',
        ongoing: false,
        place_id: 'ChIJW24UWZEFR0YRLz8DJUFmfes',
        responsibilities:
          'Led the kitchen in executing a six-course tasting menu, managed a team of six chefs, and oversaw high-end events. Created new dishes and maintained hygiene standards.',
      },
      {
        role: 'Head Chef',
        from_year: '2018',
        to_year: '2019',
        from_month: 'Mar',
        to_month: 'Jul',
        ongoing: false,
        place_id: 'ChIJoVol0XW33kcRzlGVA086YZc',
        responsibilities:
          'Launched fine dining, banqueting, and wedding menus; managed a 60-cover restaurant, hotel, and lodges; led a team of seven chefs; maintained a continuous 5-star EHO rating.',
      },
    ],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
  {
    id: 'xdu83J77YeOROlePJdibPekxkDp2',
    job_title: 'Sous Chef',
    summary: 'Sous Chef with experience in Swiss hospitality, including kitchen leadership and support roles.',
    bio: 'Sous Chef with experience in hospitality kitchens, supporting service, prep, hygiene standards, and team coordination.',
    image: '',
    positions: ['Sous Chef', 'Koch (Chef de Partie)', 'Küchenchef'],
    relevant_experience: [],
    other_experience: [],
    languages: [],
    certifications: [],
    education: [],
    volunteering: [],
    projects: [],
  },
]
