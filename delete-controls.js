'use strict';
const baseTableForDelete=table;
table=function(rs,expense=true){return `<div class="table-wrap"><table><thead><tr><th>날짜</th><th>${expense?'분류 · 내용':'내용'}</th><th class="money">금액</th><th class="owner-cell">입력자</th></tr></thead><tbody>${rs.map(r=>`<tr><td>${r.date.slice(5).replace('-','.')}</td><td>${expense?`<strong>${escapeHtml(r.category)}${r.subcategory?' · '+escapeHtml(r.subcategory):''}</strong><span class="description">${escapeHtml(r.description)}</span>`:escapeHtml(r.description)}${r.memo?`<span class="memo">메모: ${escapeHtml(r.memo)}</span>`:''}</td><td class="money">${money(r.amount)}</td><td class="owner-cell"><span class="owner-actions">${badge(r)}<button class="delete-one" data-delete="${escapeHtml(r.id)}" aria-label="${escapeHtml(r.description+' 한 건 삭제')}" title="한 건 삭제">−</button></span></td></tr>`).join('')}</tbody></table></div>`};

function touchDeletedMonth(key,owner){const m=monthMeta[key]||statusFor(key);monthMeta[key]={...m,uploaded:(m.uploaded||[]).filter(o=>o!==owner),confirmed:false,updatedAt:new Date().toISOString()};}
function saveLocalDelete(message){localStorage.setItem('momo-ledger-state-v2',JSON.stringify({records,months:monthMeta}));localStorage.setItem(STORAGE,JSON.stringify(records));revision+=1;$('savedState').textContent='이 브라우저에 저장됨';$('notice').textContent=message;render();}
async function runDelete(op,message){if(shared){const state=await cloudCall('mutateLedger',{...op,revision});acceptState(state);$('savedState').textContent='공동 저장됨';$('notice').textContent=message;render();return}
if(op.kind==='deleteRecord'){const target=records.find(r=>r.id===op.id);if(!target)throw Error('삭제할 내역이 없어요.');records=records.filter(r=>r.id!==op.id);touchDeletedMonth(target.date.slice(0,7),target.owner);saveLocalDelete(message);return}
if(op.kind==='deleteOwner'){const affected=records.filter(r=>r.owner===op.owner);if(!affected.length)throw Error(op.owner+' 내역이 없어요.');for(const key of new Set(affected.map(r=>r.date.slice(0,7))))touchDeletedMonth(key,op.owner);records=records.filter(r=>r.owner!==op.owner);saveLocalDelete(message);return}
throw Error('지원하지 않는 삭제 작업이에요.');}

document.addEventListener('click',async e=>{const b=e.target.closest('[data-delete]');if(!b)return;e.preventDefault();e.stopPropagation();const r=records.find(x=>x.id===b.dataset.delete);if(!r)return;if(!confirm(`${r.date} · ${r.description} · ${money(r.amount)}\n이 내역 한 건을 삭제할까요?`))return;b.disabled=true;try{await runDelete({kind:'deleteRecord',id:r.id},'내역 한 건을 삭제했어요.')}catch(err){alert(err.message)}finally{b.disabled=false}} ,true);

$('deleteOwnerAll').onclick=async()=>{const owner=$('deleteOwner').value,count=records.filter(r=>r.owner===owner).length;if(!count){alert(owner+' 내역이 없어요.');return}if(!confirm(`${owner}가 올린 전체 내역 ${count}건을 모두 삭제할까요?\n모든 연월에서 삭제됩니다.`))return;const b=$('deleteOwnerAll');b.disabled=true;try{await runDelete({kind:'deleteOwner',owner},`${owner} 전체 내역 ${count}건을 삭제했어요.`)}catch(err){alert(err.message)}finally{b.disabled=false}};

render();
