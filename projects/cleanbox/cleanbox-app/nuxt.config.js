"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("nuxt/config");
var base_nuxt_config_1 = require("fireux-core/config/app/base-nuxt.config");
var config = (0, config_1.defineNuxtConfig)((0, base_nuxt_config_1.createBaseNuxtConfig)({
    modules: ['fireux-cleanbox', 'fireux-jobs'],
    ecosystem: 'cleanbox',
    appName: process.env.APP_NAME,
    appShortName: process.env.APP_SHORT_NAME,
    primaryColor: process.env.APP_PRIMARY_COLOR,
    neutralColor: process.env.APP_NEUTRAL_COLOR,
    port: 3002,
}));
exports.default = config;
