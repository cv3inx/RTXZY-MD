// Shared client for the botcahx API (https://api.botcahx.eu.org) — every plugin
// used to build this URL and inject the apikey by hand. Now it's one place.
// Injected into every plugin's context as `Api` (see handler.js) — no per-file import needed.
class BotcahxApi {
  static BASE_URL = 'https://api.botcahx.eu.org';

  get apikey() {
    return global.btc;
  }

  url(path, params = {}) {
    const url = new URL(path || '/', BotcahxApi.BASE_URL);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
    if (!url.searchParams.has('apikey')) url.searchParams.set('apikey', this.apikey);
    return url.toString();
  }

  get(path, params = {}) {
    return fetch(this.url(path, params));
  }

  post(path, body = {}, params = {}) {
    return fetch(this.url(path, params), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
}

const Api = new BotcahxApi();
export default Api;
export { Api, BotcahxApi };

if (process.argv[1] === import.meta.filename) {
  const assert = await import('assert').then((m) => m.default);
  global.btc = 'TESTKEY';
  assert.strictEqual(Api.url('/api/x', { q: 'hi there' }), 'https://api.botcahx.eu.org/api/x?q=hi+there&apikey=TESTKEY');
  assert.strictEqual(Api.url('/api/y'), 'https://api.botcahx.eu.org/api/y?apikey=TESTKEY');
  assert.strictEqual(Api.url('/api/z', { apikey: 'OTHERKEY' }), 'https://api.botcahx.eu.org/api/z?apikey=OTHERKEY');
  console.log('api self-check passed');
}
