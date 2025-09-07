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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFireuxConfig = createFireuxConfig;
function dedupeKeepLast(mods) {
    if (mods === void 0) { mods = []; }
    // Keep last occurrence so app-provided modules/options win
    var map = new Map();
    for (var _i = 0, mods_1 = mods; _i < mods_1.length; _i++) {
        var m = mods_1[_i];
        map.set(Array.isArray(m) ? m[0] : m, m);
    }
    var seen = new Set();
    var ordered = [];
    for (var _a = 0, mods_2 = mods; _a < mods_2.length; _a++) {
        var m = mods_2[_a];
        var id = Array.isArray(m) ? m[0] : m;
        if (!seen.has(id)) {
            seen.add(id);
            ordered.push(map.get(id));
        }
    }
    return ordered;
}
// Treat empty-string envs as undefined
var env = function (k) {
    var _a;
    var v = process.env[k];
    return ((_a = v === null || v === void 0 ? void 0 : v.trim()) === null || _a === void 0 ? void 0 : _a.length) ? v : undefined;
};
function createFireuxConfig(opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var includeCore = (_a = opts.includeCore) !== null && _a !== void 0 ? _a : true;
    // Colors come from env unless explicitly overridden
    var primaryColor = (_c = (_b = opts.primaryColor) !== null && _b !== void 0 ? _b : env('APP_PRIMARY_COLOR')) !== null && _c !== void 0 ? _c : '#000000';
    var neutralColor = (_d = opts.neutralColor) !== null && _d !== void 0 ? _d : env('APP_NEUTRAL_COLOR');
    // Defaults
    var vuefireDefaults = {
        auth: { enabled: true, sessionCookie: false },
        config: {
            apiKey: env('FIREBASE_API_KEY'),
            authDomain: env('FIREBASE_AUTH_DOMAIN'),
            projectId: env('FIREBASE_PROJECT_ID'),
            storageBucket: env('FIREBASE_STORAGE_BUCKET'),
            messagingSenderId: env('FIREBASE_MESSAGING_SENDER_ID'),
            appId: env('FIREBASE_APP_ID'),
            measurementId: env('FIREBASE_MEASUREMENT_ID'),
        },
        appCheck: env('FIREBASE_RECAPTCHA_V3_KEY')
            ? {
                debug: false,
                isTokenAutoRefreshEnabled: true,
                provider: 'ReCaptchaV3',
                key: env('FIREBASE_RECAPTCHA_V3_KEY'),
            }
            : undefined,
    };
    var pwaDefaults = {
        registerType: 'autoUpdate',
        manifest: {
            name: opts.appName,
            short_name: opts.appShortName,
            start_url: '/',
            display: 'standalone',
            background_color: '#ffffff',
            theme_color: primaryColor,
        },
    };
    var vuefireMerged = __assign(__assign({}, vuefireDefaults), ((_e = opts.vuefire) !== null && _e !== void 0 ? _e : {}));
    var pwaMerged = __assign(__assign({}, pwaDefaults), ((_f = opts.pwa) !== null && _f !== void 0 ? _f : {}));
    // Always-on modules (order matters)
    var base = __spreadArray([
        '@nuxt/ui',
        '@nuxt/icon',
        ['nuxt-vuefire', vuefireMerged],
        ['@vite-pwa/nuxt', pwaMerged]
    ], (includeCore ? ['fireux-core'] : []), true);
    var modules = dedupeKeepLast(__spreadArray(__spreadArray([], base, true), ((_g = opts.modules) !== null && _g !== void 0 ? _g : []), true));
    var appId = env('APP_ID');
    if (process.env.NODE_ENV !== 'production' && !appId) {
        // eslint-disable-next-line no-console
        console.warn('[fireux] APP_ID is not set. Some app-level composables may not resolve.');
    }
    var config = {
        // FireUX app structure defaults
        srcDir: 'app',
        // composables only; models stay explicit-import-only
        imports: { dirs: ['composables/**', 'utils/**'] },
        modules: modules,
        app: { head: { title: opts.appName } },
        runtimeConfig: {
            // server-only (JSON string accepted; OR rely on GOOGLE_APPLICATION_CREDENTIALS path env)
            firebaseServiceAccount: env('FIREBASE_SERVICE_ACCOUNT') || '',
            public: {
                ecosystem: opts.ecosystem,
                appName: opts.appName,
                appShortName: opts.appShortName,
                primaryColor: primaryColor,
                neutralColor: neutralColor,
                // expose to client plugin
                firebaseConfig: __assign({}, (vuefireMerged.config || {})),
                // minimal app settings
                appSettings: {
                    appId: appId, // may be undefined; that's okay
                    ecosystem: opts.ecosystem,
                },
            },
        },
        compatibilityDate: ((_h = opts.compatibilityDate) !== null && _h !== void 0 ? _h : '2025-09-01'),
    };
    return config;
}
