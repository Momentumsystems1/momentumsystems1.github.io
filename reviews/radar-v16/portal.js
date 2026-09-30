(function(){
"use strict";
const R=window.RV, D=R.D, esc=R.esc, $=s=>document.querySelector(s), NEWS=window.NEWS||[];
const reports=[]; const USER=null;
const I=(n,c="ic")=>`<svg class="${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const fmtD=R.fmtD;
const today=new Date(); const HOY=`${String(today.getDate()).padStart(2,"0")}/${String(today.getMonth()+1).padStart(2,"0")}/${today.getFullYear()}`;
function toast(m){ const t=$("#toast"); t.textContent=m; t.classList.add("on"); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("on"),3200); }

async function api(path,opt={}){
 if(path==="/api/reports") {
  if(opt.method==="POST") {const r=JSON.parse(opt.body); reports.unshift({...r,created:Date.now()/1000});}
  return reports;
 }
 throw new Error("Servicio no disponible en esta versión de consulta.");
}
function newsCard(n){
  return `<article class="news"><div class="nmeta"><span class="pill offi">${I("badge-check","ic xs")} Fuente oficial enlazada</span><span class="norg">${esc(n.org)}</span><span class="ntipo">${esc(n.tipo)}</span><time>${fmtD(n.f)}</time></div>
  <h3><a href="${esc(n.u)}" target="_blank" rel="noopener">${esc(n.t)}</a></h3><p>${esc(n.r)}</p>
  <a class="nlink" href="${esc(n.u)}" target="_blank" rel="noopener">Leer en ${esc(n.org)} ${I("external-link","ic xs")}</a></article>`;
}


function gate(){ R.route(); closeSide(); }
window.addEventListener("hashchange",gate);
// ---------- sidebar (móvil) ----------
function closeSide(){ $("#side").classList.remove("on"); $("#sscrim").classList.remove("on"); }
$("#menuBtn").onclick=()=>{ $("#side").classList.add("on"); $("#sscrim").classList.add("on"); };
$("#sscrim").onclick=closeSide;

// ---------- vistas nuevas ----------
function panel(){
  const recent=D.certs.slice().sort((a,b)=>a.f<b.f?1:-1).slice(0,8);
  const own=D.groups.filter(g=>g.sols.includes(R.OWN));
  $("#view").innerHTML=`<div class="phead"><div><div class="eyebrow">Panel</div><h1>Resumen del mercado V16</h1><p class="lead">Consulta modelos, certificados y empresas. Abre una ficha para revisar sus relaciones y fuentes.</p></div>
   <a class="btn" href="#/informes">${I("file-down")} Generar informe</a></div>
  ${R.kpis()}
  <div class="quick">
   <a href="#/catalogo" class="qa">${I("layout-grid","fic")}<b>Catálogo</b><span>${D.groups.length} modelos y sus certificados</span></a>
   <a href="#/red" class="qa">${I("network","fic")}<b>Relaciones</b><span>Fabricante → titular → modelo → marca</span></a>
   <a href="#/informes" class="qa">${I("file-down","fic")}<b>Informes PDF</b><span>En segundos</span></a>
   <a href="#/noticias" class="qa">${I("newspaper","fic")}<b>Noticias oficiales</b><span>${NEWS.length} publicaciones con fuente</span></a>
  </div>
  <div class="pgrid">
   <section><div class="sec"><h3>Últimos certificados publicados</h3></div>
    <div class="tablewrap" style="max-height:none"><table><thead><tr><th>Fecha</th><th>Modelo</th><th>Marcas</th><th>Solicitante</th></tr></thead><tbody>${recent.map(c=>`<tr class="rowlink" data-open="grp::${c.g}"><td class="mono">${fmtD(c.f)}</td><td>${esc(c.mod)}</td><td>${esc(c.marcas.map(R.brandName).join(", "))}</td><td>${esc(c.sol)}</td></tr>`).join("")}</tbody></table></div>
    <div class="sec"><h3>Momentum Systems en el listado</h3></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">${own.map(g=>`<div class="card" data-open="grp::${g.id}">${R.imgHTML(g)}<div class="cb"><h3>${esc(g.mod)}</h3><div class="meta">${g.certs.length} cert. · ${g.marcas.length} marcas</div></div></div>`).join("")}</div>
   </section>
   <aside><div class="sec"><h3>Noticias oficiales</h3><a href="#/noticias">Ver todas</a></div><div class="newslist compact">${NEWS.slice(0,4).map(newsCard).join("")}</div></aside>
  </div>`;
  R.wireLinks($("#view"));
}

const RTYPES=[
 {t:"general",ic:"radar",n:"Informe general del mercado",d:"Resumen del listado DGT: fabricantes, solicitantes, concentración, certificados retirados y alertas."},
 {t:"grp",ic:"layout-grid",n:"Informe de modelo",d:"Un modelo físico con su fabricante, sus solicitantes, todas sus marcas y certificados."},
 {t:"fab",ic:"factory",n:"Informe de fabricante",d:"Todos los modelos, clientes y marcas de un fabricante, con su perfil."},
 {t:"sol",ic:"building-2",n:"Informe de solicitante",d:"Titular del certificado: estado registral, fabricantes proveedores y marcas."},
 {t:"brand",ic:"tags",n:"Informe de marca",d:"Quién fabrica la marca, quién la certifica, dónde se vende y a qué precio."},
 {t:"exp",ic:"folder-search",n:"Informe de expediente",d:"Los expedientes de análisis: Escudero Fijo, Kepar, Trophy, OSRAM, Hella, Limburg y Ledel."}];
function optsFor(t){
  if(t==="grp") return D.groups.map(g=>[g.id,`${g.mod} · ${g.fab}`]).sort((a,b)=>a[1].localeCompare(b[1]));
  if(t==="fab") return Object.keys(D.fabs).sort().map(k=>[k,k]);
  if(t==="sol") return Object.keys(D.sols).sort().map(k=>[k,k]);
  if(t==="brand") return Object.values(D.brands).map(b=>[b.k,b.n]).sort((a,b)=>a[1].localeCompare(b[1]));
  if(t==="exp") return R.DOS.map(d=>[d.id,d.titulo]);
  return [];
}
function informes(){
  $("#view").innerHTML=`<div class="phead"><div><div class="eyebrow">Herramientas</div><h1>Informes PDF</h1><p class="lead">Elige el tipo de informe y el objeto. El PDF se genera en tu navegador en unos segundos, con el formato de Momentum Systems y enlaces a los certificados oficiales.</p></div></div>
  <div class="rgrid">${RTYPES.map(r=>{ const o=optsFor(r.t);
    return `<article class="rcard">${I(r.ic,"fic")}<h3>${r.n}</h3><p>${r.d}</p>${o.length?`<label class="f"><span class="sr">Objeto del informe</span><input list="dl-${r.t}" data-rt="${r.t}" placeholder="Escribe para buscar (${o.length})"><datalist id="dl-${r.t}">${o.map(([k,l])=>`<option value="${esc(l)}"></option>`).join("")}</datalist></label>`:""}<button class="btn full" data-gen="${r.t}">${I("file-down")} Generar PDF</button><p class="ferr" data-err="${r.t}"></p></article>`;}).join("")}</div>
  <div class="sec"><h3>Informes de esta sesión</h3></div><div id="rhist" class="muted">Cargando…</div>`;
  document.querySelectorAll("[data-gen]").forEach(b=>b.onclick=()=>{ const t=b.dataset.gen; const e=$(`[data-err="${t}"]`); e.textContent="";
    if(t==="general") return RV_PDF("general","");
    const v=($(`[data-rt="${t}"]`).value||"").trim(); const hit=optsFor(t).find(([k,l])=>l===v)||optsFor(t).find(([k,l])=>l.toLowerCase().includes(v.toLowerCase())&&v);
    if(!hit){ e.textContent="Elige un valor de la lista."; return; } RV_PDF(t,hit[0]); });
  loadHist();
}
async function loadHist(){ const el=$("#rhist"); if(!el) return;
  try{ const r=await api("/api/reports"); el.innerHTML=r.length?`<div class="tablewrap" style="max-height:none"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Objeto</th></tr></thead><tbody>${r.map(x=>`<tr><td class="mono">${new Date(x.created*1000).toLocaleString("es-ES")}</td><td>${esc(x.tipo)}</td><td>${esc(x.objeto)}</td></tr>`).join("")}</tbody></table></div>`:"Todavía no has generado ningún informe.";
  }catch(e){ el.textContent="No se pudo cargar el historial."; } }

function noticias(){
  const orgs=[...new Set(NEWS.map(n=>n.org))];
  $("#view").innerHTML=`<div class="phead"><div><div class="eyebrow">Herramientas</div><h1>Noticias oficiales</h1><p class="lead">Solo publicaciones de organismos oficiales: DGT, BOE, La Moncloa y Revista DGT. Cada noticia enlaza a la fuente original. Selección del archivo recibido; no se actualiza automáticamente.</p></div></div>
  <div class="filters"><button class="chipbtn on" data-org="">Todas</button>${orgs.map(o=>`<button class="chipbtn" data-org="${esc(o)}">${esc(o)}</button>`).join("")}<span class="count" id="ncount"></span></div>
  <div class="newslist" id="nlist"></div>`;
  const draw=o=>{ const l=NEWS.filter(n=>!o||n.org===o); $("#nlist").innerHTML=l.map(newsCard).join(""); $("#ncount").textContent=l.length+" publicaciones"; };
  document.querySelectorAll("[data-org]").forEach(b=>b.onclick=()=>{ document.querySelectorAll("[data-org]").forEach(x=>x.classList.toggle("on",x===b)); draw(b.dataset.org); });
  draw("");
}
function metodologia(){
 $("#view").innerHTML=`<div class="phead"><div><div class="eyebrow">Fuentes y alcance</div><h1>Cómo interpretar el Radar</h1><p class="lead">Una base de consulta para preparar decisiones comerciales y técnicas.</p></div></div>
 <div class="method-grid"><section class="method-card"><h2>Fechas de la información</h2><p>El catálogo original indica un corte a 28/08/2026. Los análisis incorporados incluyen referencias a 26/09/2026. La fecha de generación de un PDF no implica una nueva comprobación de los datos.</p></section>
 <section class="method-card"><h2>Certificados y fuentes</h2><p>Las fichas enlazan a los documentos del archivo original. Antes de confirmar la vigencia de un modelo, consulta el listado actual de la DGT y el certificado correspondiente.</p><a href="https://www.dgt.es/muevete-con-seguridad/tecnologia-e-innovacion-en-carretera/Dispositivos-de-presenalizacion-V16/" target="_blank" rel="noopener">Consultar listado DGT ↗</a></section>
 <section class="method-card"><h2>Análisis y aspectos a revisar</h2><p>Las relaciones, observaciones y conclusiones proceden del material aportado. Son hipótesis de trabajo pendientes de contraste; no constituyen un dictamen sobre una empresa. El estado de una sociedad no determina por sí solo la validez de un certificado.</p></section>
 <section class="method-card"><h2>Uso en Momentum Workspace</h2><p>Esta versión permite revisar el Radar sin registro. El acceso de clientes y los permisos deben gestionarse desde el SaaS. El historial de informes dura únicamente mientras esta página está abierta.</p></section></div>`;
}
window.RV_EXTRA={panel,informes,noticias,metodologia};

// ---------- PDF ----------
const NAVY=[0,32,96], GRAYF=[242,242,242], BORD=[169,176,183], TXT=[26,34,51], RED=[198,40,40];
const clean=s=>String(s??"").replace(/[→⇒]/g,">").replace(/[‐‑]/g,"-").replace(/[^\x00-\xFF€–—‘’“”•…™]/g,"").replace(/\s+/g," ").trim();
function pdfDoc(kind,objeto,meta){
  const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:"mm",format:"a4"}); const W=210, M=14;
  // logo
  doc.setFillColor(...NAVY); doc.rect(M,12,11,11,"F"); doc.setDrawColor(255,255,255); doc.setLineWidth(.9);
  doc.line(M+2.3,23,M+2.3,15.8); doc.line(M+2.3,15.8,M+6.1,15.8); doc.line(M+6.1,15.8,M+6.1,23); doc.line(M+8.2,14,M+8.2,23); doc.line(M+4,23,M+4,17.6);
  doc.setTextColor(...NAVY); doc.setFont("helvetica","normal"); doc.setFontSize(11.5); doc.text("MOMENTUM SYSTEMS SL.",M+14,16.5); doc.setFontSize(9); doc.text("Momentum Systems",M+14+doc.getTextWidth("MOMENTUM SYSTEMS SL. ")*11.5/9,16.5);
  doc.setFontSize(8.5); doc.text("Calle Aviador Zorita, 13. 205 - 28020 Madrid – España",M+14,21.2);
  doc.setFontSize(8); doc.setTextColor(90,96,110); doc.text("Radar V16 · Informe de inteligencia",W-M,16.5,{align:"right"}); doc.text("BASE DE CONSULTA · CONTRASTAR FUENTES",W-M,21.2,{align:"right"});
  doc.setFontSize(8); doc.setTextColor(90,96,110); doc.text("Catálogo: 28/08/2026 | Análisis: 26/09/2026 | Sin actualización automática",M,28);
  // title
  doc.setTextColor(...NAVY); doc.setFontSize(30); doc.text("INFORME",M,40); const tw=doc.getTextWidth("INFORME "); doc.setFontSize(13); doc.text(clean(kind).toUpperCase(),M+tw*30/30+2,40);
  doc.setFontSize(14); doc.text(doc.splitTextToSize(clean(objeto),W-2*M-60).slice(0,2),W-M,33,{align:"right"});
  // acta grid
  doc.autoTable({startY:46,margin:{left:M,right:M},theme:"grid",head:[meta.map(x=>x[0])],body:[meta.map(x=>clean(x[1]))],
    styles:{font:"helvetica",fontSize:9,halign:"center",textColor:TXT,lineColor:BORD,lineWidth:.2,cellPadding:2.2},
    headStyles:{fillColor:GRAYF,textColor:NAVY,fontStyle:"normal",fontSize:8.5},bodyStyles:{fontSize:11,textColor:NAVY}});
  return doc;
}
function secT(doc,t){ let y=doc.lastAutoTable?doc.lastAutoTable.finalY+9:70; if(y>270){ doc.addPage(); y=20; }
  doc.setTextColor(...NAVY); doc.setFont("helvetica","normal"); doc.setFontSize(12); doc.text(clean(t).toUpperCase(),14,y); doc.setDrawColor(...NAVY); doc.setLineWidth(.35); doc.line(14,y+1.8,196,y+1.8); return y+4.5; }
function kv(doc,rows,title){ rows=rows.filter(r=>r[1]&&clean(r[1])&&!/^n\.a\.?$/i.test(clean(r[1]))); if(!rows.length) return; const y=secT(doc,title);
  doc.autoTable({startY:y,margin:{left:14,right:14},theme:"grid",body:rows.map(r=>[clean(r[0]),clean(r[1])]),
    styles:{fontSize:8.8,textColor:TXT,lineColor:BORD,lineWidth:.2,cellPadding:2,valign:"top"},columnStyles:{0:{cellWidth:44,fillColor:GRAYF,textColor:NAVY}}}); }
function table(doc,title,head,body,opts={}){ if(!body.length) return; const y=secT(doc,title);
  doc.autoTable({startY:y,margin:{left:14,right:14},theme:"grid",head:[head],body,
    styles:{fontSize:7.8,textColor:TXT,lineColor:BORD,lineWidth:.2,cellPadding:1.7,valign:"top",overflow:"linebreak"},headStyles:{fillColor:GRAYF,textColor:NAVY,fontStyle:"normal"},...opts}); }
function note(doc,title,lines,color=TXT){ lines=lines.filter(Boolean); if(!lines.length) return; let y=secT(doc,title)+2; doc.setFontSize(9);
  lines.forEach(l=>{ const t=doc.splitTextToSize("• "+clean(l),180); if(y+t.length*4.2>284){ doc.addPage(); y=20; } doc.setTextColor(...color); doc.text(t,14,y); y+=t.length*4.2+1.5; });
  doc.lastAutoTable={finalY:y-4}; }
function certRows(cs){ return cs.slice().sort((a,b)=>a.f<b.f?1:-1).map(c=>[c.c,fmtD(c.f),clean(c.mod),clean(c.marcas.map(R.brandName).join(", ")),clean(c.sol),clean(c.fab),c.x?("Contrato expirado sin renovación"):(c.e==="vigente"?"Vigente":"Vigencia finalizada")]); }
function certTable(doc,cs){ const rows=certRows(cs); const map={}; cs.forEach(c=>map[c.c]=c.pdf);
  table(doc,`Certificados (${cs.length})`,["Certificado","Fecha","Modelo","Marcas","Solicitante","Fabricante","Estado"],rows,{
    columnStyles:{0:{cellWidth:26,textColor:[39,66,120]},1:{cellWidth:17},6:{cellWidth:27}},
    didParseCell:d=>{ if(d.section==="body"&&d.column.index===6&&/expirado|finalizada/.test(d.cell.raw)) d.cell.styles.textColor=RED; },
    didDrawCell:d=>{ if(d.section==="body"&&d.column.index===0&&map[d.cell.raw]) d.doc.link(d.cell.x,d.cell.y,d.cell.width,d.cell.height,{url:map[d.cell.raw]}); }}); }
function chainLines(cs){ const T={}; cs.forEach(c=>{ ((T[c.fab]=T[c.fab]||{})[c.sol]=T[c.fab][c.sol]||{}); const g=T[c.fab][c.sol][c.mod]=T[c.fab][c.sol][c.mod]||new Set(); c.marcas.forEach(m=>g.add(R.brandName(m)+(c.x?" (X, contrato expirado)":""))); });
  const out=[]; Object.entries(T).forEach(([f,S])=>{ out.push(["Fabricante",f]); Object.entries(S).forEach(([s,G])=>{ out.push(["   Solicitante",s]); Object.entries(G).forEach(([g,B])=>{ out.push(["      Modelo",g]); out.push(["         Marcas",[...B].join(", ")]); }); }); }); return out; }
function chainTable(doc,cs){ const rows=chainLines(cs); if(rows.length>120) return; table(doc,"Cadena: fabricante > solicitante > modelo > marcas",["Nivel","Actor"],rows.map(r=>[r[0],clean(r[1])]),{columnStyles:{0:{cellWidth:34,fillColor:GRAYF,textColor:NAVY}},showHead:false}); }
const cut=(x,n)=>{x=clean(x); if(x.length<=n) return x; return x.slice(0,x.lastIndexOf(" ",n))+" …";};
function brandTable(doc,keys){ const rows=[...keys].map(k=>D.brands[k]).filter(Boolean).map(b=>[clean(b.n),clean(b.online),cut(b.canales,130),cut(b.precio,130)]);
  table(doc,`Marcas y venta online (${rows.length})`,["Marca","Online","Canales","Precio observado"],rows,{columnStyles:{0:{cellWidth:34},1:{cellWidth:16}}}); }
function profile(doc,name,p,title){ const o=R.OVR[name]||{}; if(!p&&!o.estado) return; p=p||{};
  kv(doc,[["Nombre legal",p.nombre_legal],["Identificación fiscal",p.id_fiscal],["Estado",o.estado||p.estado],["Constitución",p.constitucion],["Domicilio",p.domicilio],["Actividad",p.actividad],["Capital",p.capital],["Ventas",p.ventas],["Empleados",p.empleados],["Administradores",p.administradores],["Eventos registrales",p.eventos&&p.eventos.slice(0,700)],["Web",p.web],["Actividad V16",p.v16],["Venta online",p.venta_online],["Alertas",p.alertas],["Fuente principal",o.estado_url||p.fuente_principal]],title); }
function sources(doc,cs,extra=[]){ const u=["https://www.dgt.es/muevete-con-seguridad/tecnologia-e-innovacion-en-carretera/Dispositivos-de-presenalizacion-V16/",...extra,...cs.slice(0,40).map(c=>c.pdf)]; const uniq=[...new Set(u.filter(Boolean))];
  table(doc,"Fuentes",["URL"],uniq.map(x=>[x]),{styles:{fontSize:7,textColor:[39,66,120],lineColor:BORD,lineWidth:.2,cellPadding:1.3},showHead:false,
    didDrawCell:d=>{ if(d.section==="body") d.doc.link(d.cell.x,d.cell.y,d.cell.width,d.cell.height,{url:d.cell.raw}); }}); }
function footer(doc){ const n=doc.getNumberOfPages(); for(let i=1;i<=n;i++){ doc.setPage(i); doc.setDrawColor(...BORD); doc.setLineWidth(.2); doc.line(14,288,196,288); doc.setFontSize(7.5); doc.setTextColor(110,116,130);
  doc.text(clean(`Generado por Radar V16 para ${USER?USER.nombre:""}${USER&&USER.empresa?" ("+USER.empresa+")":""} · ${HOY} · Datos DGT a 28/08/2026`),14,292); doc.text(`Página ${i} de ${n}`,196,292,{align:"right"}); } }

function build(t,k){
  const genBy=clean(USER?USER.nombre:"");
  if(t==="grp"){ const g=R.grpBy[k], cs=D.certs.filter(c=>c.g===k), a=R.agg(cs);
    const doc=pdfDoc("de modelo",g.mod,[["Fecha",HOY],["Fabricante",g.fab],["Certificados",a.n],["Marcas",a.brands.size],["Solicitantes",a.sols.size]]);
    kv(doc,[["Modelo",g.mod],["Fabricante",g.fab],["Solicitantes",[...a.sols].join(", ")],["Primer certificado",fmtD(g.first)],["Vigentes",`${a.vig} de ${a.n}`],["Foto",g.img?`${g.img.fuente||""} ${g.img.page||""}`:"Sin foto pública verificada"]],"Resumen");
    note(doc,"Alertas",cs.filter(c=>c.x).map(c=>`${R.brandName(c.marca)}: ${c.x} (${c.c}).`),RED);
    chainTable(doc,cs); brandTable(doc,a.brands); certTable(doc,cs); sources(doc,cs,g.img?[g.img.page]:[]); return [doc,"Modelo",g.mod]; }
  if(t==="fab"){ const cs=R.byFab(k), a=R.agg(cs), F=D.fabs[k]||{};
    const doc=pdfDoc("de fabricante",k,[["Fecha",HOY],["País",R.ccLabel(F.pais||"")],["Certificados",a.n],["Modelos",a.grps.size],["Marcas",a.brands.size],["Clientes",a.sols.size]]);
    kv(doc,[["Fabricante",k],["País",F.pais],["Dirección declarada",cs[0]&&cs[0].fdir],["Clientes (solicitantes)",[...a.sols].join(", ")],["Modelos",[...a.grps].map(i=>R.grpBy[i].mod).join(", ")]],"Resumen");
    profile(doc,k,F.p,"Perfil de empresa"); chainTable(doc,cs); brandTable(doc,a.brands); certTable(doc,cs); sources(doc,cs); return [doc,"Fabricante",k]; }
  if(t==="sol"){ const cs=R.bySol(k), a=R.agg(cs), S=D.sols[k]||{};
    const doc=pdfDoc("de solicitante",k,[["Fecha",HOY],["País",R.ccLabel(S.pais||"")],["Certificados",a.n],["Retirados",a.n-a.vig],["Marcas",a.brands.size],["Fabricantes",a.fabs.size]]);
    kv(doc,[["Solicitante",k],["País",S.pais],["Dirección en el certificado",S.dir],["Fabricantes proveedores",[...a.fabs].join(", ")],["Modelos",[...a.grps].map(i=>R.grpBy[i].mod).join(", ")]],"Resumen");
    profile(doc,k,S.p,"Estado y perfil de la empresa"); note(doc,"Alertas",cs.filter(c=>c.x).map(c=>`${R.brandName(c.marca)}: ${c.x} (${c.c}).`),RED);
    chainTable(doc,cs); brandTable(doc,a.brands); certTable(doc,cs); sources(doc,cs,[S.p&&S.p.fuente_principal].filter(x=>x&&x.startsWith("http"))); return [doc,"Solicitante",k]; }
  if(t==="brand"){ const B=D.brands[k]||{n:k}, cs=R.byBrand(k), a=R.agg(cs);
    const doc=pdfDoc("de marca",B.n,[["Fecha",HOY],["Venta online",B.online||"n.d."],["Certificados",a.n],["Modelos",a.grps.size],["Fabricantes",a.fabs.size]]);
    kv(doc,[["Marca",B.n],["Venta online",B.online],["Canales",B.canales],["Precio observado",B.precio],["Web propia",B.web],["Fabricante(s)",[...a.fabs].join(", ")],["Solicitante(s)",[...a.sols].join(", ")],["Modelos",[...a.grps].map(i=>R.grpBy[i].mod).join(", ")],["Notas",B.notas]],"Resumen");
    note(doc,"Alertas",cs.filter(c=>c.x).map(c=>`${c.x}: ${c.sol}, modelo ${c.mod} (${c.c}). El certificado sigue publicado en la DGT, pero la relación comercial ha terminado.`),RED);
    chainTable(doc,cs); certTable(doc,cs); sources(doc,cs,(B.urls||[])); return [doc,"Marca",B.n]; }
  if(t==="exp"){ const d=R.DOS.find(x=>x.id===k); const f=d.filtro; const cs=D.certs.filter(c=>(f.fab&&f.fab.includes(c.fab))||(f.sol&&f.sol.includes(c.sol))); const a=R.agg(cs);
    const doc=pdfDoc("de expediente",d.titulo,[["Fecha",HOY],["Certificados",a.n],["Modelos",a.grps.size],["Marcas",a.brands.size],["Solicitantes",a.sols.size]]);
    kv(doc,[["Expediente",d.titulo],["Enfoque",d.sub],...d.claves],"Datos clave");
    const tmp=document.createElement("div"); tmp.innerHTML=d.html; const paras=[...tmp.querySelectorAll("p,li")].map(e=>e.textContent).filter(x=>x.trim());
    const links=[...tmp.querySelectorAll("a[href]")].map(e=>e.href);
    note(doc,"Análisis",paras); chainTable(doc,cs); brandTable(doc,a.brands); certTable(doc,cs); sources(doc,cs,links); return [doc,"Expediente",d.titulo]; }
  // general
  const a=R.agg(D.certs); const fabs=Object.keys(D.fabs).map(f=>[f,R.byFab(f)]).sort((x,y)=>y[1].length-x[1].length);
  const sols=Object.keys(D.sols).map(s=>[s,R.bySol(s)]).sort((x,y)=>y[1].length-x[1].length);
  const cn=D.certs.filter(c=>R.cc(c.fp)==="cn").length;
  const doc=pdfDoc("general","Mercado V16 homologado por la DGT",[["Fecha",HOY],["Certificados",a.n],["Vigentes",a.vig],["Modelos",D.groups.length],["Marcas",Object.keys(D.brands).length],["Hecho en China/HK",Math.round(cn/a.n*100)+" %"]]);
  table(doc,"Fabricantes por número de certificados",["Fabricante","País","Cert.","Modelos","Clientes"],fabs.map(([f,cs])=>{const g=R.agg(cs);return [clean(f),R.ccLabel((D.fabs[f]||{}).pais||""),g.n,g.grps.size,g.sols.size];}),{columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"}}});
  table(doc,"Solicitantes por número de certificados",["Solicitante","País","Cert.","Retirados","Marcas"],sols.map(([s,cs])=>{const g=R.agg(cs);return [clean(s),R.ccLabel((D.sols[s]||{}).pais||""),g.n,g.n-g.vig,g.brands.size];}),{columnStyles:{2:{halign:"right"},3:{halign:"right"},4:{halign:"right"}}});
  const top=D.groups.slice().sort((x,y)=>y.marcas.length-x.marcas.length).slice(0,15);
  table(doc,"Modelos con más marcas",["Modelo","Fabricante","Marcas","Cert."],top.map(g=>[clean(g.mod),clean(g.fab),g.marcas.length,g.certs.length]));
  note(doc,"Patrones detectados",["Red de sociedades británicas: Limburg, Ledel, Finder V16 y Zarvion concentran muchos certificados, con cuentas de sociedad durmiente o de reciente creación.","Chakesi, Jiming, Wilton y Tianqi suman la mayoría de los certificados; el CH-019 aparece bajo 48 marcas.","Hella HV16.1 y HV16.2 salen de Kepar (Zaragoza), pero HELLA V-16 SMART y SONNE V-16 salen de Foshan Sanmak (China).","Hangzhou Tiger fabrica la OSRAM y vende modelos V16 en Alibaba.","Guanxe y Geobaliza citan en la ficha Trophy un número de certificado que en la DGT pertenece a otro modelo."]);
  const ret=D.certs.filter(c=>c.e!=="vigente"); certTable(doc,ret);
  note(doc,"Noticias oficiales recientes",NEWS.slice(0,5).map(n=>`${fmtD(n.f)} · ${n.org}: ${n.t}. ${n.u}`));
  sources(doc,[],NEWS.map(n=>n.u)); return [doc,"General","Mercado V16"];
}
window.RV_PDF=function(t,k){
  if(!window.jspdf){ toast("No se pudo cargar el generador de PDF. Revisa la conexión."); return; }
  const t0=performance.now();
  try{ const [doc,tipo,obj]=build(t,k); footer(doc);
    const fn=`Radar-V16_${tipo}_${clean(obj).replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50)}.pdf`;
    doc.save(fn); toast(`Informe generado en ${((performance.now()-t0)/1000).toFixed(1)} s`);
    api("/api/reports",{method:"POST",body:JSON.stringify({tipo,objeto:obj})}).then(()=>{ if($("#rhist")) loadHist(); }).catch(()=>{});
  }catch(e){ console.error(e); toast("No se pudo generar el informe."); }
};

if(!location.hash||location.hash==="#/") history.replaceState(null,"","#/panel");
gate();
})();
