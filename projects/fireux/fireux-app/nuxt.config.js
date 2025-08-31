"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("nuxt/config");
var base_nuxt_config_1 = require("fireux-core/config/app/base-nuxt.config");
var config = (0, config_1.defineNuxtConfig)((0, base_nuxt_config_1.createBaseNuxtConfig)({
    modules: ['fireux-core'],
    ecosystem: 'fireux',
    appName: (_a = process.env.APP_NAME) !== null && _a !== void 0 ? _a : 'FireUX',
    appShortName: (_b = process.env.APP_SHORT_NAME) !== null && _b !== void 0 ? _b : 'FireUX',
    primaryColor: (_c = process.env.APP_PRIMARY_COLOR) !== null && _c !== void 0 ? _c : '#EAB308',
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3000,
}));
exports.default = config;
