/* eslint-disable @typescript-eslint/no-require-imports */
// Real search component and debounce; only Next navigation is adapted for an isolated browser.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname, '../..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'golan-admin-search-'));
const loader = path.join(temporary, 'loader.cjs');
fs.writeFileSync(loader, `const ts = require(${JSON.stringify(require.resolve('typescript'))}); module.exports = function(source) { return ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: this.resourcePath }).outputText; };`);
const navigation = path.join(temporary, 'navigation.ts');
fs.writeFileSync(navigation, `
import {useMemo, useSyncExternalStore} from 'react';
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach(fn => fn());
const subscribe = (fn: () => void) => { subscribers.add(fn); return () => subscribers.delete(fn); };
addEventListener('popstate', notify);
let sequence = 0;
window.navigationCalls = [];
window.navigateExternally = (url) => { sequence++; history.pushState({}, '', url); notify(); };
const router = { replace(url, options) {
  window.navigationCalls.push({url, options, time: performance.now()});
  const current = ++sequence;
  setTimeout(() => {
    if (current !== sequence) return;
    history.replaceState({}, '', url); notify();
  }, window.navigationDelay || 0);
} };
export function useRouter() { return router; }
export function usePathname() { return useSyncExternalStore(subscribe, () => location.pathname); }
export function useSearchParams() {
  const query = useSyncExternalStore(subscribe, () => location.search);
  return useMemo(() => new URLSearchParams(query), [query]);
}
`);
const entry = path.join(temporary, 'entry.tsx');
fs.writeFileSync(entry, `
import React from 'react'; import {createRoot} from 'react-dom/client';
import Search from ${JSON.stringify(path.join(root, 'components/admin/AdminPlaceSearch.tsx'))};
import en from ${JSON.stringify(path.join(root, 'dictionaries/en.json'))};
import ar from ${JSON.stringify(path.join(root, 'dictionaries/ar.json'))};
import he from ${JSON.stringify(path.join(root, 'dictionaries/he.json'))};
const lang = location.pathname.split('/')[1] || 'en';
document.documentElement.lang = lang;
document.documentElement.dir = lang === 'en' ? 'ltr' : 'rtl';
createRoot(document.getElementById('root')).render(<main className="mx-auto max-w-7xl p-4 md:p-8"><Search lang={lang} labels={{en,ar,he}[lang].adminPlaceSearch}/></main>);
`);
webpack({
  mode: 'development', devtool: false, entry,
  output: { path: temporary, filename: 'bundle.js' },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    modules: [path.join(root, 'node_modules'), 'node_modules'],
    alias: { 'next/navigation': navigation, '@': root },
  },
  module: { rules: [{ test: /\.tsx?$/, use: [loader] }] },
}, async (error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    return;
  }
  const css = await require('postcss')([require('@tailwindcss/postcss')({ base: root })]).process(
    '@import "tailwindcss" source(none); @source "../components/admin/AdminPlaceSearch.tsx";',
    { from: path.join(root, 'app/admin-search-harness.css') },
  );
  fs.writeFileSync(path.join(temporary, 'styles.css'), css.css);
  const server = http.createServer((request, response) => {
    const filename = request.url.startsWith('/bundle.js') ? 'bundle.js'
      : request.url.startsWith('/styles.css') ? 'styles.css' : null;
    if (filename) {
      response.setHeader('content-type', filename.endsWith('.js') ? 'text/javascript' : 'text/css');
      response.end(fs.readFileSync(path.join(temporary, filename)));
      return;
    }
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/styles.css"></head><body class="bg-slate-50"><div id="root"></div><script src="/bundle.js"></script></body></html>');
  });
  server.listen(0, '127.0.0.1', async () => {
    const url = `http://127.0.0.1:${server.address().port}`;
    console.log(`Admin search browser harness ${url}`);
    if (process.argv.includes('--test')) {
      try { await require('../admin-place-search-browser.cjs')(url); }
      catch (error) { console.error(error); process.exitCode = 1; }
      finally { server.close(); }
    }
  });
  process.on('SIGINT', () => { server.close(); process.exit(); });
});
