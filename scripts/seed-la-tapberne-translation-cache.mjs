#!/usr/bin/env node

import { cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from './_lib/args.mjs'

const DEFAULT_PROJECT_ID = 'misebox-78f9c'
const DEFAULT_SERVICE_ACCOUNT_PATH =
  'packages/ecosystem/fireux-misebox/src/config/firebase/service-account.json'
const DEFAULT_DATABASE_ID = 'misebox'
const DEFAULT_KITCHEN_COLLECTION_PATH = 'kitchens'
const KITCHEN_SLUG = 'la-tapberne'
const APP_ID = 'misebox-app'
const SYSTEM_ACTOR = 'system:seed-la-tapberne-translation-cache'
const DOMAIN = 'restaurant_menu'
const GLOSSARY_VERSION = 'restaurant_menu_v1'
const MENU_ID = 'main'
export const LA_TAPBERNE_ATTACHED_LANGUAGES = ['de', 'en', 'es', 'pt']
export const LA_TAPBERNE_CACHE_LANGUAGES = ['fr', 'it', 'ar', 'he', 'ko', 'ja']
const ATTACHED_LANGUAGES = LA_TAPBERNE_ATTACHED_LANGUAGES
const CACHE_LANGUAGES = LA_TAPBERNE_CACHE_LANGUAGES
const PUBLIC_CACHE_LANGUAGES = [...new Set([...CACHE_LANGUAGES, 'bo'])]
const PUBLIC_LANGUAGES = [...new Set([...ATTACHED_LANGUAGES, ...PUBLIC_CACHE_LANGUAGES])]
const STALE_ATTACHED_CACHE_LANGUAGES = ['es', 'pt']

const normalizeString = (value) => String(value ?? '').trim()

export const LA_TAPBERNE_TRANSLATIONS = {
  es: {
    menu: {
      name: 'Comida Casera',
      description: 'Tapas-Gastro-Pub · Comida casera',
      note: 'Todos los precios en CHF, IVA incluido.',
    },
    sections: {
      'las-tapas': 'Las Tapas',
      'ein-bisschen-meer': 'Un poco de mar',
      kroketten: 'Croquetas',
      salats: 'Ensaladas',
      hauptgerichte: 'Platos principales',
      'chefs-special': 'Especial del chef',
      onlyhands: '"Onlyhands"',
      dessert: 'Algo dulce',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'mayonesa de ajo' },
      bravas: { name: 'Bravas', description: 'salsa picante' },
      'tortilla-de-patata': {
        name: 'Tortilla de Patata',
        description: 'La tortilla española de patata. Ø24cm. Pequeña 9.50, mediana 16.-, grande 25.-',
      },
      'gebratene-pimientos-de-padron': {
        name: 'Pimientos de Padrón fritos',
        description: 'pimientos de Padrón fritos con escamas de sal marina',
      },
      'portobello-al-ajillo': {
        name: 'Portobello al Ajillo',
        description: 'setas portobello en aceite de ajo y chile',
      },
      'panierte-camembert': { name: 'Camembert empanado', description: 'y mermelada de tomate' },
      'buffalo-schwein-ribs': {
        name: 'Costillas de cerdo Buffalo',
        description: 'costillas de cerdo picantes estilo Buffalo. Con patatas fritas 27.-',
      },
      'the-famous-schweinebauch-albarino-teriyaki': {
        name: '"The Famous" panceta de cerdo Albariño Teriyaki',
        description: 'ensalada wakame, cebolleta y sésamo. Con patatas fritas 25.-',
      },
      'crispy-chicken-fingers': {
        name: 'Crispy Chicken Fingers',
        description: '5 fingers de pollo crujientes caseros con encurtidos picantes, guacamole y salsa aioli. Con patatas fritas 25.-',
      },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'gambas en aceite de ajo y chile' },
      'calamares-knusperli': { name: 'Calamares crujientes', description: 'con aioli y limón a la parrilla' },
      'pulpo-a-la-gallega': {
        name: 'Pulpo a la Gallega',
        description: 'pulpo a la gallega con aceite de oliva, pimentón ahumado y patatas "cachelos"',
      },
      'gegrillter-pulpo': { name: 'Pulpo a la parrilla', description: 'chimichurri y hummus picante' },
      'jamon-kroketten': { name: 'Jamón', description: 'jamón serrano' },
      'trueffel-kroketten': { name: 'Trufa', description: 'champiñones y aceite de trufa' },
      'gemischter-salat': { name: 'Ensalada mixta', description: 'con salsa de ensalada La Tapberne' },
      'bloody-mary-burrata': {
        name: 'Bloody Mary Burrata',
        description: 'tomates, apio, cebolla roja y salsa Bloody Mary',
      },
      'tapberne-nuessler-salat': {
        name: 'Ensalada de canónigos Tapberne',
        description: 'panceta de cerdo, huevo, pan tostado y salsa',
      },
      'caesar-crispy-poulet-salat': {
        name: 'Ensalada Caesar con pollo crujiente',
        description: 'lechuga, bacon, pollo, queso Manchego y aderezo Caesar',
      },
      'zorza-schwein-poulet': {
        name: 'Zorza cerdo/pollo',
        description: 'tiras marinadas de cerdo o pollo sobre patatas paja y pimiento asado. Extras: Manchego 2.50, huevo frito 2.50',
      },
      'huevos-rotos-con-cecina': {
        name: 'Huevos Rotos con Cecina',
        description: 'cecina, 2 huevos fritos y patatas rústicas. Extras: Manchego 2.50, aceite de trufa 2.50',
      },
      'fish-and-chips': {
        name: 'Fish and Chips',
        description: 'filetes de perca crujientes en masa de cerveza, salsa tártara fresca, encurtidos caseros y patatas fritas',
      },
      'el-cachopo': {
        name: 'El Cachopo',
        description: 'Cordon Bleu asturiano de ternera, casero, relleno de cecina y queso Manchego, acompañado de nuestras patatas y Pimientos de Padrón',
      },
      'picanha-smashburger': {
        name: 'Picanha Smashburger',
        description: 'dos patties caseros de picanha de ternera, doble queso, salsa romesco, canónigos, cebolla crujiente, pan brioche y patatas rústicas',
      },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': {
        name: 'La Tapberne Francesinha Pulled Beef Sandwich',
        description: 'pan tostado, pulled beef, cecina, queso gratinado, huevo frito y salsa Francesinha, con patatas fritas',
      },
      'hot-dog': {
        name: 'Hot Dog',
        description: 'dos tipos de queso, mermelada de tomate, mostaza, encurtidos de cebolla roja y chips de panceta de cerdo "Torreznos", con patatas fritas',
      },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': {
        name: 'Sándwich de Egli',
        description: 'sencillo y delicioso: perca crujiente en pan ciabatta con salsa tártara y ensalada',
      },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'con jamón serrano, burrata, tomate y pan ciabatta' },
      'churro-bites': { name: 'Churro Bites', description: 'pequeños churros con azúcar de canela y salsa de chocolate' },
      cheesecake: { name: 'Cheesecake', description: 'fría y con mermelada casera' },
      'happy-tarta-de-santiago': {
        name: 'Happy Tarta de Santiago',
        description: 'la tarta española de almendra con helado de nata, ron y pasas',
      },
    },
  },
  fr: {
    menu: {
      name: 'Comida Casera',
      description: 'Tapas-Gastro-Pub · Cuisine maison',
      note: 'Tous les prix sont en CHF, TVA incluse.',
    },
    sections: {
      'las-tapas': 'Tapas',
      'ein-bisschen-meer': 'Un peu de mer',
      kroketten: 'Croquettes',
      salats: 'Salades',
      hauptgerichte: 'Plats principaux',
      'chefs-special': 'Spécialité du chef',
      onlyhands: '"Onlyhands"',
      dessert: 'Quelque chose de sucré',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'mayonnaise à l’ail' },
      bravas: { name: 'Bravas', description: 'sauce piquante' },
      'tortilla-de-patata': {
        name: 'Tortilla de Patata',
        description: 'l’omelette espagnole aux pommes de terre. Ø24cm. Petite 9.50, moyenne 16.-, grande 25.-',
      },
      'gebratene-pimientos-de-padron': {
        name: 'Pimientos de Padrón frits',
        description: 'piments de Padrón frits avec flocons de sel marin',
      },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'champignons portobello à l’huile d’ail et de piment' },
      'panierte-camembert': { name: 'Camembert pané', description: 'et confiture de tomates' },
      'buffalo-schwein-ribs': {
        name: 'Ribs de porc Buffalo',
        description: 'ribs de porc sauce piquante Buffalo. Avec frites 27.-',
      },
      'the-famous-schweinebauch-albarino-teriyaki': {
        name: '"The Famous" poitrine de porc Albariño Teriyaki',
        description: 'salade wakame, cébette et sésame. Avec frites 25.-',
      },
      'crispy-chicken-fingers': {
        name: 'Crispy Chicken Fingers',
        description: '5 fingers de poulet croustillants maison avec pickles piquants, guacamole et sauce aioli. Avec frites 25.-',
      },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'gambas à l’huile d’ail et de piment' },
      'calamares-knusperli': { name: 'Calamars croustillants', description: 'avec aioli et citron grillé' },
      'pulpo-a-la-gallega': {
        name: 'Pulpo a la Gallega',
        description: 'poulpe à la galicienne avec huile d’olive, paprika fumé et pommes de terre "cachelos"',
      },
      'gegrillter-pulpo': { name: 'Poulpe grillé', description: 'chimichurri et houmous piquant' },
      'jamon-kroketten': { name: 'Jamón', description: 'jambon Serrano' },
      'trueffel-kroketten': { name: 'Truffe', description: 'champignons et huile de truffe' },
      'gemischter-salat': { name: 'Salade mêlée', description: 'avec sauce salade La Tapberne' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'tomates, céleri, oignons rouges et sauce Bloody Mary' },
      'tapberne-nuessler-salat': {
        name: 'Nüsslisalat Tapberne',
        description: 'poitrine de porc, œuf, pain grillé et sauce',
      },
      'caesar-crispy-poulet-salat': {
        name: 'Salade Caesar au poulet croustillant',
        description: 'laitue, bacon, poulet, Manchego et sauce Caesar',
      },
      'zorza-schwein-poulet': {
        name: 'Zorza porc/poulet',
        description: 'émincé mariné de porc ou de poulet sur pommes allumettes et poivron rôti. Suppléments: Manchego 2.50, œuf au plat 2.50',
      },
      'huevos-rotos-con-cecina': {
        name: 'Huevos Rotos con Cecina',
        description: 'cecina, 2 œufs au plat et frites rustiques. Suppléments: Manchego 2.50, huile de truffe 2.50',
      },
      'fish-and-chips': {
        name: 'Fish and Chips',
        description: 'filets de perche croustillants en pâte à la bière, sauce tartare fraîche, pickles maison et frites',
      },
      'el-cachopo': {
        name: 'El Cachopo',
        description: 'Cordon Bleu asturien de bœuf, maison, farci de cecina et de Manchego, accompagné de nos patatas et Pimientos de Padrón',
      },
      'picanha-smashburger': {
        name: 'Picanha Smashburger',
        description: 'deux steaks maison de picanha de bœuf, double fromage, sauce romesco, nüsslisalat, oignons frits, pain brioche et frites rustiques',
      },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': {
        name: 'La Tapberne Francesinha Pulled Beef Sandwich',
        description: 'pain toasté, pulled beef, cecina, fromage gratiné, œuf au plat et sauce Francesinha, avec frites',
      },
      'hot-dog': {
        name: 'Hot Dog',
        description: 'deux sortes de fromage, confiture de tomates, moutarde, pickles d’oignons rouges et chips de poitrine de porc "Torreznos", avec frites',
      },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': {
        name: 'Sandwich d’Egli',
        description: 'simple et délicieux: perche croustillante dans un pain ciabatta avec sauce tartare et salade',
      },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'avec jambon Serrano, burrata, tomate et pain ciabatta' },
      'churro-bites': { name: 'Churro Bites', description: 'petits churros au sucre à la cannelle et sauce chocolat' },
      cheesecake: { name: 'Cheesecake', description: 'froid, avec confiture maison' },
      'happy-tarta-de-santiago': {
        name: 'Happy Tarta de Santiago',
        description: 'le gâteau espagnol aux amandes avec glace crème, rhum et raisins',
      },
    },
  },
  it: {
    menu: {
      name: 'Comida Casera',
      description: 'Tapas-Gastro-Pub · Cucina casalinga',
      note: 'Tutti i prezzi sono in CHF, IVA inclusa.',
    },
    sections: {
      'las-tapas': 'Tapas',
      'ein-bisschen-meer': 'Un po’ di mare',
      kroketten: 'Crocchette',
      salats: 'Insalate',
      hauptgerichte: 'Piatti principali',
      'chefs-special': 'Specialità dello chef',
      onlyhands: '"Onlyhands"',
      dessert: 'Qualcosa di dolce',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'maionese all’aglio' },
      bravas: { name: 'Bravas', description: 'salsa piccante' },
      'tortilla-de-patata': {
        name: 'Tortilla de Patata',
        description: 'la frittata spagnola di patate. Ø24cm. Piccola 9.50, media 16.-, grande 25.-',
      },
      'gebratene-pimientos-de-padron': {
        name: 'Pimientos de Padrón fritti',
        description: 'peperoni Padrón fritti con fiocchi di sale marino',
      },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'funghi portobello in olio all’aglio e peperoncino' },
      'panierte-camembert': { name: 'Camembert impanato', description: 'e confettura di pomodoro' },
      'buffalo-schwein-ribs': { name: 'Ribs di maiale Buffalo', description: 'ribs di maiale con salsa piccante. Con patatine 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': {
        name: '"The Famous" pancetta di maiale Albariño Teriyaki',
        description: 'insalata wakame, cipollotto e sesamo. Con patatine 25.-',
      },
      'crispy-chicken-fingers': {
        name: 'Crispy Chicken Fingers',
        description: '5 fingers di pollo croccanti fatti in casa con pickles piccanti, guacamole e salsa aioli. Con patatine 25.-',
      },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'gamberi in olio all’aglio e peperoncino' },
      'calamares-knusperli': { name: 'Calamari croccanti', description: 'con aioli e limone grigliato' },
      'pulpo-a-la-gallega': {
        name: 'Pulpo a la Gallega',
        description: 'polpo alla galiziana con olio d’oliva, paprika affumicata e patate "cachelos"',
      },
      'gegrillter-pulpo': { name: 'Polpo alla griglia', description: 'chimichurri e hummus piccante' },
      'jamon-kroketten': { name: 'Jamón', description: 'prosciutto Serrano' },
      'trueffel-kroketten': { name: 'Tartufo', description: 'champignon e olio al tartufo' },
      'gemischter-salat': { name: 'Insalata mista', description: 'con salsa per insalata La Tapberne' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'pomodori, sedano, cipolla rossa e salsa Bloody Mary' },
      'tapberne-nuessler-salat': {
        name: 'Insalata nüssli Tapberne',
        description: 'pancetta di maiale, uovo, pane tostato e salsa',
      },
      'caesar-crispy-poulet-salat': {
        name: 'Insalata Caesar con pollo croccante',
        description: 'lattuga, bacon, pollo, Manchego e dressing Caesar',
      },
      'zorza-schwein-poulet': {
        name: 'Zorza maiale/pollo',
        description: 'strisce marinate di maiale o pollo su patatine allumettes e peperone arrostito. Extra: Manchego 2.50, uovo al tegamino 2.50',
      },
      'huevos-rotos-con-cecina': {
        name: 'Huevos Rotos con Cecina',
        description: 'cecina, 2 uova al tegamino e frites rustiche. Extra: Manchego 2.50, olio al tartufo 2.50',
      },
      'fish-and-chips': {
        name: 'Fish and Chips',
        description: 'filetti di pesce persico croccanti in pastella alla birra, salsa tartara fresca, pickles fatti in casa e patatine',
      },
      'el-cachopo': {
        name: 'El Cachopo',
        description: 'Cordon Bleu asturiano di manzo, fatto in casa, ripieno di cecina e Manchego, accompagnato dalle nostre patatas e Pimientos de Padrón',
      },
      'picanha-smashburger': {
        name: 'Picanha Smashburger',
        description: 'due burger artigianali di picanha di manzo, doppio formaggio, salsa romesco, nüsslisalat, cipolle fritte, pane brioche e frites rustiche',
      },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': {
        name: 'La Tapberne Francesinha Pulled Beef Sandwich',
        description: 'pane tostato, pulled beef, cecina, formaggio gratinato, uovo al tegamino e salsa Francesinha, con patatine',
      },
      'hot-dog': {
        name: 'Hot Dog',
        description: 'due tipi di formaggio, confettura di pomodoro, senape, pickles di cipolla rossa e chips di pancetta di maiale "Torreznos", con patatine',
      },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Sandwich di Egli', description: 'semplice e delizioso: persico croccante in pane ciabatta con salsa tartara e insalata' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'con Jamón Serrano, burrata, pomodoro e pane ciabatta' },
      'churro-bites': { name: 'Churro Bites', description: 'piccoli churros con zucchero alla cannella e salsa al cioccolato' },
      cheesecake: { name: 'Cheesecake', description: 'fredda, con confettura fatta in casa' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: 'la torta spagnola alle mandorle con gelato alla panna, rum e uvetta' },
    },
  },
  pt: {
    menu: {
      name: 'Comida Casera',
      description: 'Tapas-Gastro-Pub · Comida caseira',
      note: 'Todos os preços em CHF, IVA incluído.',
    },
    sections: {
      'las-tapas': 'Tapas',
      'ein-bisschen-meer': 'Um pouco de mar',
      kroketten: 'Croquetes',
      salats: 'Saladas',
      hauptgerichte: 'Pratos principais',
      'chefs-special': 'Especial do chef',
      onlyhands: '"Onlyhands"',
      dessert: 'Algo doce',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'maionese de alho' },
      bravas: { name: 'Bravas', description: 'molho picante' },
      'tortilla-de-patata': {
        name: 'Tortilla de Patata',
        description: 'a omelete espanhola de batata. Ø24cm. Pequena 9.50, média 16.-, grande 25.-',
      },
      'gebratene-pimientos-de-padron': { name: 'Pimientos de Padrón fritos', description: 'pimentos Padrón fritos com flocos de sal marinho' },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'cogumelos portobello em óleo de alho e malagueta' },
      'panierte-camembert': { name: 'Camembert panado', description: 'e compota de tomate' },
      'buffalo-schwein-ribs': { name: 'Costelas de porco Buffalo', description: 'costelas de porco picantes. Com batatas fritas 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': { name: '"The Famous" barriga de porco Albariño Teriyaki', description: 'salada wakame, cebolinha e sésamo. Com batatas fritas 25.-' },
      'crispy-chicken-fingers': { name: 'Crispy Chicken Fingers', description: '5 fingers de frango crocantes caseiros com pickles picantes, guacamole e molho aioli. Com batatas fritas 25.-' },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'camarões em óleo de alho e malagueta' },
      'calamares-knusperli': { name: 'Lulas crocantes', description: 'com aioli e limão grelhado' },
      'pulpo-a-la-gallega': { name: 'Pulpo a la Gallega', description: 'polvo à galega com azeite, paprika fumada e batatas "cachelos"' },
      'gegrillter-pulpo': { name: 'Polvo grelhado', description: 'chimichurri e húmus picante' },
      'jamon-kroketten': { name: 'Jamón', description: 'presunto Serrano' },
      'trueffel-kroketten': { name: 'Trufa', description: 'cogumelos e óleo de trufa' },
      'gemischter-salat': { name: 'Salada mista', description: 'com molho de salada La Tapberne' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'tomates, aipo, cebola roxa e molho Bloody Mary' },
      'tapberne-nuessler-salat': { name: 'Salada nüssli Tapberne', description: 'barriga de porco, ovo, pão tostado e molho' },
      'caesar-crispy-poulet-salat': { name: 'Salada Caesar com frango crocante', description: 'alface, bacon, frango, queijo Manchego e molho Caesar' },
      'zorza-schwein-poulet': { name: 'Zorza porco/frango', description: 'tiras marinadas de porco ou frango sobre batatas palha e pimento assado. Extras: Manchego 2.50, ovo estrelado 2.50' },
      'huevos-rotos-con-cecina': { name: 'Huevos Rotos con Cecina', description: 'cecina, 2 ovos estrelados e frites rústicas. Extras: Manchego 2.50, óleo de trufa 2.50' },
      'fish-and-chips': { name: 'Fish and Chips', description: 'filetes de perca crocantes em massa de cerveja, molho tártaro fresco, pickles caseiros e batatas fritas' },
      'el-cachopo': { name: 'El Cachopo', description: 'Cordon Bleu asturiano de vaca, caseiro, recheado com cecina e queijo Manchego, acompanhado das nossas patatas e Pimientos de Padrón' },
      'picanha-smashburger': { name: 'Picanha Smashburger', description: 'dois hambúrgueres caseiros de picanha de vaca, queijo duplo, molho romesco, nüsslisalat, cebola frita, pão brioche e frites rústicas' },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': { name: 'La Tapberne Francesinha Pulled Beef Sandwich', description: 'pão torrado, pulled beef, cecina, queijo gratinado, ovo estrelado e molho Francesinha, com batatas fritas' },
      'hot-dog': { name: 'Hot Dog', description: 'dois tipos de queijo, compota de tomate, mostarda, pickles de cebola roxa e chips de barriga de porco "Torreznos", com batatas fritas' },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Sanduíche de Egli', description: 'simples e delicioso: perca crocante em pão ciabatta com molho tártaro e salada' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'com Jamón Serrano, burrata, tomate e pão ciabatta' },
      'churro-bites': { name: 'Churro Bites', description: 'pequenos churros com açúcar de canela e molho de chocolate' },
      cheesecake: { name: 'Cheesecake', description: 'frio, com compota caseira' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: 'o bolo espanhol de amêndoa com gelado de nata, rum e passas' },
    },
  },
  ar: {
    menu: { name: 'Comida Casera', description: 'تاباس-غاسترو-بوب · طعام منزلي', note: 'جميع الأسعار بالفرنك السويسري وتشمل ضريبة القيمة المضافة.' },
    sections: {
      'las-tapas': 'تاباس',
      'ein-bisschen-meer': 'قليل من البحر',
      kroketten: 'كروكيت',
      salats: 'سلطات',
      hauptgerichte: 'الأطباق الرئيسية',
      'chefs-special': 'طبق الشيف الخاص',
      onlyhands: '"Onlyhands"',
      dessert: 'شيء حلو',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'مايونيز بالثوم' },
      bravas: { name: 'Bravas', description: 'صلصة حارة' },
      'tortilla-de-patata': { name: 'Tortilla de Patata', description: 'عجة البطاطس الإسبانية. Ø24cm. صغير 9.50، متوسط 16.-، كبير 25.-' },
      'gebratene-pimientos-de-padron': { name: 'Pimientos de Padrón مقلية', description: 'فلفل بادرون مقلي مع رقائق ملح البحر' },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'فطر بورتوبيللو في زيت الثوم والفلفل الحار' },
      'panierte-camembert': { name: 'كاممبير مغطى بالبقسماط', description: 'مع مربى الطماطم' },
      'buffalo-schwein-ribs': { name: 'أضلاع لحم خنزير Buffalo', description: 'أضلاع لحم خنزير حارة. مع بطاطس مقلية 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': { name: '"The Famous" بطن لحم خنزير Albariño Teriyaki', description: 'سلطة واكامي، بصل أخضر وسمسم. مع بطاطس مقلية 25.-' },
      'crispy-chicken-fingers': { name: 'Crispy Chicken Fingers', description: '5 أصابع دجاج مقرمشة منزلية مع مخللات حارة، غواكامولي وصلصة أيولي. مع بطاطس مقلية 25.-' },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'روبيان في زيت الثوم والفلفل الحار' },
      'calamares-knusperli': { name: 'كالاماري مقرمش', description: 'مع أيولي وليمون مشوي' },
      'pulpo-a-la-gallega': { name: 'Pulpo a la Gallega', description: 'أخطبوط على الطريقة الغاليسية مع زيت الزيتون، بابريكا مدخنة وبطاطس "cachelos"' },
      'gegrillter-pulpo': { name: 'أخطبوط مشوي', description: 'تشيميتشوري وحمص حار' },
      'jamon-kroketten': { name: 'Jamón', description: 'لحم خنزير سيرانو' },
      'trueffel-kroketten': { name: 'ترافل', description: 'فطر وزيت الترافل' },
      'gemischter-salat': { name: 'سلطة مشكلة', description: 'مع صلصة سلطة La Tapberne' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'طماطم، كرفس، بصل أحمر وصلصة Bloody Mary' },
      'tapberne-nuessler-salat': { name: 'سلطة نوسلي Tapberne', description: 'بطن لحم خنزير، بيض، خبز محمص وصلصة' },
      'caesar-crispy-poulet-salat': { name: 'سلطة Caesar بالدجاج المقرمش', description: 'خس، لحم خنزير مقدد، دجاج، جبن Manchego وصلصة Caesar' },
      'zorza-schwein-poulet': { name: 'Zorza لحم خنزير/دجاج', description: 'شرائح متبلة من لحم الخنزير أو الدجاج فوق بطاطس رفيعة وفلفل مشوي. إضافات: Manchego 2.50، بيض مقلي 2.50' },
      'huevos-rotos-con-cecina': { name: 'Huevos Rotos con Cecina', description: 'لحم Cecina، بيضتان مقليتان وبطاطس ريفية. إضافات: Manchego 2.50، زيت الترافل 2.50' },
      'fish-and-chips': { name: 'Fish and Chips', description: 'فيليه سمك الفرخ مقرمش بعجينة البيرة، صلصة تارتار طازجة، مخللات منزلية وبطاطس مقلية' },
      'el-cachopo': { name: 'El Cachopo', description: 'كوردون بلو أستوري من لحم البقر، منزلي، محشو بـ Cecina وجبن Manchego، يقدم مع patatas و Pimientos de Padrón' },
      'picanha-smashburger': { name: 'Picanha Smashburger', description: 'قطعتا برغر بقر منزليتان من البيكانيا، جبن مزدوج، صلصة روميسكو، سلطة نوسلي، بصل مقلي، خبز بريوش وبطاطس ريفية' },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': { name: 'La Tapberne Francesinha Pulled Beef Sandwich', description: 'خبز توست، لحم بقر مسحوب، Cecina، جبن مخبوز، بيض مقلي وصلصة Francesinha، مع بطاطس مقلية' },
      'hot-dog': { name: 'Hot Dog', description: 'نوعان من الجبن، مربى الطماطم، خردل، مخلل بصل أحمر ورقائق بطن لحم خنزير "Torreznos"، مع بطاطس مقلية' },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Egli Sandwich', description: 'بسيط ولذيذ: سمك Egli مقرمش في خبز تشاباتا مع صلصة تارتار وسلطة' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'مع Jamón Serrano، بوراتا، طماطم وخبز تشاباتا' },
      'churro-bites': { name: 'Churro Bites', description: 'قطع تشورو صغيرة مع سكر القرفة وصلصة الشوكولاتة' },
      cheesecake: { name: 'Cheesecake', description: 'بارد، مع مربى منزلي' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: 'كعكة اللوز الإسبانية مع آيس كريم الكريمة والروم والزبيب' },
    },
  },
  he: {
    menu: { name: 'Comida Casera', description: 'טאפאס-גסטרו-פאב · אוכל ביתי', note: 'כל המחירים בפרנק שווייצרי, כולל מע״מ.' },
    sections: {
      'las-tapas': 'טאפאס',
      'ein-bisschen-meer': 'קצת מן הים',
      kroketten: 'קרוקט',
      salats: 'סלטים',
      hauptgerichte: 'מנות עיקריות',
      'chefs-special': 'ספיישל השף',
      onlyhands: '"Onlyhands"',
      dessert: 'משהו מתוק',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'מיונז שום' },
      bravas: { name: 'Bravas', description: 'רוטב חריף' },
      'tortilla-de-patata': { name: 'Tortilla de Patata', description: 'אומלט תפוחי האדמה הספרדי. Ø24cm. קטן 9.50, בינוני 16.-, גדול 25.-' },
      'gebratene-pimientos-de-padron': { name: 'Pimientos de Padrón מטוגנים', description: 'פלפלי פדרון מטוגנים עם פתיתי מלח ים' },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'פטריות פורטובלו בשמן שום וצ׳ילי' },
      'panierte-camembert': { name: 'קממבר מצופה', description: 'וריבת עגבניות' },
      'buffalo-schwein-ribs': { name: 'צלעות חזיר Buffalo', description: 'צלעות חזיר חריפות. עם צ׳יפס 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': { name: '"The Famous" בטן חזיר Albariño Teriyaki', description: 'סלט וואקמה, בצל ירוק ושומשום. עם צ׳יפס 25.-' },
      'crispy-chicken-fingers': { name: 'Crispy Chicken Fingers', description: '5 אצבעות עוף פריכות ביתיות עם חמוצים חריפים, גוואקמולה ורוטב איולי. עם צ׳יפס 25.-' },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'שרימפס בשמן שום וצ׳ילי' },
      'calamares-knusperli': { name: 'קלמרי פריך', description: 'עם איולי ולימון צלוי' },
      'pulpo-a-la-gallega': { name: 'Pulpo a la Gallega', description: 'תמנון בסגנון גליסיה עם שמן זית, פפריקה מעושנת ותפוחי אדמה "cachelos"' },
      'gegrillter-pulpo': { name: 'תמנון בגריל', description: 'צ׳ימיצ׳ורי וחומוס חריף' },
      'jamon-kroketten': { name: 'Jamón', description: 'חזיר סראנו' },
      'trueffel-kroketten': { name: 'כמהין', description: 'פטריות ושמן כמהין' },
      'gemischter-salat': { name: 'סלט מעורב', description: 'עם רוטב הסלט של La Tapberne' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'עגבניות, סלרי, בצל אדום ורוטב Bloody Mary' },
      'tapberne-nuessler-salat': { name: 'סלט נויסלי Tapberne', description: 'בטן חזיר, ביצה, לחם קלוי ורוטב' },
      'caesar-crispy-poulet-salat': { name: 'סלט Caesar עם עוף פריך', description: 'חסה, בייקון חזיר, עוף, גבינת Manchego ורוטב Caesar' },
      'zorza-schwein-poulet': { name: 'Zorza חזיר/עוף', description: 'רצועות חזיר או עוף במרינדה על צ׳יפס דק ופלפל קלוי. תוספות: Manchego 2.50, ביצת עין 2.50' },
      'huevos-rotos-con-cecina': { name: 'Huevos Rotos con Cecina', description: 'Cecina, שתי ביצי עין וצ׳יפס כפרי. תוספות: Manchego 2.50, שמן כמהין 2.50' },
      'fish-and-chips': { name: 'Fish and Chips', description: 'פילה פריך של דג פרץ בבלילת בירה, רוטב טרטר טרי, חמוצים ביתיים וצ׳יפס' },
      'el-cachopo': { name: 'El Cachopo', description: 'קורדון בלו אסטורי מבקר, ביתי, ממולא ב-Cecina וגבינת Manchego, מוגש עם הפטאטאס שלנו ו-Pimientos de Padrón' },
      'picanha-smashburger': { name: 'Picanha Smashburger', description: 'שתי קציצות בקר פיקניה ביתיות, גבינה כפולה, רוטב רומסקו, סלט נויסלי, בצל מטוגן, לחם בריוש וצ׳יפס כפרי' },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': { name: 'La Tapberne Francesinha Pulled Beef Sandwich', description: 'לחם טוסט, בשר בקר מפורק, Cecina, גבינה מוקרמת, ביצת עין ורוטב Francesinha, עם צ׳יפס' },
      'hot-dog': { name: 'Hot Dog', description: 'שני סוגי גבינה, ריבת עגבניות, חרדל, חמוצי בצל אדום וצ׳יפס בטן חזיר "Torreznos", עם צ׳יפס' },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Egli Sandwich', description: 'פשוט וטעים: דג Egli פריך בלחם ג׳בטה עם רוטב טרטר וסלט' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'עם Jamón Serrano, בוראטה, עגבנייה ולחם ג׳בטה' },
      'churro-bites': { name: 'Churro Bites', description: 'חתיכות צ׳ורו קטנות עם סוכר קינמון ורוטב שוקולד' },
      cheesecake: { name: 'Cheesecake', description: 'קר, עם ריבה ביתית' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: 'עוגת השקדים הספרדית עם גלידת שמנת, רום וצימוקים' },
    },
  },
  ko: {
    menu: { name: 'Comida Casera', description: '타파스 가스트로 펍 · 홈메이드 음식', note: '모든 가격은 CHF이며 부가세가 포함되어 있습니다.' },
    sections: {
      'las-tapas': '타파스',
      'ein-bisschen-meer': '바다의 맛',
      kroketten: '크로켓',
      salats: '샐러드',
      hauptgerichte: '메인 요리',
      'chefs-special': '셰프 스페셜',
      onlyhands: '"Onlyhands"',
      dessert: '달콤한 것',
    },
    dishes: {
      aioli: { name: 'Aioli', description: '마늘 마요네즈' },
      bravas: { name: 'Bravas', description: '매콤한 소스' },
      'tortilla-de-patata': { name: 'Tortilla de Patata', description: '스페인식 감자 오믈렛. Ø24cm. 소 9.50, 중 16.-, 대 25.-' },
      'gebratene-pimientos-de-padron': { name: '구운 Pimientos de Padrón', description: '바다 소금 플레이크를 곁들인 튀긴 파드론 고추' },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: '마늘 칠리 오일의 포토벨로 버섯' },
      'panierte-camembert': { name: '브레디드 카망베르', description: '토마토 잼과 함께' },
      'buffalo-schwein-ribs': { name: '버팔로 돼지 립', description: '매콤한 버팔로 돼지 립. 감자튀김 포함 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': { name: '"The Famous" 돼지 삼겹살 Albariño Teriyaki', description: '와카메 샐러드, 쪽파, 참깨. 감자튀김 포함 25.-' },
      'crispy-chicken-fingers': { name: 'Crispy Chicken Fingers', description: '수제 크리스피 치킨 핑거 5개, 매콤한 피클, 과카몰리, 아이올리 소스. 감자튀김 포함 25.-' },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: '마늘 칠리 오일의 새우' },
      'calamares-knusperli': { name: '크리스피 칼라마리', description: '아이올리와 구운 레몬' },
      'pulpo-a-la-gallega': { name: 'Pulpo a la Gallega', description: '올리브 오일, 훈제 파프리카, "cachelos" 감자를 곁들인 갈리시아식 문어' },
      'gegrillter-pulpo': { name: '구운 문어', description: '치미추리와 매콤한 후무스' },
      'jamon-kroketten': { name: 'Jamón', description: '세라노 햄' },
      'trueffel-kroketten': { name: '트러플', description: '버섯과 트러플 오일' },
      'gemischter-salat': { name: '믹스 샐러드', description: 'La Tapberne 샐러드 드레싱' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: '토마토, 셀러리, 붉은 양파, Bloody Mary 소스' },
      'tapberne-nuessler-salat': { name: 'Tapberne 램스레터스 샐러드', description: '돼지 삼겹살, 달걀, 구운 빵, 소스' },
      'caesar-crispy-poulet-salat': { name: '크리스피 치킨 Caesar 샐러드', description: '상추, 베이컨, 치킨, Manchego 치즈, Caesar 드레싱' },
      'zorza-schwein-poulet': { name: 'Zorza 돼지고기/닭고기', description: '마리네이드한 돼지고기 또는 닭고기 스트립, 슈스트링 감자튀김과 구운 파프리카. 추가: Manchego 2.50, 프라이드 에그 2.50' },
      'huevos-rotos-con-cecina': { name: 'Huevos Rotos con Cecina', description: 'Cecina 햄, 프라이드 에그 2개, 러스틱 프라이. 추가: Manchego 2.50, 트러플 오일 2.50' },
      'fish-and-chips': { name: 'Fish and Chips', description: '맥주 반죽의 바삭한 퍼치 필레, 신선한 타르타르 소스, 수제 피클, 감자튀김' },
      'el-cachopo': { name: 'El Cachopo', description: '수제 아스투리아식 비프 코르동 블루, Cecina와 Manchego 치즈 속, Patatas와 Pimientos de Padrón 곁들임' },
      'picanha-smashburger': { name: 'Picanha Smashburger', description: '수제 소고기 피카냐 패티 2장, 더블 치즈, 로메스코 소스, 램스레터스, 튀긴 양파, 브리오슈 번, 러스틱 프라이' },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': { name: 'La Tapberne Francesinha Pulled Beef Sandwich', description: '토스트, 풀드 비프, Cecina, 구운 치즈, 프라이드 에그와 Francesinha 소스, 감자튀김' },
      'hot-dog': { name: 'Hot Dog', description: '두 가지 치즈, 토마토 잼, 머스터드, 붉은 양파 피클, 돼지 삼겹살 칩 "Torreznos", 감자튀김' },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Egli Sandwich', description: '간단하고 맛있는 바삭한 퍼치, 치아바타 빵, 타르타르 소스와 샐러드' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'Jamón Serrano, 부라타, 토마토, 치아바타 빵' },
      'churro-bites': { name: 'Churro Bites', description: '시나몬 설탕과 초콜릿 소스를 곁들인 작은 추로 스낵' },
      cheesecake: { name: 'Cheesecake', description: '차갑게, 수제 잼과 함께' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: '크림, 럼, 건포도 아이스크림을 곁들인 스페인 아몬드 케이크' },
    },
  },
  ja: {
    menu: { name: 'Comida Casera', description: 'タパス・ガストロパブ · 家庭料理', note: '価格はすべてCHF、税込です。' },
    sections: {
      'las-tapas': 'タパス',
      'ein-bisschen-meer': '少し海の味',
      kroketten: 'クロケット',
      salats: 'サラダ',
      hauptgerichte: 'メイン料理',
      'chefs-special': 'シェフのスペシャル',
      onlyhands: '"Onlyhands"',
      dessert: '甘いもの',
    },
    dishes: {
      aioli: { name: 'Aioli', description: 'ガーリックマヨネーズ' },
      bravas: { name: 'Bravas', description: 'スパイシーソース' },
      'tortilla-de-patata': { name: 'Tortilla de Patata', description: 'スペイン風ポテトオムレツ。Ø24cm。小 9.50、中 16.-、大 25.-' },
      'gebratene-pimientos-de-padron': { name: 'Pimientos de Padrón フライ', description: '海塩フレークを添えたパドロンペッパーのフライ' },
      'portobello-al-ajillo': { name: 'Portobello al Ajillo', description: 'ガーリックチリオイルのポートベロマッシュルーム' },
      'panierte-camembert': { name: 'カマンベールのフライ', description: 'トマトジャム添え' },
      'buffalo-schwein-ribs': { name: 'バッファロー風ポークリブ', description: 'スパイシーなポークリブ。フライドポテト付き 27.-' },
      'the-famous-schweinebauch-albarino-teriyaki': { name: '"The Famous" 豚バラ Albariño Teriyaki', description: 'わかめサラダ、青ねぎ、ごま。フライドポテト付き 25.-' },
      'crispy-chicken-fingers': { name: 'Crispy Chicken Fingers', description: '自家製クリスピーチキンフィンガー5本、スパイシーピクルス、ワカモレ、アイオリソース。フライドポテト付き 25.-' },
      'black-tiger-al-ajillo': { name: 'Black Tiger al Ajillo', description: 'ガーリックチリオイルのエビ' },
      'calamares-knusperli': { name: 'クリスピーカラマリ', description: 'アイオリとグリルレモン添え' },
      'pulpo-a-la-gallega': { name: 'Pulpo a la Gallega', description: 'オリーブオイル、燻製パプリカ、"cachelos" ポテトのガリシア風タコ' },
      'gegrillter-pulpo': { name: 'グリルタコ', description: 'チミチュリとスパイシーフムス' },
      'jamon-kroketten': { name: 'Jamón', description: 'セラーノハム' },
      'trueffel-kroketten': { name: 'トリュフ', description: 'マッシュルームとトリュフオイル' },
      'gemischter-salat': { name: 'ミックスサラダ', description: 'La Tapberne サラダドレッシング' },
      'bloody-mary-burrata': { name: 'Bloody Mary Burrata', description: 'トマト、セロリ、赤玉ねぎ、Bloody Mary ソース' },
      'tapberne-nuessler-salat': { name: 'Tapberne ラムズレタスサラダ', description: '豚バラ、卵、トーストしたパン、ソース' },
      'caesar-crispy-poulet-salat': { name: 'クリスピーチキン Caesar サラダ', description: 'レタス、ベーコン、チキン、Manchego チーズ、Caesar ドレッシング' },
      'zorza-schwein-poulet': { name: 'Zorza ポーク/チキン', description: 'マリネした豚肉または鶏肉のストリップ、細切りフライドポテトとローストパプリカ。追加: Manchego 2.50、目玉焼き 2.50' },
      'huevos-rotos-con-cecina': { name: 'Huevos Rotos con Cecina', description: 'Cecina ハム、目玉焼き2個、ラスティックフライ。追加: Manchego 2.50、トリュフオイル 2.50' },
      'fish-and-chips': { name: 'Fish and Chips', description: 'ビール衣のクリスピーパーチフィレ、フレッシュタルタルソース、自家製ピクルス、フライドポテト' },
      'el-cachopo': { name: 'El Cachopo', description: '自家製アストゥリアス風ビーフ Cordon Bleu、Cecina と Manchego チーズ詰め、当店の patatas と Pimientos de Padrón 添え' },
      'picanha-smashburger': { name: 'Picanha Smashburger', description: '自家製ビーフピカーニャパティ2枚、ダブルチーズ、ロメスコソース、ラムズレタス、フライドオニオン、ブリオッシュパン、ラスティックフライ' },
      'the-vegi-smashburger': { name: 'The Vegi Smashburger', description: '' },
      'la-tapberne-francesinha-pulled-beef-sandwich': { name: 'La Tapberne Francesinha Pulled Beef Sandwich', description: 'トースト、プルドビーフ、Cecina、焼きチーズ、目玉焼き、Francesinha ソース、フライドポテト付き' },
      'hot-dog': { name: 'Hot Dog', description: '2種類のチーズ、トマトジャム、マスタード、赤玉ねぎのピクルス、豚バラチップス "Torreznos"、フライドポテト付き' },
      'hot-dog-vegi': { name: 'Hot Dog Vegi', description: '' },
      'egli-sandwich': { name: 'Egli Sandwich', description: 'シンプルでおいしい、チアバタパンのクリスピーパーチ、タルタルソースとサラダ' },
      'serrano-sandwich': { name: 'Serrano Sandwich', description: 'Jamón Serrano、ブッラータ、トマト、チアバタパン' },
      'churro-bites': { name: 'Churro Bites', description: 'シナモンシュガーとチョコレートソースの小さなチュロススナック' },
      cheesecake: { name: 'Cheesecake', description: '冷製、自家製ジャム添え' },
      'happy-tarta-de-santiago': { name: 'Happy Tarta de Santiago', description: 'クリーム、ラム、レーズンアイスクリームを添えたスペインのアーモンドケーキ' },
    },
  },
}

const TRANSLATIONS = LA_TAPBERNE_TRANSLATIONS

function findMonorepoRoot(startDir) {
  let dir = startDir
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, 'pnpm-workspace.yaml'))) return dir
    const parent = resolve(dir, '..')
    if (parent === dir) break
    dir = parent
  }
  return startDir
}

function resolveRepoPath(pathValue) {
  const root = findMonorepoRoot(process.cwd())
  const candidates = isAbsolute(pathValue)
    ? [pathValue]
    : [resolve(process.cwd(), pathValue), resolve(root, pathValue)]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return candidates[0]
}

async function readJsonFile(pathValue, label) {
  const resolvedPath = resolveRepoPath(pathValue)
  if (!existsSync(resolvedPath)) {
    throw new Error(`${label} file not found: ${pathValue}`)
  }

  return {
    data: JSON.parse(await readFile(resolvedPath, 'utf8')),
    resolvedPath,
  }
}

async function readServiceAccount(pathValue) {
  const { data, resolvedPath } = await readJsonFile(pathValue, 'Service account')
  if (!data.project_id || !data.client_email || !data.private_key) {
    throw new Error(`Invalid service account JSON: ${resolvedPath}`)
  }

  return { account: data, resolvedPath }
}

function printHelp() {
  console.log(`
Seed La Tapberne tourist translation cache.

Dry-run by default. Pass --commit to write.

Usage:
  node scripts/seed-la-tapberne-translation-cache.mjs [--commit]

Options:
  --commit                         Write Firestore cache docs.
  --project <id>                   Firebase project id.
  --database <id>                  Firestore database id. Defaults to misebox.
  --service-account <path>         Service account JSON path.
  --kitchen-collection <path>      Kitchen collection path. Defaults to kitchens.
`)
}

function sourceHash(sourceText) {
  return createHash('sha256').update(normalizeString(sourceText), 'utf8').digest('hex')
}

function makeMenuTranslationCacheKey(fieldId, targetLanguage) {
  const fieldHash = createHash('sha256')
    .update([normalizeString(fieldId), normalizeString(targetLanguage)].join('\n'), 'utf8')
    .digest('hex')

  if (!fieldId || !targetLanguage) return ''
  return `${targetLanguage}__${fieldHash.slice(0, 40)}`
}

function updatedStamp() {
  return {
    at: FieldValue.serverTimestamp(),
    by: SYSTEM_ACTOR,
    app_id: APP_ID,
  }
}

function buildCacheDoc({ fieldId, sourceText, translatedText, targetLanguage, sourceLanguage = 'default' }) {
  const id = makeMenuTranslationCacheKey(fieldId, targetLanguage)

  return {
    id,
    field_id: fieldId,
    domain: DOMAIN,
    glossary_version: GLOSSARY_VERSION,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    source_text: normalizeString(sourceText),
    translated_text: normalizeString(translatedText),
    provider: 'manual',
    reviewed: true,
    certified: false,
    source_hash: sourceHash(sourceText),
    usage_count: 0,
    created: updatedStamp(),
    updated: updatedStamp(),
  }
}

function menuFieldId(menuId, field) {
  return `menu:${menuId}:${field}`
}

function sectionFieldId(menuId, sectionId, field) {
  return `menu:${menuId}:section:${sectionId}:${field}`
}

function itemFieldId(menuId, sectionId, itemId, field) {
  return `menu:${menuId}:section:${sectionId}:item:${itemId}:${field}`
}

function dishFieldId(dishId, field) {
  return `dish:${dishId}:${field}`
}

function translatedSourceText(defaultText, translations) {
  return normalizeString(defaultText) ||
    normalizeString(translations?.de) ||
    normalizeString(translations?.en)
}

function addCacheDoc(docs, missing, input) {
  const fieldId = normalizeString(input.fieldId)
  const sourceText = normalizeString(input.sourceText)
  const translatedText = normalizeString(input.translatedText)

  if (!fieldId || !sourceText) return
  if (!translatedText) {
    missing.push({
      language: input.targetLanguage,
      field_id: fieldId,
      source_text: sourceText,
    })
    return
  }

  docs.push(buildCacheDoc({
    fieldId,
    sourceText,
    translatedText,
    targetLanguage: input.targetLanguage,
    sourceLanguage: input.sourceLanguage,
  }))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help || args.h) {
    printHelp()
    return
  }

  const serviceAccountPath =
    typeof args['service-account'] === 'string'
      ? normalizeString(args['service-account'])
      : process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SERVICE_ACCOUNT_PATH
  const { account, resolvedPath: resolvedServiceAccountPath } =
    await readServiceAccount(serviceAccountPath)
  const projectId = normalizeString(
    args.project || process.env.FIREBASE_PROJECT_ID || account.project_id || DEFAULT_PROJECT_ID
  )
  const databaseId =
    typeof args.database === 'string' ? normalizeString(args.database) : DEFAULT_DATABASE_ID
  const kitchenCollectionPath =
    typeof args['kitchen-collection'] === 'string'
      ? normalizeString(args['kitchen-collection'])
      : DEFAULT_KITCHEN_COLLECTION_PATH
  const commit = Boolean(args.commit)
  const app = initializeApp(
    { credential: cert(account), projectId },
    'seed-la-tapberne-translation-cache'
  )
  const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app)
  const kitchensRef = db.collection(kitchenCollectionPath)
  const slugSnap = await kitchensRef.where('slug', '==', KITCHEN_SLUG).limit(1).get()

  if (slugSnap.empty) {
    throw new Error(`Kitchen not found by slug: ${KITCHEN_SLUG}`)
  }

  const kitchenRef = slugSnap.docs[0].ref
  const kitchenData = slugSnap.docs[0].data() || {}
  const menuRef = kitchenRef.collection('menus').doc(MENU_ID)
  const menuSnap = await menuRef.get()

  if (!menuSnap.exists) {
    throw new Error(`Menu not found: ${menuRef.path}`)
  }

  const menu = menuSnap.data() || {}
  const dishIds = new Set()
  for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
    for (const item of Array.isArray(section.items) ? section.items : []) {
      const dishId = normalizeString(item.dish_id)
      if (dishId) dishIds.add(dishId)
    }
  }
  const dishSnaps = await Promise.all(
    Array.from(dishIds).map((dishId) => kitchenRef.collection('dishes').doc(dishId).get())
  )
  const dishesById = new Map(
    dishSnaps
      .filter((snap) => snap.exists)
      .map((snap) => [snap.ref.id, snap.data() || {}])
  )
  const docs = []
  const missing = []
  const knownBlankDescriptions = new Set()
  const staleAttachedCacheSnap = await menuRef
    .collection('translation_cache')
    .where('target_language', 'in', STALE_ATTACHED_CACHE_LANGUAGES)
    .get()

  for (const targetLanguage of CACHE_LANGUAGES) {
    const translations = TRANSLATIONS[targetLanguage]
    const add = (fieldId, sourceText, translatedText, sourceLanguage = 'default') => {
      addCacheDoc(docs, missing, {
        fieldId,
        sourceText,
        translatedText,
        targetLanguage,
        sourceLanguage,
      })
    }

    add(menuFieldId(MENU_ID, 'name'), menu.name || MENU_ID, translations?.menu?.name)
    add(
      menuFieldId(MENU_ID, 'description'),
      translatedSourceText(menu.description, menu.descriptions),
      translations?.menu?.description,
      'de'
    )
    add(menuFieldId(MENU_ID, 'note'), menu.note, translations?.menu?.note)

    for (const section of Array.isArray(menu.sections) ? menu.sections : []) {
      const sectionId = normalizeString(section.id)
      add(
        sectionFieldId(MENU_ID, sectionId, 'label'),
        section.label,
        translations?.sections?.[sectionId]
      )
      add(sectionFieldId(MENU_ID, sectionId, 'description'), section.description, '')

      for (const item of Array.isArray(section.items) ? section.items : []) {
        const itemId = normalizeString(item.id)
        const dishId = normalizeString(item.dish_id)
        if (!dishId) {
          const itemTranslation = translations?.items?.[itemId]
          add(itemFieldId(MENU_ID, sectionId, itemId, 'label'), item.label, itemTranslation?.label)
          add(
            itemFieldId(MENU_ID, sectionId, itemId, 'description'),
            item.description,
            itemTranslation?.description
          )
          continue
        }

        const dish = dishesById.get(dishId)
        const dishTranslation = translations?.dishes?.[dishId]
        if (!dish) {
          missing.push({
            language: targetLanguage,
            field_id: dishFieldId(dishId, 'name'),
            source_text: '[missing dish document]',
          })
          continue
        }

        add(dishFieldId(dishId, 'name'), dish.name || dishId, dishTranslation?.name)
        const sourceDescription = translatedSourceText(dish.description, dish.descriptions)
        if (!sourceDescription) {
          knownBlankDescriptions.add(dishId)
        }
        add(
          dishFieldId(dishId, 'description'),
          sourceDescription,
          dishTranslation?.description,
          'de'
        )
      }
    }
  }

  const docsByLanguage = Object.fromEntries(
    CACHE_LANGUAGES.map((language) => [
      language,
      docs.filter((doc) => doc.target_language === language).length,
    ])
  )

  console.log('[seed] la-tapberne-translation-cache prepared', {
    commit,
    projectId,
    databaseId,
    serviceAccount: resolvedServiceAccountPath,
    kitchenPath: kitchenRef.path,
    menuPath: menuRef.path,
    cachePath: menuRef.collection('translation_cache').path,
    show: kitchenData.show,
    attachedLanguages: ATTACHED_LANGUAGES,
    cacheLanguages: CACHE_LANGUAGES,
    docsByLanguage,
    totalDocs: docs.length,
    staleAttachedCacheDocs: staleAttachedCacheSnap.size,
    missing,
    knownBlankDescriptions: Array.from(knownBlankDescriptions),
  })

  if (!commit) return
  if (missing.length) {
    throw new Error(`Refusing to write incomplete translation cache: ${missing.length} missing values`)
  }

  let batch = db.batch()
  let ops = 0

  batch.set(
    kitchenRef,
    {
      show: true,
      language_settings: {
        default_language: 'de',
        supported_languages: PUBLIC_LANGUAGES,
        public_languages: PUBLIC_LANGUAGES,
        attached_languages: ATTACHED_LANGUAGES,
        sproochli: true,
        cache_languages: PUBLIC_CACHE_LANGUAGES,
      },
      supported_languages: PUBLIC_LANGUAGES,
      updated: updatedStamp(),
    },
    { merge: true }
  )
  ops += 1

  for (const doc of staleAttachedCacheSnap.docs) {
    batch.delete(doc.ref)
    ops += 1
    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  for (const doc of docs) {
    batch.set(menuRef.collection('translation_cache').doc(doc.id), doc, { merge: false })
    ops += 1
    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) await batch.commit()

  console.log('[seed] la-tapberne-translation-cache done', {
    written: {
      kitchen: 1,
      cacheDocs: docs.length,
      deletedAttachedCacheDocs: staleAttachedCacheSnap.size,
    },
    language_settings: {
      attached_languages: ATTACHED_LANGUAGES,
      cache_languages: PUBLIC_CACHE_LANGUAGES,
    },
    routes: CACHE_LANGUAGES.map(
      (language) => `/kitchens/la-tapberne/menus/main?lang=${language}`
    ),
    knownBlankDescriptions: Array.from(knownBlankDescriptions),
  })
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('[seed] la-tapberne-translation-cache failed')
    console.error(error)
    process.exitCode = 1
  })
}
