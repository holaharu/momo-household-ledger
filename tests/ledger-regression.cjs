const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function field(value=''){return {value,options:[],label:{hidden:false},events:{},disabled:false,replaceChildren(...v){this.options=v},add(v){this.options.push(v)},closest(){return this.label},addEventListener(n,fn){this.events[n]=fn}}}
const elements={type:field('수입'),category:field(),subcategory:field()};
const nodes={editForm:{elements},year:{value:'2026'},half:{value:'2'},periodAnalysis:{},trendInfo:{}};
const sandbox={console,Option:function(text,value){this.text=text;this.value=value},$:id=>nodes[id],records:[],render(){},document:{querySelectorAll(){return []}},sum:rs=>rs.reduce((a,r)=>a+r.amount,0),money:n=>n+'원',statusFor:()=>({uploaded:[],confirmed:false})};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('categories.js','utf8'),sandbox);
assert.equal(elements.subcategory.disabled,true);assert.equal(elements.subcategory.label.hidden,true);
assert.equal(elements.category.options.length,18);
vm.runInContext("populateCategoryFields('지출','자동차','주유')",sandbox);
assert.equal(elements.subcategory.disabled,false);assert.equal(elements.subcategory.value,'주유');
assert.equal(elements.subcategory.options.length,7);
elements.type.value='지출';elements.category.value='식비';elements.category.events.change();
assert.equal(elements.subcategory.value,'');assert.ok(elements.subcategory.options.some(o=>o.value==='식재료'));
assert.ok(!elements.subcategory.options.some(o=>o.value==='주유'));
vm.runInContext("records=[{type:'지출',category:'기존분류',subcategory:'기존소분류'}];populateCategoryFields('지출','기존분류','기존소분류')",sandbox);
assert.equal(elements.category.value,'기존분류');assert.equal(elements.subcategory.value,'기존소분류');
vm.runInContext("populateCategoryFields('수입','급여','기존소분류')",sandbox);
assert.equal(elements.subcategory.value,'');assert.equal(elements.subcategory.disabled,true);
const analysis=fs.readFileSync('analysis.js','utf8');
vm.runInContext(analysis.slice(0,analysis.indexOf('render=function'))+analysis.slice(analysis.indexOf('function renderPeriod('),analysis.indexOf('function renderPie('))+'\nrenderPie=()=>{};',sandbox);
sandbox.rows=[{date:'2026-09-01',type:'수입',amount:100},{date:'2026-09-02',type:'지출',amount:100},{date:'2026-10-01',type:'지출',amount:50}];
for(const mode of ['year','half']){
 vm.runInContext(`viewMode='${mode}';renderPeriod(rows)`,sandbox);
 const html=nodes.periodAnalysis.innerHTML;
 assert.equal((html.match(/<circle /g)||[]).length,4,'two populated months must have income and expense markers');
 assert.ok(html.includes('9월 수입 100원, 지출 100원'));assert.ok(html.includes('10월 수입 0원, 지출 50원'));
}
sandbox.rows=[{date:'2026-09-01',type:'지출',amount:0}];
vm.runInContext('renderPeriod(rows)',sandbox);
assert.equal((nodes.periodAnalysis.innerHTML.match(/<circle /g)||[]).length,2,'zero-valued transactions still count as entered');
assert.ok(!nodes.periodAnalysis.innerHTML.includes('NaN'));
const inline=[...fs.readFileSync('Index.html','utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
new vm.Script(inline);
assert.ok(inline.includes(fs.readFileSync('categories.js','utf8').replace(/^'use strict';\n/,'').trim()));
assert.ok(inline.includes('registered:rows.length>0||statusFor(key).uploaded.length>0'));
console.log('PASS: annual/half-year populated and zero-valued months; dependent categories; income without subcategory; legacy labels; inline bundle syntax/parity');

const app=fs.readFileSync('app.js','utf8');
vm.runInContext(app.slice(app.indexOf('function merchantName('),app.indexOf('function expenseSummaryRows(')),sandbox);
for(const name of ['네이버페이','네이버 페이','(주)네이버페이','토스페이','카카오페이','Naver Pay','TOSS PAY','KakaoPay','네이버페이_결제']){
 sandbox.merchantRows=[{description:name,amount:1},{description:name,amount:2}];
 const entries=vm.runInContext('merchantEntries(merchantRows)',sandbox);
 assert.equal(entries.length,2,name+' should stay separate');assert.ok(entries.every(e=>!e.name&&e.rows.length===1));
}
sandbox.merchantRows=[{description:'(주)신세계백화점강남점',amount:1},{description:'신세계백화점강남점',amount:2},{description:'신세계백화점본점',amount:3}];
const grouped=vm.runInContext('merchantEntries(merchantRows)',sandbox);
assert.equal(grouped.length,2);assert.equal(grouped[0].rows.length,2);assert.equal(grouped[1].rows.length,1);
assert.ok(inline.includes('if(name&&!isPaymentService(name))'));
console.log('PASS: payment services stay individual; ordinary merchant grouping and branch separation retained');
