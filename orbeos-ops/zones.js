/* ORBEOS OPS · independent multizone + two-orbit controller. Public sources only. */
(() => {
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cities=[
{id:'barcelona',name:'Barcelona',lat:41.3874,lon:2.1686},
{id:'madrid',name:'Madrid',lat:40.4168,lon:-3.7038},
{id:'valencia',name:'Valencia',lat:39.4699,lon:-0.3763},
{id:'sevilla',name:'Sevilla',lat:37.3891,lon:-5.9845},
{id:'bilbao',name:'Bilbao',lat:43.263,lon:-2.935},
{id:'zaragoza',name:'Zaragoza',lat:41.6488,lon:-0.8891},
{id:'malaga',name:'Málaga',lat:36.7213,lon:-4.4214},
{id:'tarragona',name:'Tarragona',lat:41.1189,lon:1.2445},
{id:'girona',name:'Girona',lat:41.9794,lon:2.8214},
{id:'granada',name:'Granada',lat:37.1773,lon:-3.5986}
];
const st={zones:[],active:'barcelona',maps:new Map(),markers:new Map(),running:false,paused:false,changes:[],generation:0};
const mapStyle={version:8,sources:{base:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png','https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO'}},layers:[{id:'bg',type:'background',paint:{'background-color':'#0a1d42'}},{id:'base',type:'raster',source:'base'}]};
function zone(id){return st.zones.find(z=>z.id===id)}
function age(ts){if(!ts)return 'pendiente';const m=Math.max(0,Math.floor((Date.now()-ts)/60000));return m<1?'ahora':m<60?m+' min':Math.floor(m/60)+' h'}
function status(z){return z.status==='real'?'FEED':z.status==='loading'?'CONSULTANDO':'NO DISPONIBLE'}
function persist(){localStorage.setItem('orbeosOpsZones',JSON.stringify(st.zones.map(z=>z.id)))}
function insertUI(){
const section=document.createElement('section');section.id='opsWatch';section.className='ops-watch';
section.innerHTML='<header class="ops-head"><div><h2><i class="ops-green"></i>Centro de operaciones · Multizona</h2><p>Vigilancia de varias zonas a la vez · DGT / SCT / Madrid · Sin telemetría inventada</p></div><div class="ops-controls"><span id="opsCount" class="ops-counter">4 zonas</span><select id="opsCity" aria-label="Añadir ciudad"><option value="">Añadir ciudad…</option></select><button id="opsAdd" class="ops-button primary">+ Zona</button><button id="opsRefresh" class="ops-button">↻ Actualizar</button><button id="opsPause" class="ops-button">Ⅱ Pausar</button></div></header><div class="ops-status"><span id="opsHealth">Comprobando fuentes...</span><span>Revisión automática cada 3 min · datos y fuentes identificados</span></div><div id="opsGrid" class="ops-grid" aria-live="polite"></div><div id="opsChanges" class="ops-alerts" hidden></div><div class="ops-footer"><span>FEED = servicio público comprobado</span><span>NO DISPONIBLE ≠ cero incidencias</span><span>Vehículos sin telemetría: DEMO</span><button id="opsMap" class="ops-button">Abrir mapa principal →</button></div>';
const row=document.querySelector('.kpi-row');if(!row)return;row.insertAdjacentElement('afterend',section);
const select=$('opsCity');cities.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.name;select.append(o)});
const nav=document.createElement('button');nav.className='ops-narrow-nav';nav.innerHTML='<span>▦</span> Vigilancia multizona';
document.querySelector('.side-nav #mainNav')?.prepend(nav);
nav.addEventListener('click',()=>{$('opsWatch').scrollIntoView({behavior:'smooth',block:'start'})});
$('opsAdd').addEventListener('click',add);
$('opsRefresh').addEventListener('click',()=>void refresh(true));
$('opsPause').addEventListener('click',()=>{st.paused=!st.paused;$('opsPause').textContent=st.paused?'▶ Reanudar':'Ⅱ Pausar';if(!st.paused)void refresh(true);else $('opsHealth').textContent='Vigilancia periódica pausada'});
$('opsMap').addEventListener('click',showMain);
$('opsGrid').addEventListener('click',e=>{const b=e.target.closest('[data-ops]');if(!b)return;const id=b.dataset.id;if(b.dataset.ops==='focus')focus(id);if(b.dataset.ops==='remove')remove(id)});
}
function paint(){
const grid=$('opsGrid');if(!grid)return;
Object.values([...st.maps.values()]).forEach(m=>{try{m.remove()}catch{}});st.maps.clear();st.markers.clear();
grid.innerHTML=st.zones.map(z=>'<article class="ops-card '+(z.id===st.active?'active':'')+'" data-ops-card="'+z.id+'"><div class="ops-zone-top"><div><div class="ops-zone-title"><strong>'+esc(z.name)+'</strong><span class="ops-badge '+z.status+'">'+status(z)+'</span></div><small>Radio 35 km · '+age(z.checked)+'</small></div><div><button data-ops="focus" data-id="'+z.id+'" title="Inspeccionar">↗</button> <button data-ops="remove" data-id="'+z.id+'" title="Retirar zona">×</button></div></div><div class="ops-viewport" id="ops-map-'+z.id+'"><div class="ops-map-fallback">Cartografía en carga…</div></div><div class="ops-zone-metrics"><div><strong>'+(z.status==='real'?z.events.length:'—')+'</strong><small>Incidencias</small></div><div><strong>'+(z.status==='real'?z.events.filter(e=>e.severity==='critical').length:'—')+'</strong><small>Graves</small></div><div><strong>'+(z.status==='real'?Object.values(z.sources).filter(x=>x==='OK').length:'—')+'</strong><small>Fuentes OK</small></div></div><div class="ops-zone-bottom"><span>'+esc(z.note)+'</span><button data-ops="focus" data-id="'+z.id+'">Inspeccionar →</button></div></article>').join('');
$('opsCount').textContent=st.zones.length+' zona'+(st.zones.length!==1?'s':'');
for(const z of st.zones)createMap(z);
health();
}
function health(){
const real=st.zones.filter(z=>z.status==='real').length;
$('opsHealth').textContent=st.paused?'Vigilancia periódica pausada':real+'/'+st.zones.length+' zonas con alguna fuente pública verificada';
const changed=$('opsChanges');if(!changed)return;
changed.hidden=st.changes.length===0;
changed.textContent=st.changes.length?'Nuevos eventos desde la anterior consulta: '+st.changes.slice(0,3).map(e=>e.name+' · '+e.title).join(' | '):'';
}
function createMap(z){
const target=$('ops-map-'+z.id);if(!target)return;
if(typeof maplibregl==='undefined'){target.querySelector('.ops-map-fallback').textContent='Mapa no disponible: MapLibre sin cargar';return}
try{target.replaceChildren();const m=new maplibregl.Map({container:target,style:mapStyle,center:[z.lon,z.lat],zoom:10,attributionControl:false,dragRotate:false});st.maps.set(z.id,m);m.on('load',()=>markers(z));m.on('click',()=>focus(z.id));m.on('error',()=>{})}
catch(e){target.textContent='No se pudo inicializar la cartografía'}
}
function markers(z){
const m=st.maps.get(z.id);if(!m)return;
(st.markers.get(z.id)||[]).forEach(pin=>pin.remove());st.markers.set(z.id,[]);
if(z.status!=='real')return;
for(const e of z.events.slice(0,28)){
const lat=+e.lat,lon=+e.lon;if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
const button=document.createElement('button');button.className='ops-pin';button.textContent='!';button.title=(e.title||'Incidencia')+' · '+(e.source||'feed');
button.addEventListener('click',ev=>{ev.stopPropagation();focus(z.id,lon,lat)});
st.markers.get(z.id).push(new maplibregl.Marker({element:button}).setLngLat([lon,lat]).addTo(m));
}}
function update(z){
const card=document.querySelector('[data-ops-card="'+z.id+'"]');if(!card)return;
card.classList.toggle('active',z.id===st.active);
const b=card.querySelector('.ops-badge');b.className='ops-badge '+z.status;b.textContent=status(z);
card.querySelector('.ops-zone-top small').textContent='Radio 35 km · '+age(z.checked);
const vals=card.querySelectorAll('.ops-zone-metrics strong');
vals[0].textContent=z.status==='real'?z.events.length:'—';vals[1].textContent=z.status==='real'?z.events.filter(e=>e.severity==='critical').length:'—';vals[2].textContent=z.status==='real'?Object.values(z.sources).filter(x=>x==='OK').length:'—';
card.querySelector('.ops-zone-bottom span').textContent=z.note;markers(z);health();
}
function api(){return window.ORBEOS_OPS_BRIDGE?.getApi()||'https://command-center-backend-40az.onrender.com'}
async function query(z){
const gen=st.generation;z.status='loading';z.note='Consultando fuentes…';update(z);
const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),19000);
try{
const url=api().replace(/\/$/,'')+'/api/events?city='+encodeURIComponent(z.id)+'&lat='+z.lat+'&lon='+z.lon+'&radius_km=35';
const r=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
if(!r.ok)throw Error('HTTP '+r.status);
const data=await r.json();
if(gen!==st.generation||!zone(z.id))return;
const sources=data.sources||{};const valid=Object.values(sources).some(v=>String(v).toUpperCase()==='OK');
const prev=z.status==='real'?new Set(z.events.map(x=>[x.title,x.road,x.lat,x.lon].join('|'))):null;
z.sources=sources;z.events=valid&&Array.isArray(data.features)?data.features.filter(x=>Number.isFinite(+x.lat)&&Number.isFinite(+x.lon)):[];
if(valid&&prev){for(const e of z.events.filter(x=>!prev.has([x.title,x.road,x.lat,x.lon].join('|'))).slice(0,8))st.changes.unshift({name:z.name,title:e.title||'Incidencia'});st.changes=st.changes.slice(0,20)}
z.status=valid?'real':'error';z.note=valid?Object.entries(sources).filter(([,v])=>v==='OK').map(([k])=>k).join(' + ')+' · datos públicos':'No se pudo verificar el feed';
}catch(e){if(gen!==st.generation||!zone(z.id))return;z.status='error';z.events=[];z.note='Servicio no disponible'}
finally{clearTimeout(timer)}
z.checked=Date.now();update(z);
}
async function refresh(force=false){
if(st.running||(st.paused&&!force))return;st.running=true;st.generation++;
$('opsRefresh').disabled=true;
for(let i=0;i<st.zones.length;i+=2)await Promise.all(st.zones.slice(i,i+2).map(query));
st.running=false;$('opsRefresh').disabled=false;health();
}
function add(){
const id=$('opsCity').value;if(!id){$('opsCity').focus();return}
if(zone(id)){focus(id);return}
if(st.zones.length>=6){$('opsHealth').textContent='Máximo 6 zonas para respetar los servicios públicos';return}
const c=cities.find(x=>x.id===id);st.zones.push({...c,status:'loading',events:[],sources:{},note:'Esperando consulta',checked:null});
persist();paint();$('opsCity').value='';void refresh(true);
}
function remove(id){
if(st.zones.length<2)return;st.zones=st.zones.filter(z=>z.id!==id);
if(st.active===id)st.active=st.zones[0].id;st.generation++;st.running=false;persist();paint();void refresh(true);
}
function focus(id,lon,lat){
const z=zone(id);if(!z)return;st.active=id;
document.querySelectorAll('.ops-card').forEach(c=>c.classList.toggle('active',c.dataset.opsCard===id));
window.ORBEOS_OPS_BRIDGE?.focus(id,Number.isFinite(lon)?lon:z.lon,Number.isFinite(lat)?lat:z.lat,z.name);
$('map')?.scrollIntoView({behavior:'smooth',block:'center'});
}
function showMain(){
$('map')?.scrollIntoView({behavior:'smooth',block:'center'});
const z=zone(st.active);if(z)window.ORBEOS_OPS_BRIDGE?.focus(z.id,z.lon,z.lat,z.name);
}
function persist(){localStorage.setItem('orbeosOpsZones',JSON.stringify(st.zones.map(z=>z.id)))}
function load(){
let ids=['barcelona','madrid','valencia','sevilla'];
try{const saved=JSON.parse(localStorage.getItem('orbeosOpsZones')||'null');if(Array.isArray(saved)&&saved.length)ids=saved.filter(x=>typeof x==='string').slice(0,6)}catch{}
st.zones=[...new Set(ids)].map(id=>cities.find(x=>x.id===id)).filter(Boolean).map(z=>({...z,status:'loading',events:[],sources:{},checked:null,note:'Esperando consulta'}));
if(!st.zones.length)st.zones=[{...cities[0],status:'loading',events:[],sources:{},checked:null,note:'Esperando consulta'}];
st.active=st.zones[0].id;insertUI();paint();void refresh();
setInterval(()=>{if(!document.hidden&&!st.paused)void refresh()},180000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!st.paused&&st.zones.some(z=>!z.checked||Date.now()-z.checked>180000))void refresh()});
initOrbit();
}
const options={
0:[['▦','Zonas','zones'],['↻','Actualizar','refresh'],['⌖','Mapa','map'],['◉','Fuentes','sources']],
1:[['◎','Origen','origin'],['⚑','Destino','destination'],['↗','Ruta','route'],['⌖','GPS','gps']],
2:[['▱','Capas','layers'],['⚠','Incidentes','incidents'],['P','Parking','parking'],['≋','Tráfico','traffic']],
3:[['⚠','Actividad','activity'],['↻','Actualizar','refresh'],['▦','Por zonas','zones']],
4:[['⇶','Multi','multi'],['⌖','Mapa','map']],
5:[['◉','Fuentes','sources'],['↻','Validar','refresh']],
6:[['⌖','Mapa','map'],['◈','Satélite','sat'],['▣','Calles','dark'],['◎','GPS','gps']]
};
function action(id){
const bridge=window.ORBEOS_OPS_BRIDGE;
if(id==='zones')$('opsWatch').scrollIntoView({behavior:'smooth',block:'start'});
else if(id==='refresh')void refresh(true);
else if(id==='map')showMain();
else if(id==='sources')bridge?.openView('sistemas');
else if(id==='layers')bridge?.openView('capas');
else if(id==='activity')bridge?.openView('actividad');
else if(id==='multi')bridge?.openView('multi');
else if(id==='origin'){bridge?.openView('navegador');bridge?.setPick('origin')}
else if(id==='destination'){bridge?.openView('navegador');bridge?.setPick('destination')}
else if(id==='route'){bridge?.openView('navegador');void bridge?.calculateRoute()}
else if(id==='gps')bridge?.locate();
else if(id==='sat')bridge?.setMapStyle('satellite');
else if(id==='dark')bridge?.setMapStyle('dark');
else if(['incidents','parking','traffic'].includes(id))void bridge?.toggleLayer(id);
}
function initOrbit(){
const inner=$('orbeOrbit'),wrap=$('orbeWrap');if(!inner||!wrap)return;
const outer=document.createElement('div');outer.className='ops-outer';wrap.append(outer);
let selected=-1;
function paintOrbit(){
const buttons=[...inner.children];if(!buttons.length)return;
const next=Math.max(0,buttons.findIndex(b=>b.classList.contains('selected')));
const n=buttons.length;buttons.forEach((b,i)=>{const a=(-90+((i-next+n)%n)*360/n)*Math.PI/180;b.style.left=(150+79*Math.cos(a))+'px';b.style.top=(150+79*Math.sin(a))+'px'});
if(next===selected)return;selected=next;outer.replaceChildren();
const items=options[selected]||[];
items.forEach(([ico,label,id],i)=>{const a=(-90+i*360/items.length)*Math.PI/180;const b=document.createElement('button');b.className='ops-orb-child';b.style.left=(150+132*Math.cos(a))+'px';b.style.top=(150+132*Math.sin(a))+'px';b.setAttribute('aria-label',label);b.title=label;b.append(document.createTextNode(ico));const t=document.createElement('span');t.textContent=label;b.append(t);b.onclick=e=>{e.stopPropagation();action(id)};outer.append(b)});
}
paintOrbit();
const observer=new MutationObserver(()=>paintOrbit());observer.observe(inner,{subtree:true,attributes:true,attributeFilter:['class']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();