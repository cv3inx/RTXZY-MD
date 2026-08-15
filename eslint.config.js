import globals from 'globals';

// Catatan: test.js TIDAK di-ignore — espree 10 (eslint 9) sudah mendukung import attributes (ES2025).
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      // ecmaVersion 2025 = maksimum yang didukung espree 10 (eslint 9)
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        // Hanya global yang benar-benar di-set kode ini (grep 'global.X =').
        global: 'readonly',
        globalThis: 'readonly',
        API: 'readonly',
        DATABASE: 'writable',
        conn: 'writable',
        config: 'readonly',
        db: 'writable',
        dfail: 'readonly',
        isInit: 'writable',
        loadDatabase: 'readonly',
        mediaProcessor: 'readonly',
        opts: 'readonly',
        plugins: 'writable',
        prefix: 'readonly',
        reload: 'readonly',
        reloadHandler: 'readonly',
        support: 'readonly',
        timestamp: 'readonly',
        useQR: 'writable',
        anticall: 'writable',
        anu: 'writable',
        autobio: 'writable',
        dungeon: 'writable',
        iq: 'writable',
        // Alias legacy yang dipasang config.js untuk plugin lama (lihat
        // legacyAliases di sana). Terdaftar di sini supaya no-undef tetap
        // menangkap nama yang MEMANG tidak ada.
        wait: 'readonly',
        eror: 'readonly',
        stiker_wait: 'readonly',
        wm: 'readonly',
        packname: 'readonly',
        author: 'readonly',
        thumb: 'readonly',
        owner: 'readonly',
        numberowner: 'readonly',
        nameowner: 'readonly',
        mail: 'readonly',
        gc: 'readonly',
        instagram: 'readonly',
        btc: 'readonly',
        aksesKey: 'readonly',
        APIKeys: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error',
      'no-unexpected-multiline': 'error',
      // Pola lama `if ((x = ...))` dengan paren disengaja di banyak plugin → pakai default except-parens
      'no-cond-assign': ['error', 'except-parens'],
      'no-const-assign': 'error',
      'no-dupe-args': 'error',
      'no-dupe-class-members': 'error',
      'no-dupe-keys': 'error',
      'no-duplicate-case': 'error',
      'no-empty-pattern': 'error',
      'no-func-assign': 'error',
      'no-import-assign': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-obj-calls': 'error',
      'no-unreachable': 'error',
      'no-unreachable-loop': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-negation': 'error',
      'no-unused-private-class-members': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      // no-redeclare off: pola legacy `var stiker` berulang di else-if chain (40+ tempat) — legal di JS
      'no-redeclare': 'off',
      'no-control-regex': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-fallthrough': 'off',
      'no-useless-escape': 'off',
      'no-async-promise-executor': 'off'
    }
  },
  {
    // kode obfuscated (anti-copas) — assignment ke fungsi itu disengaja
    files: ['plugins/info/tqto.js'],
    rules: {
      'no-func-assign': 'off'
    }
  },
  {
    // return di dalam finally untuk early-exit info grup — pola lama, sengaja
    files: ['plugins/group/info.js'],
    rules: {
      'no-unsafe-finally': 'off'
    }
  }
];
