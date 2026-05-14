#!/usr/bin/env node
/*
  Seed Sproochli translations for the BuenoHost Holiday with Nats guest guide.

  Canon:
  - BuenoHost owns the guest-guide source document.
  - Sproochli owns translated versions keyed by source document identity.
  - Only translations with status="published" appear through the public availability API.

  Usage:
    node scripts/seed-sproochli-buenohost-nats-translations.mjs
    node scripts/seed-sproochli-buenohost-nats-translations.mjs --commit
*/

import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, initializeApp } from 'firebase-admin/app'
import { Timestamp, getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-fireux/src/config/firebase/service-account.json'
const PROJECT_ID = 'fireux-2005'
const DATABASE_ID = 'sproochli'
const ACTOR = 'system:seed-sproochli-buenohost-nats-translations'

const documentRef = {
  source_app: 'buenohost',
  document_type: 'bnb-guide',
  document_slug: 'holiday-with-nats',
  source_language: 'en',
}

const sectionOrder = [
  'welcome',
  'emergency',
  'wifi',
  'house-rules',
  'checkout',
  'heating-cooling',
  'keys',
  'parking',
  'rubbish-recycling',
  'apartment-info',
  'local-information',
  'bike-rentals',
  'grocery-shopping',
  'transport',
]

const translations = {
  de: {
    label: 'German',
    native_label: 'Deutsch',
    direction: 'ltr',
    title: 'Urlaub mit Nats',
    guest_message: {
      title: 'Willkommen, Familie Watson',
      subtitle: 'Heute - 27. Marz',
    },
    property: {
      name: 'Penthouse-Ferienwohnung',
      type: 'BNB / Gastehandbuch',
      manager: 'Apartment-Managerin Natalie',
      address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
    },
    privacy_note:
      'Lokaler Proof-Inhalt aus dem Quellhandbuch. Telefonnummer und E-Mail sollten vor einer offentlichen Veroffentlichung bestatigt werden.',
    footer: 'Powered by BuenoHost.',
    sections: {
      welcome: {
        title: 'Willkommen',
        summary: 'Ein kurzer Willkommensgruss und die wichtigsten Kontaktdaten fur Ihren Aufenthalt.',
        items: [
          { value: 'Willkommen in der Penthouse-Ferienwohnung.' },
          { label: 'Apartment-Managerin', value: 'Natalie' },
          { label: 'Telefon', value: '+41 78 604 69 00' },
          { label: 'E-Mail', value: 'bookwithnats@gmail.com' },
          { label: 'Adresse', value: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken' },
        ],
      },
      emergency: {
        title: 'Notfall',
        summary: 'Notfallausrustung, medizinische Kontakte und wichtige Telefonnummern.',
        items: [
          { value: 'Die Wohnung ist mit Rauchmeldern ausgestattet.' },
          { value: 'Feuerloscher: beim Haupteingang unten.' },
          { value: 'Erste-Hilfe-Set: Kuchenschublade rechts neben der Mikrowelle.' },
          { value: 'Loschdecke: Kuchenschrank unter dem Spulbecken.' },
          { label: 'Polizei', value: '117' },
          { label: 'Feuerwehr', value: '118' },
          { label: 'Ambulanz', value: '144' },
          { label: 'Helikopterrettung', value: '1414' },
          { label: 'Spital Interlaken', value: '+41 (0) 33 826 25 00' },
          { label: 'Bahnhof Taxi', value: '+41 (0) 33 822 50 50' },
          { label: 'A Taxi', value: '+41 (0) 33 822 60 60' },
          { value: 'Walk-in-Praxis: Bahnhof Interlaken West, Bahnhofstrasse 28, 3800 Interlaken.' },
          { value: 'Der HANI-Notfall befindet sich im Spital Interlaken.' },
        ],
      },
      wifi: {
        title: 'WLAN',
        summary: 'Internetzugang fur Gaste.',
        items: [
          { label: 'Netzwerk', value: 'Penthouse' },
          { label: 'Passwort', value: 'penthouse2020' },
        ],
      },
      'house-rules': {
        title: 'Hausregeln',
        summary: 'Einfache Regeln zum Schutz der Wohnung und aus Rucksicht auf die Nachbarn.',
        items: [
          { value: 'Bitte schliessen Sie alle Fenster und Turen, bevor Sie ausgehen.' },
          { value: 'Wasserschaden durch Regen konnen verrechnet werden.' },
          { value: 'Die Badezimmer sind keine Nasszellen; bitte Wasser vom Boden aufwischen.' },
          { value: 'Bitte nicht im Bett oder auf dem Sofa essen.' },
          { value: 'Bitte nehmen Sie Rucksicht auf die Nachbarn.' },
          { value: 'Keine lauten Gerausche nach 22:00 Uhr.' },
          { value: 'Bitte verlassen Sie den Balkon bis 22:00 Uhr, da sich Larm stark ubertragt.' },
          { value: 'Dies ist eine Nichtraucherwohnung.' },
          { value: 'Rauchen ist nur auf dem Balkon erlaubt. Bitte benutzen Sie den Aschenbecher.' },
        ],
      },
      checkout: {
        title: 'Abreise',
        summary: 'Was vor dem Verlassen der Wohnung zu erledigen ist.',
        items: [
          { value: 'Check-out bis 10:00 Uhr, sofern nichts anderes vereinbart wurde.' },
          { value: 'Bitte restliches Geschirr in den Geschirrspuler stellen und das Reinigungsprogramm starten.' },
          { value: 'Bitte legen Sie den Schlussel dorthin zuruck, wo Sie ihn gefunden haben.' },
          { value: 'Zusatzliche Reinigung oder Schaden durch Nachlassigkeit konnen verrechnet werden.' },
        ],
      },
      'heating-cooling': {
        title: 'Heizung & Klima',
        summary: 'So nutzen Sie die Heizkorper verantwortungsvoll.',
        items: [
          { value: 'Die Heizkorper haben Regler von 1 bis 5.' },
          { value: 'Bitte die Heizung nicht hoch aufdrehen und gleichzeitig die Fenster offnen.' },
          { value: 'Bitte schalten Sie die Heizung bei der Abreise aus.' },
        ],
      },
      keys: {
        title: 'Schlussel & Zugang',
        summary: 'Anleitung zur Schlusselbox fur Ausfluge und Abreise.',
        items: [
          { value: 'Die Schlusselbox kann benutzt werden, wenn Sie ausgehen.' },
          { label: 'Code', value: '2020' },
          { value: 'Bitte andern Sie den Code niemals.' },
        ],
      },
      parking: {
        title: 'Parkieren',
        summary: 'Informationen zu Parkplatzen und Besucherparkplatzen.',
        items: [
          { value: 'Eine Tiefgarage ist verfugbar.' },
          { value: 'Bitte lassen Sie den Automotor nicht unnotig laufen.' },
          { value: 'Kurzzeit-Besucherparkplatze befinden sich rechts vom Haupteingang.' },
        ],
      },
      'rubbish-recycling': {
        title: 'Abfall & Recycling',
        summary: 'So entsorgen Sie Recycling und normalen Haushaltsabfall.',
        items: [
          { value: 'Der Recyclingbehalter befindet sich auf dem Balkon.' },
          { value: 'Karton kann ins Recycling gegeben werden.' },
          { value: 'Bitte keinen normalen Abfall dort hineinwerfen.' },
          { value: 'Keine Lebensmittelbehalter.' },
          { value: 'Bitte verwenden Sie die weissen AVAG-Sacke unter dem Spulbecken.' },
          { value: 'Volle Sacke kommen in den grauen Container draussen beim Besucherparkplatz.' },
          { value: 'Benutzen Sie den Schlussel, um das Vorhangeschloss zu offnen.' },
          { value: 'Nur weisse AVAG-Sacke durfen in den grossen Container.' },
        ],
      },
      'apartment-info': {
        title: 'Wohnungsinfo',
        summary: 'Nutzliche Informationen zur Ausstattung der Wohnung.',
        items: [
          { value: 'USB-Ladegerate sind vorhanden; bitte installierte Ladegerate nicht mitnehmen oder umplatzieren.' },
          { value: 'Geschirrspuler: Programm wahlen, Tab einlegen und Start drucken.' },
          { value: 'Niemals Abwaschmittel in den Geschirrspuler geben.' },
          { value: 'Spiele und Bucher sind vorhanden; bitte sorgsam behandeln.' },
          { value: 'Das Bugelbrett befindet sich auf dem Absatz zwischen den Schlafzimmern.' },
          { value: 'Das Leitungswasser ist zu 100% trinkbar.' },
          { value: 'Kabel-TV und DVDs sind vorhanden.' },
        ],
      },
      'local-information': {
        title: 'Lokale Informationen',
        summary: 'Nahegelegene Geschafte, Post und Bushaltestelle.',
        items: [
          { value: 'Der CO-OP-Supermarkt befindet sich unten und ist Mo-So 08:00-20:00 geoffnet.' },
          { value: 'Die Post befindet sich im CO-OP.' },
          { value: 'Lidl ist taglich von 08:00-21:00 geoffnet.' },
          { value: 'Die Bushaltestelle liegt an der Hauptstrasse beim Restaurant Tells.' },
          { value: 'Fur lokale Verbindungen nutzen Sie die Busse 104 und 105.' },
        ],
      },
      'bike-rentals': {
        title: 'Velo-Verleih',
        summary: 'Velo- und Aktivitatsvermietung in der Nahe.',
        items: [
          { value: 'Amacher Bike Shop vermietet E-Bikes.' },
          { value: 'Daniels Fun Rentals bietet Mountainbikes, Scooter, ATVs, Funcars, E-Bikeboards und Quads an.' },
        ],
      },
      'grocery-shopping': {
        title: 'Lebensmitteleinkauf',
        summary: 'Einfache Einkaufsmoglichkeiten rund um die Wohnung.',
        items: [
          { value: 'Der CO-OP-Supermarkt unten eignet sich fur den taglichen Einkauf.' },
          { value: 'Lidl ist in der Nahe und taglich von 08:00-21:00 geoffnet.' },
          { value: 'Bitte bringen Sie Einkaufe direkt in die Wohnung und halten Sie Gemeinschaftsbereiche frei.' },
        ],
      },
      transport: {
        title: 'Transport',
        summary: 'Einfache Wegbeschreibungen und Hinweise zum offentlichen Verkehr.',
        items: [
          { label: 'Interlaken West', value: 'Gehen Sie vom Hobachergassli zur Hauptstrasse, weiter Richtung Zentrum Interlaken und folgen Sie den Schildern zum Bahnhof Interlaken West.' },
          { label: 'Interlaken Ost', value: 'Gehen Sie zur Hauptstrasse und weiter ostwarts durch Interlaken, oder nehmen Sie eine lokale Busverbindung Richtung Interlaken Ost.' },
          { value: 'Die Details zu Bus 104/105 sollten mit dem aktuellen Fahrplan bestatigt werden.' },
        ],
      },
    },
  },
  fr: {
    label: 'French',
    native_label: 'Francais',
    direction: 'ltr',
    title: 'Vacances avec Nats',
    guest_message: {
      title: 'Bienvenue, famille Watson',
      subtitle: 'Aujourd hui - 27 mars',
    },
    property: {
      name: 'Appartement de vacances penthouse',
      type: 'BNB / guide invite',
      manager: 'Gestionnaire de l appartement Natalie',
      address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
    },
    privacy_note:
      'Contenu de preuve local provenant du manuel source. Le telephone et l e-mail doivent etre confirmes avant toute publication publique.',
    footer: 'Propulse par BuenoHost.',
    sections: {
      welcome: {
        title: 'Bienvenue',
        summary: 'Un court message de bienvenue et les coordonnees importantes pour votre sejour.',
        items: [
          { value: 'Bienvenue dans l appartement de vacances penthouse.' },
          { label: 'Gestionnaire de l appartement', value: 'Natalie' },
          { label: 'Telephone', value: '+41 78 604 69 00' },
          { label: 'E-mail', value: 'bookwithnats@gmail.com' },
          { label: 'Adresse', value: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken' },
        ],
      },
      emergency: {
        title: 'Urgence',
        summary: 'Equipement d urgence, contacts medicaux et numeros importants.',
        items: [
          { value: 'L appartement est equipe de detecteurs de fumee.' },
          { value: 'Extincteur: pres de l entree principale en bas.' },
          { value: 'Trousse de premiers secours: tiroir de cuisine a droite du micro-ondes.' },
          { value: 'Couverture anti-feu: placard de cuisine sous l evier.' },
          { label: 'Police', value: '117' },
          { label: 'Pompiers', value: '118' },
          { label: 'Ambulance', value: '144' },
          { label: 'Sauvetage par helicoptere', value: '1414' },
          { label: 'Hopital d Interlaken', value: '+41 (0) 33 826 25 00' },
          { label: 'Bahnhof Taxi', value: '+41 (0) 33 822 50 50' },
          { label: 'A Taxi', value: '+41 (0) 33 822 60 60' },
          { value: 'Clinique sans rendez-vous: gare d Interlaken West, Bahnhofstrasse 28, 3800 Interlaken.' },
          { value: 'Le service d urgence HANI est disponible a l hopital d Interlaken.' },
        ],
      },
      wifi: {
        title: 'Wi-Fi',
        summary: 'Acces Internet pour les invites.',
        items: [
          { label: 'Reseau', value: 'Penthouse' },
          { label: 'Mot de passe', value: 'penthouse2020' },
        ],
      },
      'house-rules': {
        title: 'Regles de la maison',
        summary: 'Regles simples pour proteger l appartement et respecter les voisins.',
        items: [
          { value: 'Fermez toutes les fenetres et les portes avant de sortir.' },
          { value: 'Les degats des eaux causes par la pluie peuvent etre factures.' },
          { value: 'Les salles de bain ne sont pas des pieces d eau; essuyez l eau sur le sol.' },
          { value: 'Ne mangez pas dans le lit ni sur le canape.' },
          { value: 'Merci de respecter les voisins.' },
          { value: 'Pas de bruit fort apres 22:00.' },
          { value: 'Quittez le balcon avant 22:00, car le bruit porte facilement.' },
          { value: 'L appartement est non-fumeur.' },
          { value: 'Il est permis de fumer uniquement sur le balcon. Merci d utiliser le cendrier.' },
        ],
      },
      checkout: {
        title: 'Depart',
        summary: 'Ce qu il faut faire avant de quitter l appartement.',
        items: [
          { value: 'Depart avant 10:00, sauf accord contraire.' },
          { value: 'Placez la vaisselle restante dans le lave-vaisselle et lancez le cycle de nettoyage.' },
          { value: 'Remettez la cle a l endroit ou vous l avez trouvee.' },
          { value: 'Un nettoyage supplementaire ou des dommages dus a une negligence peuvent etre factures.' },
        ],
      },
      'heating-cooling': {
        title: 'Chauffage & climatisation',
        summary: 'Comment utiliser les radiateurs de facon responsable.',
        items: [
          { value: 'Les radiateurs ont des reglages de 1 a 5.' },
          { value: 'Ne mettez pas le chauffage au maximum en ouvrant les fenetres.' },
          { value: 'Eteignez le chauffage au depart.' },
        ],
      },
      keys: {
        title: 'Cles & acces',
        summary: 'Instructions pour le coffre a cles lorsque vous sortez ou partez.',
        items: [
          { value: 'Le coffre a cles peut etre utilise lorsque vous sortez.' },
          { label: 'Code', value: '2020' },
          { value: 'Ne changez jamais le code.' },
        ],
      },
      parking: {
        title: 'Parking',
        summary: 'Informations sur le parking et les places visiteurs.',
        items: [
          { value: 'Un parking souterrain est disponible.' },
          { value: 'Ne laissez pas tourner le moteur inutilement.' },
          { value: 'Le stationnement temporaire visiteurs se trouve a droite de l entree principale.' },
        ],
      },
      'rubbish-recycling': {
        title: 'Dechets & recyclage',
        summary: 'Comment recycler et jeter les dechets menagers.',
        items: [
          { value: 'Le conteneur de recyclage se trouve sur le balcon.' },
          { value: 'Le carton peut etre mis au recyclage.' },
          { value: 'Ne mettez pas les dechets menagers ordinaires dans ce conteneur.' },
          { value: 'Pas de contenants alimentaires.' },
          { value: 'Utilisez les sacs blancs AVAG fournis sous l evier.' },
          { value: 'Placez les sacs pleins dans le conteneur gris dehors, pres du parking visiteurs.' },
          { value: 'Utilisez la cle pour ouvrir le cadenas.' },
          { value: 'Seuls les sacs blancs AVAG peuvent aller dans le grand conteneur.' },
        ],
      },
      'apartment-info': {
        title: 'Infos appartement',
        summary: 'Informations utiles sur les equipements et installations.',
        items: [
          { value: 'Des chargeurs USB sont fournis; ne les emportez pas et ne deplacez pas les chargeurs installes.' },
          { value: 'Lave-vaisselle: choisissez un programme, ajoutez une tablette, puis appuyez sur Start.' },
          { value: 'Ne mettez jamais de liquide vaisselle dans le lave-vaisselle.' },
          { value: 'Des jeux et des livres sont disponibles; merci d en prendre soin.' },
          { value: 'La planche a repasser se trouve sur le palier entre les chambres.' },
          { value: 'L eau du robinet est potable a 100%.' },
          { value: 'La television cablee et des DVD sont disponibles.' },
        ],
      },
      'local-information': {
        title: 'Informations locales',
        summary: 'Magasins proches, poste et arret de bus.',
        items: [
          { value: 'Le supermarche CO-OP est en bas et ouvert lun-dim 08:00-20:00.' },
          { value: 'La poste se trouve dans le CO-OP.' },
          { value: 'Lidl est ouvert tous les jours de 08:00 a 21:00.' },
          { value: 'L arret de bus est sur la rue principale pres du restaurant Tells.' },
          { value: 'Utilisez les bus 104 et 105 pour les correspondances locales.' },
        ],
      },
      'bike-rentals': {
        title: 'Location de velos',
        summary: 'Options de location de velos et d activites a proximite.',
        items: [
          { value: 'Amacher Bike Shop loue des velos electriques.' },
          { value: 'Daniels Fun Rentals propose des VTT, scooters, ATVs, funcars, e-bikeboards et quads.' },
        ],
      },
      'grocery-shopping': {
        title: 'Courses alimentaires',
        summary: 'Options faciles pour faire vos courses autour de l appartement.',
        items: [
          { value: 'Le supermarche CO-OP en bas convient pour les courses quotidiennes.' },
          { value: 'Lidl est proche et ouvert tous les jours de 08:00 a 21:00.' },
          { value: 'Ramenez vos achats directement a l appartement et gardez les espaces communs degages.' },
        ],
      },
      transport: {
        title: 'Transport',
        summary: 'Directions simples a pied et indications de transport public.',
        items: [
          { label: 'Interlaken West', value: 'Depuis Hobachergassli, rejoignez la route principale, continuez vers le centre d Interlaken et suivez les panneaux pour la gare d Interlaken West.' },
          { label: 'Interlaken Ost', value: 'Allez vers la route principale et continuez vers l est a travers Interlaken, ou prenez un bus local vers Interlaken Ost.' },
          { value: 'Les details des bus 104/105 doivent etre verifies avec l horaire actuel.' },
        ],
      },
    },
  },
}

function normalizeString(value) {
  return String(value || '').trim()
}

function documentKey({ source_app: sourceApp, document_type: documentType, document_slug: documentSlug }) {
  return `${sourceApp}_${documentType}_${documentSlug}`.replace(/[^A-Za-z0-9_-]/g, '_')
}

async function loadServiceAccount(path) {
  const absolutePath = resolve(REPO_ROOT, path)
  const raw = await readFile(absolutePath, 'utf8')
  const parsed = JSON.parse(raw)

  return {
    credential: cert(parsed),
    clientEmail: parsed.client_email,
  }
}

function stamp(now) {
  return {
    at: now,
    by: ACTOR,
  }
}

function translationPatch(language, translation, now) {
  return {
    language,
    code: language,
    status: 'published',
    review_status: 'first_pass',
    label: translation.label,
    native_label: translation.native_label,
    direction: translation.direction,
    title: translation.title,
    guest_message: translation.guest_message,
    property: translation.property,
    privacy_note: translation.privacy_note,
    footer: translation.footer,
    section_order: sectionOrder,
    sections: translation.sections,
    updated: stamp(now),
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const commit = Boolean(args.commit)
  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : SERVICE_ACCOUNT_PATH
  const projectId =
    typeof args.project === 'string' ? normalizeString(args.project) : PROJECT_ID
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DATABASE_ID

  const serviceAccount = await loadServiceAccount(serviceAccountPath)
  const adminApp = initializeApp(
    {
      credential: serviceAccount.credential,
      projectId,
    },
    `seed-sproochli-buenohost-nats-translations-${Date.now()}`
  )
  const db = getFirestore(adminApp, databaseId)
  const now = Timestamp.now()
  const key = documentKey(documentRef)
  const documentDoc = db.collection('translation_documents').doc(key)
  const languageCodes = Object.keys(translations)

  const rootPatch = {
    id: key,
    ...documentRef,
    owner_app: 'buenohost',
    source_path: 'buenohost/properties/holiday-with-nats/guest_guides/guest-guide',
    status: 'active',
    available_languages: languageCodes,
    translation_count: languageCodes.length,
    updated: stamp(now),
  }

  const writes = [
    { ref: documentDoc, patch: rootPatch },
    ...languageCodes.map((language) => ({
      ref: documentDoc.collection('translations').doc(language),
      patch: translationPatch(language, translations[language], now),
    })),
  ]

  console.log('[seed] Sproochli BuenoHost Nats translations', {
    projectId,
    databaseId,
    commit,
    documentPath: documentDoc.path,
    languages: languageCodes,
    sectionsPerLanguage: sectionOrder.length,
    writes: writes.length,
  })

  for (const write of writes) {
    if (!commit) {
      console.log('[dry-run] set', write.ref.path, {
        ...write.patch,
        sections: write.patch.sections ? Object.keys(write.patch.sections) : undefined,
      })
      continue
    }

    await write.ref.set(write.patch, { merge: true })
    console.log('[write] set', write.ref.path)
  }

  console.log(commit ? '[done] wrote translations' : '[done] dry run only')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
