"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("nuxt/config");
var fireux_core_1 = require("fireux-core");
exports.default = (0, config_1.defineNuxtConfig)(__assign({}, (0, fireux_core_1.createFireuxConfig)({
    appName: 'FireUX Tenant',
    appShortName: 'Tenant',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
})));
