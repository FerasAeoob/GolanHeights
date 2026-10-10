/* eslint-disable @typescript-eslint/no-require-imports */
/* An isolated browser harness: real editor, local test action adapter, no database. */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { webpack } = require('next/dist/compiled/webpack/webpack');
const root = path.resolve(__dirname, '../..');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'golan-order-browser-'));
const loader = path.join(temporary, 'loader.cjs');
fs.writeFileSync(loader, `const ts = require(${JSON.stringify(require.resolve('typescript'))}); module.exports = function(source) { return ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: this.resourcePath }).outputText; };`);
const actions = path.join(temporary, 'actions.ts');
fs.writeFileSync(actions, `
export const initialPlaces = Array.from({length:24}, (_,i) => ({id: String(i+1).padStart(24,'0'), title:{en:'Place '+(i+1), ar:'مكان '+(i+1), he:'מקום '+(i+1)},hidden:i===4}));
export async function getPlaceOrderAction(){ return JSON.parse(localStorage.getItem('order') || JSON.stringify({places:initialPlaces,revision:'initial'})); }
export async function savePlaceOrderAction(input){
 await new Promise(r=>setTimeout(r,150));
 if(window.orderFailure) return {errorCode:window.orderFailure};
 const state=await getPlaceOrderAction();
 if(input.revision!==state.revision) return {errorCode:'ORDER_CONFLICT'};
 const revision=String(Date.now());
 localStorage.setItem('order',JSON.stringify({places:input.ids.map(id=>state.places.find(p=>p.id===id)),revision}));
 return {success:true, revision};
}`);
const entry = path.join(temporary, 'entry.tsx');
fs.writeFileSync(entry, `
import React from 'react'; import {createRoot} from 'react-dom/client';
import Editor from ${JSON.stringify(path.join(root,'components/admin/PlaceOrderEditor.tsx'))};
import en from ${JSON.stringify(path.join(root,'dictionaries/en.json'))};
import ar from ${JSON.stringify(path.join(root,'dictionaries/ar.json'))};
import he from ${JSON.stringify(path.join(root,'dictionaries/he.json'))};
import {getPlaceOrderAction} from './actions';
const lang=new URLSearchParams(location.search).get('lang') || 'en';
document.documentElement.lang=lang; document.documentElement.dir=lang==='en'?'ltr':'rtl';
getPlaceOrderAction().then(s=>createRoot(document.getElementById('root')).render(<main className="mx-auto max-w-4xl p-4"><a href="/exit">Leave editor</a><Editor initialPlaces={s.places} initialRevision={s.revision} lang={lang} dictionary={{en,ar,he}[lang].placeOrder}/></main>));
`);
webpack({ mode: 'development', devtool: false, entry, output:{path:temporary,filename:'bundle.js'}, resolve:{extensions:['.ts','.tsx','.js','.json'],modules:[path.join(root,'node_modules'),'node_modules'],alias:{'@/app/actions/place-order':actions,'@':root}}, module:{rules:[{test:/\.tsx?$/,use:[loader]}]} }, async (error, stats) => {
 if(error || stats.hasErrors()){ console.error(error || stats.toString({all:false,errors:true})); process.exitCode=1; return; }
 const postcss = require('postcss');
 const tailwind = require('@tailwindcss/postcss');
 const css = await postcss([tailwind({base:root})]).process('@import "tailwindcss" source(none); @source "../components/admin/PlaceOrderEditor.tsx";', {from:path.join(root,'app/order-harness.css')});
 fs.writeFileSync(path.join(temporary,'styles.css'),css.css);
 const server=http.createServer((request,response)=>{
  const filename = request.url.startsWith('/bundle.js')?'bundle.js':request.url.startsWith('/styles.css')?'styles.css':null;
  if(filename){ response.setHeader('content-type',filename.endsWith('.js')?'text/javascript':'text/css'); response.end(fs.readFileSync(path.join(temporary,filename))); return; }
  response.setHeader('content-type','text/html; charset=utf-8');
  response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/styles.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>');
 });
 server.listen(0,'127.0.0.1',async()=>{
  const url = `http://127.0.0.1:${server.address().port}`;
  console.log(`Order browser harness ${url}`);
  if (process.argv.includes('--test')) {
   try { await require('../place-order-browser.cjs')(url); }
   catch(error) { console.error(error); process.exitCode=1; }
   finally { server.close(); }
  }
 });
 process.on('SIGINT',()=>{server.close(); process.exit();});
});
