#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const COPY_PACK_ID = 'public-menu'
const SYSTEM_ACTOR = 'system:seed-public-menu-copy-packs'

const PUBLIC_MENU_LABELS = {
  de: {
    menus: 'Menüs',
    chooseMenu: 'Menü auswählen',
    openMenus: 'Menüs öffnen',
    openMenu: 'Menü öffnen',
    loadingMenus: 'Menüs werden geladen...',
    noMenusAvailable: 'Keine Menüs verfügbar',
    noPublicMenus: 'Diese Küche hat noch keine öffentlichen Menüs.',
    loadingMenu: 'Menü wird geladen...',
    kitchenNotFound: 'Küche nicht gefunden',
    menuNotFound: 'Menü nicht gefunden',
    noSectionsFound: 'Keine Bereiche gefunden',
    menuJson: 'Menü JSON',
    section: 'Bereich',
    sections: 'Bereiche',
    dish: 'Gericht',
    dishes: 'Gerichte',
  },
  en: {
    menus: 'Menus',
    chooseMenu: 'Choose a menu',
    openMenus: 'Open menus',
    openMenu: 'Open menu',
    loadingMenus: 'Loading menus...',
    noMenusAvailable: 'No menus available',
    noPublicMenus: 'This kitchen does not have public menus available yet.',
    loadingMenu: 'Loading menu...',
    kitchenNotFound: 'Kitchen not found',
    menuNotFound: 'Menu not found',
    noSectionsFound: 'No sections found',
    menuJson: 'Menu JSON',
    section: 'section',
    sections: 'sections',
    dish: 'dish',
    dishes: 'dishes',
  },
  it: {
    menus: 'Menu',
    chooseMenu: 'Scegli un menu',
    openMenus: 'Apri i menu',
    openMenu: 'Apri il menu',
    loadingMenus: 'Caricamento dei menu...',
    noMenusAvailable: 'Nessun menu disponibile',
    noPublicMenus: 'Questo ristorante non ha ancora menu pubblici disponibili.',
    loadingMenu: 'Caricamento del menu...',
    kitchenNotFound: 'Ristorante non trovato',
    menuNotFound: 'Menu non trovato',
    noSectionsFound: 'Nessuna sezione trovata',
    menuJson: 'Menu JSON',
    section: 'sezione',
    sections: 'sezioni',
    dish: 'piatto',
    dishes: 'piatti',
  },
  fr: {
    menus: 'Menus',
    chooseMenu: 'Choisir un menu',
    openMenus: 'Ouvrir les menus',
    openMenu: 'Ouvrir le menu',
    loadingMenus: 'Chargement des menus...',
    noMenusAvailable: 'Aucun menu disponible',
    noPublicMenus: 'Cette cuisine n’a pas encore de menus publics.',
    loadingMenu: 'Chargement du menu...',
    kitchenNotFound: 'Cuisine introuvable',
    menuNotFound: 'Menu introuvable',
    noSectionsFound: 'Aucune section trouvée',
    menuJson: 'Menu JSON',
    section: 'section',
    sections: 'sections',
    dish: 'plat',
    dishes: 'plats',
  },
  es: {
    menus: 'Menús',
    chooseMenu: 'Elige un menú',
    openMenus: 'Abrir menús',
    openMenu: 'Abrir menú',
    loadingMenus: 'Cargando menús...',
    noMenusAvailable: 'No hay menús disponibles',
    noPublicMenus: 'Este restaurante aún no tiene menús públicos disponibles.',
    loadingMenu: 'Cargando menú...',
    kitchenNotFound: 'Restaurante no encontrado',
    menuNotFound: 'Menú no encontrado',
    noSectionsFound: 'No se encontraron secciones',
    menuJson: 'Menu JSON',
    section: 'sección',
    sections: 'secciones',
    dish: 'plato',
    dishes: 'platos',
  },
  pt: {
    menus: 'Menus',
    chooseMenu: 'Escolha um menu',
    openMenus: 'Abrir menus',
    openMenu: 'Abrir menu',
    loadingMenus: 'A carregar menus...',
    noMenusAvailable: 'Nenhum menu disponível',
    noPublicMenus: 'Este restaurante ainda não tem menus públicos disponíveis.',
    loadingMenu: 'A carregar menu...',
    kitchenNotFound: 'Restaurante não encontrado',
    menuNotFound: 'Menu não encontrado',
    noSectionsFound: 'Nenhuma secção encontrada',
    menuJson: 'Menu JSON',
    section: 'secção',
    sections: 'secções',
    dish: 'prato',
    dishes: 'pratos',
  },
  ar: {
    menus: 'القوائم',
    chooseMenu: 'اختر قائمة',
    openMenus: 'افتح القوائم',
    openMenu: 'افتح القائمة',
    loadingMenus: 'جاري تحميل القوائم...',
    noMenusAvailable: 'لا توجد قوائم متاحة',
    noPublicMenus: 'لا توجد قوائم عامة متاحة لهذا المطعم بعد.',
    loadingMenu: 'جاري تحميل القائمة...',
    kitchenNotFound: 'لم يتم العثور على المطعم',
    menuNotFound: 'لم يتم العثور على القائمة',
    noSectionsFound: 'لم يتم العثور على أقسام',
    menuJson: 'Menu JSON',
    section: 'قسم',
    sections: 'أقسام',
    dish: 'طبق',
    dishes: 'أطباق',
  },
  he: {
    menus: 'תפריטים',
    chooseMenu: 'בחרו תפריט',
    openMenus: 'פתחו תפריטים',
    openMenu: 'פתחו תפריט',
    loadingMenus: 'טוען תפריטים...',
    noMenusAvailable: 'אין תפריטים זמינים',
    noPublicMenus: 'למסעדה זו עדיין אין תפריטים ציבוריים.',
    loadingMenu: 'טוען תפריט...',
    kitchenNotFound: 'המסעדה לא נמצאה',
    menuNotFound: 'התפריט לא נמצא',
    noSectionsFound: 'לא נמצאו קטגוריות',
    menuJson: 'Menu JSON',
    section: 'קטגוריה',
    sections: 'קטגוריות',
    dish: 'מנה',
    dishes: 'מנות',
  },
  ko: {
    menus: '메뉴',
    chooseMenu: '메뉴 선택',
    openMenus: '메뉴 열기',
    openMenu: '메뉴 열기',
    loadingMenus: '메뉴를 불러오는 중...',
    noMenusAvailable: '이용 가능한 메뉴가 없습니다',
    noPublicMenus: '이 레스토랑에는 아직 공개 메뉴가 없습니다.',
    loadingMenu: '메뉴를 불러오는 중...',
    kitchenNotFound: '레스토랑을 찾을 수 없습니다',
    menuNotFound: '메뉴를 찾을 수 없습니다',
    noSectionsFound: '섹션을 찾을 수 없습니다',
    menuJson: 'Menu JSON',
    section: '섹션',
    sections: '섹션',
    dish: '요리',
    dishes: '요리',
  },
  ja: {
    menus: 'メニュー',
    chooseMenu: 'メニューを選択',
    openMenus: 'メニューを開く',
    openMenu: 'メニューを開く',
    loadingMenus: 'メニューを読み込み中...',
    noMenusAvailable: '利用可能なメニューはありません',
    noPublicMenus: 'このレストランにはまだ公開メニューがありません。',
    loadingMenu: 'メニューを読み込み中...',
    kitchenNotFound: 'レストランが見つかりません',
    menuNotFound: 'メニューが見つかりません',
    noSectionsFound: 'セクションが見つかりません',
    menuJson: 'Menu JSON',
    section: 'セクション',
    sections: 'セクション',
    dish: '料理',
    dishes: '料理',
  },
  bo: {
    menus: 'ཟས་ཐོ་',
    chooseMenu: 'ཟས་ཐོ་འདེམས་',
    openMenus: 'ཟས་ཐོ་ཁ་ཕྱེ་',
    openMenu: 'ཟས་ཐོ་ཁ་ཕྱེ་',
    loadingMenus: 'ཟས་ཐོ་འགེལ་བཞིན་ཡོད་...',
    noMenusAvailable: 'ཟས་ཐོ་མེད་',
    noPublicMenus: 'ཟ་ཁང་འདིར་ད་དུང་སྤྱི་སྤྱོད་ཟས་ཐོ་མེད།',
    loadingMenu: 'ཟས་ཐོ་འགེལ་བཞིན་ཡོད་...',
    kitchenNotFound: 'ཟ་ཁང་རྙེད་མ་སོང་',
    menuNotFound: 'ཟས་ཐོ་རྙེད་མ་སོང་',
    noSectionsFound: 'སྡེ་ཚན་རྙེད་མ་སོང་',
    menuJson: 'Menu JSON',
    section: 'སྡེ་ཚན་',
    sections: 'སྡེ་ཚན་',
    dish: 'ཟས་',
    dishes: 'ཟས་',
  },
}

const args = parseArgs(process.argv.slice(2))
const commit = Boolean(args.commit)
const projectId = String(args.project || DEFAULT_PROJECT_ID).trim()
const databaseId = String(args.database || DEFAULT_DATABASE_ID).trim()
const tenantAppId = String(args['tenant-app-id'] || '').trim()
const serviceAccountPath = resolveServiceAccountPath(
  String(args['service-account'] || DEFAULT_SERVICE_ACCOUNT_PATH).trim()
)

function resolveServiceAccountPath(input) {
  if (isAbsolute(input)) return input
  return resolve(process.cwd(), input)
}

async function readServiceAccount(path) {
  if (!existsSync(path)) {
    throw new Error(`Missing service account file at ${path}`)
  }

  return JSON.parse(await readFile(path, 'utf8'))
}

function docPathFor(language, appId = '') {
  if (appId) {
    return `apps/${appId}/copy_packs/${COPY_PACK_ID}/locales/${language}`
  }

  return `copy_packs/${COPY_PACK_ID}/locales/${language}`
}

function buildDoc(language, labels, scope) {
  return {
    pack_id: COPY_PACK_ID,
    locale: language,
    scope,
    labels,
    source: 'package-public-kitchen-language-migration',
    updated_by: SYSTEM_ACTOR,
    updated_at: FieldValue.serverTimestamp(),
  }
}

async function main() {
  const serviceAccount = await readServiceAccount(serviceAccountPath)
  const adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId,
  })
  const db = getFirestore(adminApp, databaseId)
  const targets = []

  for (const [language, labels] of Object.entries(PUBLIC_MENU_LABELS)) {
    targets.push({
      path: docPathFor(language),
      data: buildDoc(language, labels, 'ecosystem'),
    })

    if (tenantAppId) {
      targets.push({
        path: docPathFor(language, tenantAppId),
        data: buildDoc(language, labels, 'app'),
      })
    }
  }

  if (!commit) {
    console.log('[public-menu-copy-packs] dry run', {
      projectId,
      databaseId,
      serviceAccountPath,
      tenantAppId: tenantAppId || null,
      docs: targets.map((target) => target.path),
      apply: `node scripts/seed-public-menu-copy-packs.mjs --commit${
        tenantAppId ? ` --tenant-app-id ${tenantAppId}` : ''
      }`,
    })
    return
  }

  const batch = db.batch()
  for (const target of targets) {
    batch.set(db.doc(target.path), target.data, { merge: true })
  }

  await batch.commit()

  console.log('[public-menu-copy-packs] written', {
    projectId,
    databaseId,
    tenantAppId: tenantAppId || null,
    docsWritten: targets.length,
    docs: targets.map((target) => target.path),
  })
}

main().catch((error) => {
  console.error('[public-menu-copy-packs] failed', {
    message: error instanceof Error ? error.message : String(error),
  })
  process.exit(1)
})
