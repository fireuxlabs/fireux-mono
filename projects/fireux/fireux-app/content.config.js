"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var content_1 = require("@nuxt/content");
exports.default = (0, content_1.defineContentConfig)({
    collections: {
        content: (0, content_1.defineCollection)({
            type: 'page',
            source: '**/*.md',
        }),
    },
});
