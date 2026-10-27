const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([expo, { ignores: ['example/**', 'convex/_generated/**', '.superpowers/**', 'dist/**'] }]);
