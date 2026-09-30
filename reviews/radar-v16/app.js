(function(){
"use strict";
const D = window.DATA, DOS = window.DOSSIERS;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const certBy = {}; D.certs.forEach(c => certBy[c.c] = c);
const grpBy = {}; D.groups.forEach(g => grpBy[g.id] = g);
const brandName = k => (D.brands[k] && D.brands[k].n) || k;
const OVR = {
  "LIMBURG TECHNOLOGY CO., LIMITED": {estado:"Activa (verificado 26/09/2026). Cuentas de sociedad durmiente a 31/07/2025. Avisos de disolución de 2025 retirados. Cambio de titular el 12/08/2026 (entra Qi Chen, >75 %)", estado_url:"https://find-and-update.company-information.service.gov.uk/company/14259827"},
  "LEDEL SOLUTIONS CO., LTD": {estado:"Activa. Cuentas de sociedad durmiente en 2024, 2025 y a 31/03/2026. Directora y titular: Xiulan Wang", estado_url:"https://find-and-update.company-information.service.gov.uk/company/14734987"},
  "Finder V16 Solution Limited": {estado:"Activa. Constituida el 06/04/2024; director y titular Xuan Zhang (Hubei). Sus certificados citan 291 Brighton Road (Croydon)", estado_url:"https://find-and-update.company-information.service.gov.uk/company/15621714"},
  "Distribuciones Escudero Fijo, S. L.": {estado:"OBSERVACIÓN DOCUMENTAL PENDIENTE DE CONTRASTE. Distribuidor declarado fabricante en 6 certificados LCOE; planta en Shenzhen sin razón social y con dos direcciones distintas bajo el mismo certificado", estado_url:"#/expediente/escudero"},
  "ZARVION LTD": {estado:"Activa. Constituida el 27/06/2025 con 1 £ de capital; el director cambió de Qiang Wang a Cheng Tong el 19/11/2025", estado_url:"https://find-and-update.company-information.service.gov.uk/company/16546544"}
};
const OWN="MOMENTUM SYSTEMS S.L.";
const NOPROF = new Set(["Zhejiang Langke Lighting Co., Ltd","Yuyao Jiming Electronic Co., Ltd + Ningbo Shenglin Electric Appliance Co., Ltd","Foshan Sanmak Lighting Co., Ltd + Zhongshan Jucar Electronic Technology Co., Ltd"]);

function cc(p){ p=(p||"").toUpperCase(); if(/CHINA|HONG/.test(p) && /ESPA|SPAIN/.test(p)) return "mx"; if(/CHINA|HONG/.test(p)) return "cn"; if(/ESPA|SPAIN/.test(p)) return "es"; return "ot"; }
function ccLabel(p){ const c=cc(p); if(c==="mx") return "España y China"; if(c==="cn") return /HONG/i.test(p)?"Hong Kong":"China"; if(c==="es") return "España"; const u=(p||"").toUpperCase(); if(/REINO|KINGDOM|UK/.test(u)) return "Reino Unido"; if(/ALEMAN|GERMAN/.test(u)) return "Alemania"; if(/SUIZA|SWITZ/.test(u)) return "Suiza"; if(/B[EÉ]LG/.test(u)) return "Bélgica"; if(/HOLAND|NETHER|PA[IÍ]SES/.test(u)) return "Países Bajos"; if(/ESTON/.test(u)) return "Estonia"; return p||"n.d."; }
const CCVAR = {cn:"var(--cn)",es:"var(--es)",ot:"var(--ot)",mx:"var(--mx)"};
function onl(s){ return s==="Sí"?"ok":(s==="Probable"?"warn":"none"); }
const ONCOL = {ok:"var(--ok)",warn:"var(--warn)",none:"var(--faint)"};
const fmtD = s => s ? s.split("-").reverse().join("/") : "";
const imgHTML = (g, cls="") => {
  if(g && g.img){ const ref = g.img.nivel==="marca"; return `<div class="ph ${cls}"><img loading="lazy" src="${g.img.src}" alt="Baliza ${esc(g.mod)}">${ref?'<span class="tag pill ref">Imagen de referencia</span>':''}${g.img.nivel==="oficial"?'<span class="tag pill offi">Foto oficial</span>':''}</div>`; }
  return `<div class="ph ${cls}"><div class="noimg"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 34a14 14 0 0 1 28 0"/><rect x="8" y="34" width="32" height="6" rx="2"/><path d="M24 8v6M12 13l3 4M36 13l-3 4"/></svg>Sin foto pública verificada</div></div>`;
};
const XSVG_S='<svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
function pdfLink(c){ return `<a class="mono" href="${esc(c.pdf)}" target="_blank" rel="noopener">${esc(c.c)}</a>`; }
function estadoPill(e,x){ if(x) return `<span class="pill bad">${XSVG_S} ${esc(x)}</span>`+(e==="vigente"?' <span class="pill ok">certificado vigente</span>':""); return e==="vigente"?'<span class="pill ok">vigente</span>':'<span class="pill bad">retirado</span>'; }

// ---------- aggregates ----------
function agg(certs){
  const fabs=new Set(), sols=new Set(), grps=new Set(), brands=new Set();
  certs.forEach(c=>{fabs.add(c.fab);sols.add(c.sol);grps.add(c.g);c.marcas.forEach(b=>brands.add(b));});
  return {fabs,sols,grps,brands,n:certs.length,vig:certs.filter(c=>c.e==="vigente").length};
}
const byFab = f => D.certs.filter(c=>c.fab===f);
const bySol = s => D.certs.filter(c=>c.sol===s);
const byBrand = k => D.certs.filter(c=>c.marcas.includes(k));
const byGrp = id => D.certs.filter(c=>c.g===id);

// ---------- árbol vertical ----------
const XSVG='<svg class="xm" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
function chain(certs){
  const T={};
  certs.forEach(c=>{
    const f=T[c.fab]=T[c.fab]||{n:0,cc:cc(c.fp),p:c.fp,s:{}}; f.n++;
    const so=f.s[c.sol]=f.s[c.sol]||{n:0,cc:cc(c.sp),p:c.sp,g:{}}; so.n++;
    const g=so.g[c.g]=so.g[c.g]||{n:0,b:{}}; g.n++;
    c.marcas.forEach(k=>{ const B=g.b[k]=g.b[k]||{n:0,x:0,msg:""}; B.n++; if(c.x){B.x++;B.msg=c.x;} });
  });
  const sortE=o=>Object.entries(o).sort((a,b)=>b[1].n-a[1].n);
  const node=(t,k,lbl,sub,dot,extra="")=>`<button class="vt-node vt-${t}" data-open="${t}::${esc(k)}"><span class="vt-lv">${{fab:"Fabricante",sol:"Solicitante",grp:"Modelo"}[t]}</span>${extra}<span class="vt-tx"><b>${dot?`<i class="dot" style="background:${CCVAR[dot]}"></i>`:""}${esc(lbl)}</b><small>${esc(sub)}</small></span></button>`;
  let h='<div class="vtree">';
  sortE(T).forEach(([fk,f])=>{
    h+=`<div class="vt-root">${node("fab",fk,fk,ccLabel(f.p)+" · "+f.n+" cert.",f.cc)}<ul>`;
    sortE(f.s).forEach(([sk,so])=>{
      h+=`<li>${node("sol",sk,sk,ccLabel(so.p)+" · "+so.n+" cert.",so.cc)}<ul>`;
      sortE(so.g).forEach(([gk,g])=>{
        const G=grpBy[gk]; const th=G.img?`<img class="vt-th" src="${G.img.src}" alt="">`:`<span class="vt-th vt-noth"></span>`;
        const brands=sortE(g.b); const xs=brands.filter(([k,B])=>B.x&&B.x===B.n);
        h+=`<li>${node("grp",gk,G.mod,g.n+" cert. · "+brands.length+" marcas","",th)}<div class="vt-leaves"><span class="vt-lv">Marcas</span><div class="chips">${brands.map(([k,B])=>{const bb=D.brands[k]; const X=B.x&&B.x===B.n;
          return `<span class="chip${X?" chip-x":""}" data-open="brand::${esc(k)}" title="${X?esc(B.msg):""}">${X?XSVG:`<span class="o" style="background:${ONCOL[onl(bb&&bb.online)]}"></span>`}${esc(brandName(k))}</span>`;}).join("")}</div>${xs.map(([k,B])=>`<p class="vt-xnote">${XSVG}<b>${esc(brandName(k))}</b>: ${esc(B.msg)}</p>`).join("")}</div></li>`;
      });
      h+='</ul></li>';
    });
    h+='</ul></div>';
  });
  h+='</div>';
  return `<div class="legend"><span><i style="background:var(--cn)"></i>China / Hong Kong</span><span><i style="background:var(--es)"></i>España</span><span><i style="background:var(--mx)"></i>España y China</span><span><i style="background:var(--ot)"></i>Otros países</span><span><i style="background:var(--ok)"></i>Marca vendida online</span><span><i style="background:var(--warn)"></i>Venta probable</span><span><i style="background:var(--faint)"></i>No encontrada</span><span class="lg-x">${XSVG}Relación terminada</span></div>${h}`;
}
function wireChain(){}

// ---------- drawer ----------
const stack=[];
function open(t,k,push=true){
  if(push) stack.push([t,k]);
  const body=$("#dbody"); let html="", crumb="";
  if(t==="grp"){ html=viewGroup(k); crumb="Modelo · "+grpBy[k].mod; }
  else if(t==="fab"){ html=viewFab(k); crumb="Fabricante · "+k; }
  else if(t==="sol"){ html=viewSol(k); crumb="Solicitante · "+k; }
  else if(t==="brand"){ html=viewBrand(k); crumb="Marca · "+brandName(k); }
  else if(t==="cert"){ const c=certBy[k]; stack.pop(); return open("grp",c.g); }
  body.innerHTML=html; body.scrollTop=0; $("#crumb").textContent=crumb;
  $("#back").style.visibility = stack.length>1?"visible":"hidden";
  $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden","false"); $("#scrim").classList.add("on");
  wireLinks(body); wireChain(body);
}
function closeD(){ stack.length=0; $("#drawer").classList.remove("on"); $("#drawer").setAttribute("aria-hidden","true"); $("#scrim").classList.remove("on"); }
$("#close").onclick=closeD; $("#scrim").onclick=closeD;
$("#back").onclick=()=>{ stack.pop(); const p=stack[stack.length-1]; if(p) open(p[0],p[1],false); else closeD(); };
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeD(); });
function wireLinks(root){ root.querySelectorAll("[data-open]").forEach(el=>el.addEventListener("click",e=>{ e.preventDefault(); const [t,...k]=el.dataset.open.split("::"); open(t,k.join("::")); })); }
const L = (t,k,label) => `<span class="linkish" data-open="${t}::${esc(k)}">${esc(label??k)}</span>`;

function certTable(certs){
  return `<div class="tablewrap" style="max-height:none"><table><thead><tr><th>Certificado</th><th>Fecha</th><th>Modelo</th><th>Marcas</th><th>Solicitante</th><th>Fabricante</th><th>Estado</th></tr></thead><tbody>${
    certs.slice().sort((a,b)=>a.f<b.f?1:-1).map(c=>`<tr><td>${pdfLink(c)}<br><span class="pill">${c.lab}</span></td><td class="mono">${fmtD(c.f)}</td><td>${L("grp",c.g,c.mod)}</td><td>${c.marcas.map(b=>L("brand",b,brandName(b))).join(", ")}</td><td>${L("sol",c.sol)}</td><td>${L("fab",c.fab)}</td><td>${estadoPill(c.e,c.x)}</td></tr>`).join("")
  }</tbody></table></div>`;
}
function brandChips(keys,cs){ const xk=new Set(); if(cs){ [...keys].forEach(k=>{const r=cs.filter(c=>c.marcas.includes(k)); if(r.length&&r.every(c=>c.x)) xk.add(k);}); }
  return `<div class="chips">${[...keys].sort((a,b)=>brandName(a).localeCompare(brandName(b))).map(k=>{const B=D.brands[k];return xk.has(k)?`<span class="chip chip-x" data-open="brand::${esc(k)}">${XSVG}${esc(brandName(k))}</span>`:`<span class="chip" data-open="brand::${esc(k)}"><span class="o" style="background:${ONCOL[onl(B&&B.online)]}"></span>${esc(brandName(k))}</span>`;}).join("")}</div>`;
}
function miniModels(ids){
  return `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${[...ids].map(id=>grpBy[id]).sort((a,b)=>b.certs.length-a.certs.length).map(g=>`<div class="card" data-open="grp::${g.id}">${imgHTML(g)}<div class="cb"><h3>${esc(g.mod)}</h3><div class="stats"><span><b>${g.certs.length}</b> cert.</span><span><b>${g.marcas.length}</b> marcas</span></div></div></div>`).join("")}</div>`;
}
function profileBlock(name, p){
  const o=OVR[name]||{}; if(NOPROF.has(name)) p=null;
  if(!p && !o.estado) return `<p class="note">Sin ficha registral pública localizada.</p>`;
  p=p||{};
  const f=(k)=>{ const v=o[k]??p[k]; return v && v!=="n.a." ? v : null; };
  const link=(v,u)=> u && /^http/.test(u) ? `${esc(v)} <a href="${esc(u)}" target="_blank" rel="noopener">(fuente)</a>` : esc(v);
  let rows=[["Nombre legal",f("nombre_legal")],["NIF / registro",f("id_fiscal")],["Estado",f("estado")&&link(f("estado"),f("estado_url")),1],["Constitución",f("constitucion")],["Domicilio",f("domicilio")],["Actividad",f("actividad")],["Capital",f("capital")],["Ventas",f("ventas")&&link(f("ventas"),f("ventas_url")),1],["Empleados",f("empleados")],["Administración",f("administradores")],["Eventos registrales",f("eventos")],["Web",f("web")&&(/^http/.test(f("web"))?`<a href="${esc(f("web"))}" target="_blank" rel="noopener">${esc(f("web"))}</a>`:esc(f("web"))),1],["Venta online",f("venta_online")]];
  let h=`<dl class="kv">${rows.filter(r=>r[1]).map(r=>`<dt>${r[0]}</dt><dd>${r[2]?r[1]:esc(r[1])}</dd>`).join("")}</dl>`;
  const al=f("alertas"); if(al) h+=`<div class="alert w"><b>Observaciones:</b> ${esc(al)}</div>`;
  if(p.fuente_principal && /^http/.test(p.fuente_principal)) h+=`<p class="note">Fuente principal: <a href="${esc(p.fuente_principal)}" target="_blank" rel="noopener">${esc(p.fuente_principal)}</a></p>`;
  return h;
}
function photoNote(g){
  if(!g.img) return `<p class="note">No hemos encontrado una foto pública fiable de este modelo. Los certificados PDF de la DGT no incluyen imágenes del producto.</p>`;
  const lvl = g.img.nivel==="oficial" ? "Foto oficial facilitada por el titular del certificado." : g.img.nivel==="marca" ? "Imagen de referencia de la marca: puede no corresponder exactamente a este número de modelo." : "Foto del producto publicada para este modelo o certificado.";
  return `<p class="note">${lvl} Origen: <a href="${esc(g.img.page)}" target="_blank" rel="noopener">${esc(g.img.fuente||new URL(g.img.page).hostname)}</a></p>`;
}
function viewGroup(id){
  const g=grpBy[id], cs=byGrp(id), a=agg(cs); const c0=cs[0];
  const multi = a.brands.size>1;
  return `<div class="hero">${imgHTML(g)}<div>
    <div class="eyebrow">Modelo físico${g.sols.includes(OWN)?' · <span class="own">Momentum Systems</span>':""}</div><h1>${esc(g.mod)}</h1>
    <dl class="kv"><dt>Fabricante</dt><dd>${L("fab",g.fab)} <span class="pill ${cc(c0.fp)}">${ccLabel(c0.fp)}</span></dd>
    <dt>Planta declarada</dt><dd>${esc(c0.fdir)}</dd>
    <dt>Solicitantes</dt><dd>${[...a.sols].map(s=>L("sol",s)).join(" · ")}</dd>
    <dt>Certificados</dt><dd><b>${a.n}</b> (${a.vig} vigentes${a.n-a.vig?`, <span style="color:var(--bad)">${a.n-a.vig} retirados</span>`:""})</dd>
    <dt>Marcas</dt><dd><b>${a.brands.size}</b> ${multi?'<span class="pill warn">marca blanca / multimarca</span>':''}</dd>
    <dt>Primer certificado</dt><dd class="mono">${fmtD(g.first)}</dd></dl>
    ${photoNote(g)}${cs.filter(c=>c.x).map(c=>`<div class="alert">${XSVG_S} <b>${esc(c.marca)}</b>: ${esc(c.x)} (${esc(c.c)}).</div>`).join("")}</div></div>
    <div class="sec"><h3>Cadena completa</h3><span>De arriba abajo: fabricante, solicitante, modelo y marcas. Toca cualquier nodo para abrir su ficha.</span></div>${chain(cs)}
    <div class="sec"><h3>Marcas con este modelo</h3><span>El color indica si la marca se vende online</span></div>${brandChips(a.brands,cs)}
    <div class="sec"><h3>Certificados</h3><span>Enlace al PDF oficial de la DGT</span></div>${certTable(cs)}`;
}
function viewFab(f){
  const cs=byFab(f), a=agg(cs), P=D.fabs[f]||{};
  const g0=[...a.grps].map(i=>grpBy[i]).find(g=>g.img);
  return `<div class="hero">${imgHTML(g0)}<div><div class="eyebrow">Fabricante</div><h1>${esc(f)}</h1>
   <dl class="kv"><dt>País</dt><dd><span class="pill ${cc(P.pais)}">${ccLabel(P.pais)}</span></dd><dt>Dirección en certificado</dt><dd>${esc(P.dir)}</dd>
   <dt>Certificados</dt><dd><b>${a.n}</b> (${a.vig} vigentes) · ${(a.n/D.certs.length*100).toFixed(1)} % del total</dd><dt>Modelos</dt><dd><b>${a.grps.size}</b></dd>
   <dt>Solicitantes</dt><dd>${[...a.sols].map(s=>`${L("sol",s)} (${cs.filter(c=>c.sol===s).length})`).join(" · ")}</dd><dt>Marcas</dt><dd><b>${a.brands.size}</b></dd></dl></div></div>
   <div class="sec"><h3>Estado público de la empresa</h3></div>${profileBlock(f,P.p)}
   <div class="sec"><h3>Cadena completa</h3><span>Fabricante, solicitante, modelo y marca</span></div>${chain(cs)}
   <div class="sec"><h3>Modelos</h3></div>${miniModels(a.grps)}
   <div class="sec"><h3>Marcas</h3></div>${brandChips(a.brands)}
   <div class="sec"><h3>Certificados</h3></div>${certTable(cs)}`;
}
function viewSol(s){
  const cs=bySol(s), a=agg(cs), P=D.sols[s]||{};
  const g0=[...a.grps].map(i=>grpBy[i]).find(g=>g.img);
  return `<div class="hero">${imgHTML(g0)}<div><div class="eyebrow">Solicitante (titular del certificado)${s===OWN?' · <span class="own">Tu empresa</span>':""}</div><h1>${esc(s)}</h1>
   <dl class="kv"><dt>País</dt><dd><span class="pill ${cc(P.pais)}">${ccLabel(P.pais)}</span></dd><dt>Dirección en certificado</dt><dd>${esc(P.dir)}</dd>
   <dt>Certificados</dt><dd><b>${a.n}</b> (${a.vig} vigentes)</dd><dt>Fabricantes</dt><dd>${[...a.fabs].map(f=>`${L("fab",f)} (${cs.filter(c=>c.fab===f).length})`).join(" · ")}</dd>
   <dt>Modelos / marcas</dt><dd><b>${a.grps.size}</b> modelos · <b>${a.brands.size}</b> marcas</dd></dl></div></div>
   <div class="sec"><h3>Estado público de la empresa</h3></div>${profileBlock(s,P.p)}
   <div class="sec"><h3>Cadena completa</h3></div>${chain(cs)}
   <div class="sec"><h3>Modelos</h3></div>${miniModels(a.grps)}
   <div class="sec"><h3>Marcas</h3></div>${brandChips(a.brands)}
   <div class="sec"><h3>Certificados</h3></div>${certTable(cs)}`;
}
function viewBrand(k){
  const B=D.brands[k]||{n:k}, cs=byBrand(k), a=agg(cs); const xg=new Set(cs.filter(c=>c.x).map(c=>c.g)); const g0=k==="RAYKONG"?null:[...a.grps].filter(i=>!xg.has(i)).map(i=>grpBy[i]).find(g=>g.img); const xc=cs.filter(c=>c.x);
  const st=onl(B.online);
  return `<div class="hero">${imgHTML(g0)}<div><div class="eyebrow">Marca comercial</div><h1>${esc(B.n)}</h1>
   <dl class="kv"><dt>Venta online</dt><dd><span class="pill ${st==="ok"?"ok":st==="warn"?"warn":""}">${esc(B.online||"n.d.")}</span></dd>
   <dt>Canales</dt><dd>${esc(B.canales||"n.d.")}</dd><dt>Precio observado</dt><dd>${esc(B.precio||"n.d.")}</dd>
   <dt>Web propia</dt><dd>${B.web&&/^http/.test(B.web)?`<a href="${esc(B.web)}" target="_blank" rel="noopener">${esc(B.web)}</a>`:esc(B.web||"n.d.")}</dd>
   <dt>Fabricante(s)</dt><dd>${[...a.fabs].map(f=>L("fab",f)).join(" · ")}</dd><dt>Solicitante(s)</dt><dd>${[...a.sols].map(s=>L("sol",s)).join(" · ")}</dd>
   <dt>Certificados</dt><dd><b>${a.n}</b></dd></dl>
   ${B.urls&&B.urls.length?`<div class="sec"><h3>Evidencia de venta</h3></div><ul class="prose">${B.urls.map(u=>`<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\//,"").slice(0,80))}</a></li>`).join("")}</ul>`:""}
   ${xc.map(c=>`<div class="alert">${XSVG_S} <b>${esc(c.x)}</b> · ${esc(c.sol)}, modelo ${esc(c.mod)} (${esc(c.c)}). El certificado sigue publicado en la DGT, pero la relación comercial ha terminado.</div>`).join("")}${B.notas?`<p class="note">${esc(B.notas)}</p>`:""}</div></div>
   <div class="sec"><h3>Cadena completa</h3></div>${chain(cs)}
   <div class="sec"><h3>Modelos con esta marca</h3></div>${miniModels(a.grps)}
   <div class="sec"><h3>Certificados</h3></div>${certTable(cs)}`;
}

// ---------- views ----------
const state={pais:"",lab:"",est:"",sol:"",sort:"certs",multi:false,foto:false,txt:""};
function kpis(){
  const a=agg(D.certs); const cn=D.certs.filter(c=>cc(c.fp)==="cn").length;
  return `<div class="kpis">
  <div class="kpi"><b>${a.n}</b><span>certificados (${a.vig} vigentes)</span></div>
  <div class="kpi"><b>${D.groups.length}</b><span>modelos físicos</span></div>
  <div class="kpi"><b>${Object.keys(D.brands).length}</b><span>marcas comerciales</span></div>
  <div class="kpi"><b>${a.fabs.size}</b><span>fabricantes declarados</span></div>
  <div class="kpi"><b>${a.sols.size}</b><span>solicitantes</span></div>
  <div class="kpi"><b>${Math.round(cn/a.n*100)} %</b><span>fabricado en China o Hong Kong</span></div></div>`;
}
function catalogo(){
  const sols=[...new Set(D.certs.map(c=>c.sol))].sort();
  $("#view").innerHTML=`<h1>Catálogo de modelos V16 conectados</h1><p class="lead">Cada tarjeta es un dispositivo físico, es decir, un modelo de un fabricante concreto. Ábrela para ver quién lo fabrica, quién es el titular del certificado, bajo cuántas marcas se vende, dónde se compra online y en qué estado está cada empresa.</p>${kpis()}
  <div class="filters">
   <select id="fp" aria-label="País del fabricante"><option value="">Fabricante: todos</option><option value="cn">China / Hong Kong</option><option value="es">España</option><option value="mx">España y China</option><option value="ot">Otros</option></select>
   <select id="fl" aria-label="Laboratorio"><option value="">Laboratorio: todos</option><option>IDIADA</option><option>LCOE</option></select>
   <select id="fe" aria-label="Estado"><option value="">Estado: todos</option><option value="ret">Con certificados retirados</option></select>
   <select id="fs" aria-label="Solicitante"><option value="">Solicitante: todos</option>${sols.map(s=>`<option>${esc(s)}</option>`).join("")}</select>
   <select id="so" aria-label="Ordenar"><option value="certs">Más certificados</option><option value="marcas">Más marcas</option><option value="fecha">Más recientes</option><option value="nombre">Nombre</option></select>
   <button class="chipbtn" id="fm">Solo multimarca</button><button class="chipbtn" id="ff">Solo con foto</button>
   <span class="count" id="cnt"></span></div><div class="grid" id="cards"></div>`;
  const sync=()=>{ $("#fp").value=state.pais;$("#fl").value=state.lab;$("#fe").value=state.est;$("#fs").value=state.sol;$("#so").value=state.sort;$("#fm").classList.toggle("on",state.multi);$("#ff").classList.toggle("on",state.foto); };
  sync();
  [["#fp","pais"],["#fl","lab"],["#fe","est"],["#fs","sol"],["#so","sort"]].forEach(([s,k])=>$(s).onchange=e=>{state[k]=e.target.value;draw();});
  $("#fm").onclick=()=>{state.multi=!state.multi;sync();draw();}; $("#ff").onclick=()=>{state.foto=!state.foto;sync();draw();};
  function draw(){
    let gs=D.groups.filter(g=>{ const cs=byGrp(g.id);
      if(state.pais && cc(g.fp)!==state.pais) return false;
      if(state.lab && !cs.some(c=>c.lab===state.lab)) return false;
      if(state.est==="ret" && !cs.some(c=>c.e!=="vigente")) return false;
      if(state.sol && !g.sols.includes(state.sol)) return false;
      if(state.multi && g.marcas.length<2) return false;
      if(state.foto && !g.img) return false; return true; });
    const so={certs:(a,b)=>b.certs.length-a.certs.length,marcas:(a,b)=>b.marcas.length-a.marcas.length,fecha:(a,b)=>a.first<b.first?1:-1,nombre:(a,b)=>a.mod.localeCompare(b.mod)}[state.sort];
    gs.sort(so);
    $("#cnt").textContent=`${gs.length} modelos`;
    $("#cards").innerHTML=gs.map(g=>{ const ret=byGrp(g.id).some(c=>c.e!=="vigente");
      return `<div class="card" data-open="grp::${g.id}" tabindex="0">${imgHTML(g)}<div class="cb"><div style="display:flex;gap:6px;flex-wrap:wrap"><span class="pill ${cc(g.fp)}">${ccLabel(g.fp)}</span>${ret?'<span class="pill bad">con retirados</span>':''}${g.sols.includes(OWN)?'<span class="pill own">Momentum</span>':''}</div><h3>${esc(g.mod)}</h3><div class="fab">${esc(g.fab)}</div><div class="fab">Titular: ${esc(g.sols.slice(0,2).join(", "))}${g.sols.length>2?" +"+(g.sols.length-2):""}</div><div class="stats"><span><b>${g.certs.length}</b> cert.</span><span><b>${g.marcas.length}</b> marcas</span><span><b>${g.sols.length}</b> solic.</span></div></div></div>`; }).join("");
    wireLinks($("#cards"));
    $("#cards").querySelectorAll(".card").forEach(c=>c.addEventListener("keydown",e=>{if(e.key==="Enter") c.click();}));
  }
  draw();
}
function liveFill(root,d){
  const set=new Set(); let cs=[];
  const pick=(f)=>D.certs.filter(c=>(f.fab&&f.fab.includes(c.fab))||(f.sol&&f.sol.includes(c.sol)));
  cs=pick(d.filtro); const a=agg(cs);
  root.querySelectorAll('[data-live="certs"]').forEach(e=>e.textContent=a.n);
  root.querySelectorAll('[data-live="modelos"]').forEach(e=>e.textContent=a.grps.size);
  root.querySelectorAll('[data-live="marcas"]').forEach(e=>e.textContent=a.brands.size);
  root.querySelectorAll('[data-live-fab]').forEach(e=>e.textContent=byFab(e.dataset.liveFab).length);
}
function expedientes(){
  $("#view").innerHTML=`<h1>Expedientes</h1><p class="lead">Análisis de los actores clave: quién fabrica de verdad, a nombre de quién está el certificado, cuántas marcas salen de cada dispositivo y en qué estado están las empresas. Cada afirmación enlaza a su fuente.</p>
  <div class="dgrid">${DOS.map(d=>{ const cs=D.certs.filter(c=>(d.filtro.fab&&d.filtro.fab.includes(c.fab))||(d.filtro.sol&&d.filtro.sol.includes(c.sol))); const a=agg(cs);
    return `<a class="dcard" href="#/expediente/${d.id}" style="text-decoration:none">${imgHTML(grpBy[d.foco])}<div class="cb"><div class="eyebrow">Expediente</div><h2>${esc(d.titulo)}</h2><p>${esc(d.sub)}</p><div class="stats"><span><b>${a.n}</b> cert.</span><span><b>${a.grps.size}</b> modelos</span><span><b>${a.brands.size}</b> marcas</span><span><b>${a.fabs.size}</b> fabr.</span></div></div></a>`;}).join("")}</div>`;
}
function expediente(id){
  const d=DOS.find(x=>x.id===id); if(!d) return expedientes();
  const f=d.filtro; let cs=D.certs.filter(c=>(f.fab&&f.fab.includes(c.fab))||(f.sol&&f.sol.includes(c.sol)));
  let ex=[]; if(d.extra){ ex=D.certs.filter(c=>(d.extra.fab&&d.extra.fab.includes(c.fab))||(d.extra.sol&&d.extra.sol.includes(c.sol))); }
  const a=agg(cs);
  $("#view").innerHTML=`<p><a href="#/expedientes">&larr; Todos los expedientes</a></p>
  <div class="hero hx">${imgHTML(grpBy[d.foco])}<div><div class="eyebrow">Expediente</div><h1>${esc(d.titulo)}</h1><p class="lead">${esc(d.sub)}</p>
  <div class="kpis k4"><div class="kpi"><b>${a.n}</b><span>certificados</span></div><div class="kpi"><b>${a.grps.size}</b><span>modelos</span></div><div class="kpi"><b>${a.brands.size}</b><span>marcas</span></div><div class="kpi"><b>${a.sols.size}/${a.fabs.size}</b><span>solicitantes / fabricantes</span></div></div></div></div>
  <div class="dlayout"><div><div class="prose" id="prose">${d.html}</div>
   <div class="sec"><h3>Cadena de ${esc(d.titulo)}</h3><span>Todos los certificados del expediente</span></div>${chain(cs)}
   ${ex.length?`<div class="sec"><h3>El fabricante con todos sus clientes</h3><span>${esc([...agg(ex).fabs].join(", "))}</span></div>${chain(ex)}`:""}
   <div class="sec"><h3>Modelos</h3></div>${miniModels(new Set([...a.grps,...agg(ex).grps]))}
   <div class="sec"><h3>Certificados</h3></div>${certTable(cs)}</div>
   <aside class="facts"><div class="eyebrow">Datos clave</div><dl>${d.claves.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
   <div class="sec"><h3>Fichas</h3></div><div class="chips">${[...a.sols].map(s=>`<span class="chip" data-open="sol::${esc(s)}">${esc(s)}</span>`).join("")}${[...new Set([...a.fabs,...agg(ex).fabs])].map(s=>`<span class="chip" data-open="fab::${esc(s)}">${esc(s)}</span>`).join("")}</div></aside></div>`;
  liveFill($("#view"),d); wireLinks($("#view")); wireChain($("#view"));
}
function tableView(title,lead,cols,rows,onRow){
  $("#view").innerHTML=`<h1>${title}</h1><p class="lead">${lead}</p><div class="filters"><input id="tf" placeholder="Filtrar…" aria-label="Filtrar tabla"><span class="count" id="cnt"></span></div><div class="tablewrap"><table><thead><tr>${cols.map((c,i)=>`<th data-i="${i}" class="${c.num?"num":""}">${c.h}</th>`).join("")}</tr></thead><tbody id="tb"></tbody></table></div>`;
  let sortI=cols.findIndex(c=>c.def), dir=-1, filt="";
  const draw=()=>{ let r=rows.filter(x=>!filt||x._s.includes(filt)); if(sortI>=0){ const c=cols[sortI]; r.sort((a,b)=>{const va=c.v(a),vb=c.v(b); return (va>vb?1:va<vb?-1:0)*dir;}); }
    $("#cnt").textContent=`${r.length} filas`; $("#tb").innerHTML=r.map(x=>`<tr class="rowlink" data-open="${esc(onRow(x))}">${cols.map(c=>`<td class="${c.num?"num":""}">${c.r?c.r(x):esc(c.v(x))}</td>`).join("")}</tr>`).join(""); wireLinks($("#tb")); };
  $("#view").querySelectorAll("th").forEach(th=>th.onclick=()=>{const i=+th.dataset.i; if(i===sortI) dir=-dir; else {sortI=i;dir=cols[i].num?-1:1;} draw();});
  $("#tf").oninput=e=>{filt=e.target.value.toLowerCase();draw();}; draw();
}
function fabricantes(){
  const max=Math.max(...Object.keys(D.fabs).map(f=>byFab(f).length));
  const rows=Object.values(D.fabs).map(F=>{const cs=byFab(F.n),a=agg(cs);return {F,a,_s:(F.n+" "+F.pais).toLowerCase()};});
  tableView("Fabricantes","Empresas que fabrican físicamente el dispositivo según el certificado. Haz clic en una fila para ver su cadena completa y su estado registral.",[
    {h:"Fabricante",v:x=>x.F.n,r:x=>`<b>${esc(x.F.n)}</b>`},{h:"País",v:x=>ccLabel(x.F.pais),r:x=>`<span class="pill ${cc(x.F.pais)}">${ccLabel(x.F.pais)}</span>`},
    {h:"Certificados",num:1,def:1,v:x=>x.a.n,r:x=>`${x.a.n}<div class="bar" style="width:${x.a.n/max*100}%"></div>`},{h:"Modelos",num:1,v:x=>x.a.grps.size},{h:"Solicitantes",num:1,v:x=>x.a.sols.size},{h:"Marcas",num:1,v:x=>x.a.brands.size},
    {h:"Principales clientes",v:x=>[...x.a.sols].join(", "),r:x=>esc([...x.a.sols].slice(0,3).join(" · "))+(x.a.sols.size>3?" …":"")}],rows,x=>"fab::"+x.F.n);
}
function solicitantes(){
  const rows=Object.values(D.sols).map(S=>{const cs=bySol(S.n),a=agg(cs);const o=OVR[S.n];const est=(o&&o.estado)||(S.p&&S.p.estado)||"n.a.";return {S,a,est,_s:(S.n+" "+S.pais+" "+est).toLowerCase()};});
  tableView("Solicitantes","Titulares del certificado ante la DGT, es decir, quien lo solicita y responde de él. No siempre coinciden con quien fabrica ni con la marca que ve el comprador.",[
    {h:"Solicitante",v:x=>x.S.n,r:x=>`<b>${esc(x.S.n)}</b>`},{h:"País",v:x=>ccLabel(x.S.pais),r:x=>`<span class="pill ${cc(x.S.pais)}">${ccLabel(x.S.pais)}</span>`},
    {h:"Certificados",num:1,def:1,v:x=>x.a.n},{h:"Retirados",num:1,v:x=>x.a.n-x.a.vig,r:x=>x.a.n-x.a.vig?`<span style="color:var(--bad)">${x.a.n-x.a.vig}</span>`:"0"},{h:"Fabricantes",v:x=>[...x.a.fabs].join(", "),r:x=>esc([...x.a.fabs].slice(0,2).join(" · "))+(x.a.fabs.size>2?" …":"")},{h:"Marcas",num:1,v:x=>x.a.brands.size},
    {h:"Estado registral",v:x=>x.est,r:x=>esc(x.est.length>70?x.est.slice(0,70)+"…":x.est)}],rows,x=>"sol::"+x.S.n);
}
function marcas(){
  const rows=Object.values(D.brands).map(B=>{const cs=byBrand(B.k),a=agg(cs);return {B,a,_s:(B.n+" "+B.fab+" "+B.sol+" "+B.canales+" "+B.online).toLowerCase()};});
  tableView("Marcas y venta online","Las 287 marcas que aparecen en los certificados, con el resultado de la comprobación de venta online, el canal y el precio observado. Escribe «sí», «probable» o «no encontrado» para filtrar por estado.",[
    {h:"Marca",v:x=>x.B.n,r:x=>`<b>${esc(x.B.n)}</b>`},{h:"Online",v:x=>x.B.online,r:x=>{const s=onl(x.B.online);return `<span class="pill ${s==="ok"?"ok":s==="warn"?"warn":""}">${esc(x.B.online)}</span>`;}},
    {h:"Cert.",num:1,def:1,v:x=>x.a.n},{h:"Fabricante",v:x=>x.B.fab},{h:"Solicitante",v:x=>x.B.sol},{h:"Canales",v:x=>x.B.canales||"",r:x=>esc((x.B.canales||"").slice(0,80))},{h:"Precio observado",v:x=>x.B.precio||"",r:x=>esc((x.B.precio||"").slice(0,90))}],rows,x=>"brand::"+x.B.k);
}
function alertas(){
  const ret=D.certs.filter(c=>c.e!=="vigente");
  const flags=Object.values(D.sols).map(S=>({S,o:OVR[S.n],p:S.p})).filter(x=>{const e=((x.o&&x.o.estado)||(x.p&&x.p.estado)||"").toLowerCase(); const al=(x.p&&x.p.alertas||"").toLowerCase(); return x.o || /disol|concurs|liquid|cierre|strike|durmiente|dormant/.test(e+" "+al);});
  $("#view").innerHTML=`<h1>Alertas</h1><p class="lead">Certificados retirados, señales registrales y patrones que merecen verificación antes de comprar, distribuir o firmar un acuerdo.</p>
  <div class="sec"><h3>Patrones detectados</h3></div>
  <div class="alert"><b>Red de sociedades británicas.</b> Limburg (106 certificados), Ledel (38), Finder V16 y Zarvion son sociedades británicas con cuentas de sociedad durmiente o de reciente creación, dirigidas por personas de nacionalidad china. Limburg y Finder comparten dirección, 291 Brighton Road (Croydon), y secretarios corporativos. ${L("sol","LIMBURG TECHNOLOGY CO., LIMITED","Ver Limburg")} · ${L("sol","Finder V16 Solution Limited","Ver Finder")}</div>
  <div class="alert"><b>Anomalía: distribuidor declarado fabricante.</b> Distribuciones Escudero Fijo figura como fabricante y solicitante en 6 certificados LCOE, con planta en Shenzhen sin razón social y dos direcciones distintas bajo el certificado 2024070677G1. <a href="#/expediente/escudero">Expediente Escudero Fijo</a></div>
  <div class="alert w"><b>El fabricante de marca vende también su propio modelo.</b> Hangzhou Tiger fabrica la OSRAM y vende modelos V16 en Alibaba a unos 11,7 USD, además de certificar TWL043 y TWL046 a través de Finder V16. <a href="#/expediente/osram">Expediente OSRAM</a></div>
  <div class="alert w"><b>Mensaje de "fabricado en España" y proveedor chino.</b> Hella HV16.1 y HV16.2 salen de Kepar (Zaragoza), pero HELLA V-16 SMART y SONNE V-16 salen de Foshan Sanmak (China). <a href="#/expediente/hella">Expediente Hella</a></div>
  <div class="alert w"><b>Número de certificado equivocado en tiendas.</b> Guanxe y Geobaliza citan IDIADA PC25020310 en la ficha Trophy, pero en la DGT ese número es un modelo Chakesi/Limburg. <a href="#/expediente/trophy">Expediente Trophy</a></div>
  <div class="alert w"><b>Concentración.</b> Chakesi, Jiming, Wilton y Tianqi suman el 59 % de los certificados. El modelo CH-019 aparece bajo 48 marcas y el V16IoT de Jiming bajo 34.</div>
  <div class="sec"><h3>Certificados retirados (${ret.length})</h3></div>${certTable(ret)}
  <div class="sec"><h3>Señales registrales por solicitante</h3></div>
  <div class="tablewrap" style="max-height:none"><table><thead><tr><th>Solicitante</th><th>Cert.</th><th>Estado / observación</th></tr></thead><tbody>${flags.map(x=>`<tr class="rowlink" data-open="sol::${esc(x.S.n)}"><td><b>${esc(x.S.n)}</b></td><td class="num">${x.S.certs.length}</td><td>${esc(((x.o&&x.o.estado)||(x.p&&x.p.estado)||"")+(x.p&&x.p.alertas?" · "+x.p.alertas.slice(0,240)+"…":""))}</td></tr>`).join("")}</tbody></table></div>`;
  wireLinks($("#view"));
}
function red(){
  $("#view").innerHTML=`<h1>Red fabricante y solicitante</h1><p class="lead">Los círculos son fabricantes y los cuadrados, solicitantes. El tamaño es proporcional a los certificados y el grosor de la línea, a los certificados compartidos. Arrastra para mover, usa la rueda para ampliar y haz clic para abrir la ficha.</p>
  <div class="legend"><span><i style="background:var(--cn)"></i>China / Hong Kong</span><span><i style="background:var(--es)"></i>España</span><span><i style="background:var(--mx)"></i>España y China</span><span><i style="background:var(--ot)"></i>Otros (Reino Unido, Alemania…)</span></div><svg id="net"></svg><div class="tt" id="tt"></div>`;
  if(!window.d3){ $("#net").outerHTML='<p class="note">No se pudo cargar la librería de gráficos.</p>'; return; }
  const nodes=[], nb={}, links={};
  D.certs.forEach(c=>{
    const f="f|"+c.fab, s="s|"+c.sol;
    if(!nb[f]){nb[f]={id:f,t:"fab",k:c.fab,n:0,cc:cc(c.fp)};nodes.push(nb[f]);} nb[f].n++;
    if(!nb[s]){nb[s]={id:s,t:"sol",k:c.sol,n:0,cc:cc(c.sp)};nodes.push(nb[s]);} nb[s].n++;
    const lk=f+"~"+s; links[lk]=links[lk]||{source:f,target:s,v:0}; links[lk].v++;
  });
  const L2=Object.values(links); const svg=d3.select("#net"); const el=document.getElementById("net");
  const W=el.clientWidth, H=el.clientHeight; svg.attr("viewBox",[0,0,W,H]);
  const g=svg.append("g"); svg.call(d3.zoom().scaleExtent([.3,4]).on("zoom",e=>g.attr("transform",e.transform)));
  const r=d=>4+Math.sqrt(d.n)*2.6; const col=d=>getComputedStyle(document.documentElement).getPropertyValue("--"+d.cc).trim();
  const sim=d3.forceSimulation(nodes).force("link",d3.forceLink(L2).id(d=>d.id).distance(d=>60+20/Math.sqrt(d.v)).strength(.6)).force("charge",d3.forceManyBody().strength(-90)).force("x",d3.forceX(W/2).strength(.07)).force("y",d3.forceY(H/2).strength(.1)).force("col",d3.forceCollide().radius(d=>r(d)+4));
  const accent=getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const link=g.append("g").selectAll("line").data(L2).join("line").attr("stroke",accent).attr("stroke-opacity",.35).attr("stroke-width",d=>Math.min(1+d.v*.25,12));
  const node=g.append("g").selectAll("g").data(nodes).join("g").style("cursor","pointer").call(d3.drag().on("start",(e,d)=>{if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;}).on("drag",(e,d)=>{d.fx=e.x;d.fy=e.y;}).on("end",(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}));
  node.each(function(d){ const s=d3.select(this); if(d.t==="fab") s.append("circle").attr("r",r(d)).attr("fill",col(d)).attr("fill-opacity",.85); else s.append("rect").attr("x",-r(d)).attr("y",-r(d)).attr("width",r(d)*2).attr("height",r(d)*2).attr("rx",3).attr("fill",col(d)).attr("fill-opacity",.35).attr("stroke",col(d)).attr("stroke-width",1.5); });
  node.filter(d=>d.n>=6).append("text").attr("dy",d=>r(d)+11).attr("text-anchor","middle").text(d=>d.k.length>28?d.k.slice(0,27)+"…":d.k);
  const tt=$("#tt");
  node.on("mousemove",(e,d)=>{tt.style.display="block";tt.style.left=(e.clientX+12)+"px";tt.style.top=(e.clientY+12)+"px";tt.innerHTML=`<b>${esc(d.k)}</b><br>${d.t==="fab"?"Fabricante":"Solicitante"} · ${d.n} certificados`;}).on("mouseleave",()=>tt.style.display="none").on("click",(e,d)=>{tt.style.display="none";open(d.t,d.k);});
  sim.on("tick",()=>{ link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y).attr("x2",d=>d.target.x).attr("y2",d=>d.target.y); node.attr("transform",d=>`translate(${d.x},${d.y})`); });
}

// ---------- search ----------
const IDX=[];
D.groups.forEach(g=>IDX.push({t:"grp",k:g.id,l:g.mod,s:g.fab,img:g.img&&g.img.src,x:(g.mod+" "+g.fab).toLowerCase()}));
Object.values(D.brands).forEach(b=>IDX.push({t:"brand",k:b.k,l:b.n,s:"Marca · "+(b.online||""),x:b.n.toLowerCase()}));
Object.keys(D.fabs).forEach(f=>IDX.push({t:"fab",k:f,l:f,s:"Fabricante",x:f.toLowerCase()}));
Object.keys(D.sols).forEach(f=>IDX.push({t:"sol",k:f,l:f,s:"Solicitante",x:f.toLowerCase()}));
D.certs.forEach(c=>IDX.push({t:"cert",k:c.c,l:c.c,s:c.mod+" · "+c.marca,x:(c.c+" "+c.c.replace(/\s/g,"")).toLowerCase()}));
const TL={grp:"Modelo",brand:"Marca",fab:"Fabricante",sol:"Solicitante",cert:"Certificado"};
const q=$("#q"), sg=$("#suggest"); let act=-1, cur=[];
q.addEventListener("input",()=>{ const v=q.value.trim().toLowerCase(); act=-1; if(v.length<2){sg.classList.remove("on");return;}
  cur=IDX.filter(i=>i.x.includes(v)).sort((a,b)=>(a.x.startsWith(v)?0:1)-(b.x.startsWith(v)?0:1)).slice(0,14);
  sg.innerHTML=cur.length?cur.map((i,n)=>`<div class="sg" data-n="${n}" role="option"><span class="k">${TL[i.t]}</span>${i.img?`<img src="${i.img}" alt="">`:""}<div><div>${esc(i.l)}</div><div style="font-size:var(--text-xs);color:var(--muted)">${esc(i.s)}</div></div></div>`).join(""):`<div class="sg">Sin resultados para «${esc(q.value)}»</div>`;
  sg.classList.add("on"); sg.querySelectorAll(".sg[data-n]").forEach(el=>el.onclick=()=>pickS(+el.dataset.n)); });
q.addEventListener("keydown",e=>{ const items=sg.querySelectorAll(".sg[data-n]"); if(e.key==="ArrowDown"){act=Math.min(act+1,items.length-1);} else if(e.key==="ArrowUp"){act=Math.max(act-1,0);} else if(e.key==="Enter"){ if(cur.length) pickS(act<0?0:act); return;} else return; e.preventDefault(); items.forEach((el,i)=>el.classList.toggle("act",i===act)); });
document.addEventListener("click",e=>{ if(!e.target.closest(".searchwrap")) sg.classList.remove("on"); });
function pickS(n){ const i=cur[n]; if(!i) return; sg.classList.remove("on"); q.value=""; open(i.t,i.k); }

// ---------- theme & router ----------
$("#theme").onclick=()=>{ const h=document.documentElement; h.dataset.theme=h.dataset.theme==="dark"?"light":"dark"; $("#theme use").setAttribute("href",h.dataset.theme==="dark"?"#i-sun":"#i-moon"); if(location.hash.startsWith("#/red")) red(); };
const VIEWS={catalogo,expedientes,red,fabricantes,solicitantes,marcas,alertas};
function route(){ closeD();
  const h=location.hash.replace(/^#\/?/,"")||"panel"; const [p,arg]=h.split("/");
  const t=p==="expediente"?"expedientes":p;
  document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("on",a.dataset.t===t));
  const X=window.RV_EXTRA||{};
  (X[p]||VIEWS[p]||(p==="expediente"?()=>expediente(arg):(X.panel||catalogo)))(arg);
  window.scrollTo(0,0);
}
$("#dpdf").onclick=()=>{ const cur=stack[stack.length-1]; if(cur&&window.RV_PDF) window.RV_PDF(cur[0],cur[1]); };
window.RV={D,DOS,agg,byFab,bySol,byBrand,grpBy,certBy,brandName,OVR,OWN,ccLabel,cc,fmtD,esc,open,closeD,route,kpis,imgHTML,wireLinks,onl};
})();
