const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
for (const [name, code, env] of [
  ['default resolver', `const c=require('./metro.config');if(String(c.resolver.resolveRequest).includes('qa/native'))process.exit(1)`, { CODEXGRAM_NATIVE_QA: '', NODE_ENV: 'development' }],
  ['production environment rejected', `try{require('./metro.config');process.exit(1)}catch(e){if(!e.message.includes('restricted to local development'))throw e}`, { CODEXGRAM_NATIVE_QA: '1', NODE_ENV: 'production' }],
  ['production resolver rejected', `const c=require('./metro.config');try{c.resolver.resolveRequest({isDev:false},'@clerk/expo','android');process.exit(1)}catch(e){if(!e.message.includes('cannot be bundled for production'))throw e}`, { CODEXGRAM_NATIVE_QA: '1', NODE_ENV: 'development' }],
]) {
  const result = spawnSync(process.execPath, ['-e', code], { cwd: require('node:path').resolve(__dirname, '../..'), env: { ...process.env, ...env }, encoding: 'utf8' });
  assert.equal(result.status, 0, `${name}: ${result.stderr}`);
  console.log(`PASS ${name}`);
}
