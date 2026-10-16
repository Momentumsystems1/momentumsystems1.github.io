/* ORBEOS NEXT · visual-functional preview. No secrets in frontend. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nfmt = (n) => Number(n || 0).toLocaleString('es-ES');
  const nowText = (d) => new Intl.DateTimeFormat('es-ES',{hour:'2-digit',minute:'2-digit'}).format(d);
  const DEFAULT_API = 'https://command-center-backend-40az.onrender.com';
  const BRAND = ['#369aff','#be6cff','#ffb343','#ff5978','#42e2a1'];
  const demoFleet = [
    {name:'Alpha-01',person:'Luis',color:BRAND[0],point:[2.0853,41.4018]},
    {name:'Bravo-02',person:'Sofía',color:BRAND[1],point:[2.1358,41.3573]},
    {name:'Charlie-03',person:'Javier',color:BRAND[2],point:[2.1996,41.3992]},
    {name:'Delta-04',person:'María',color:BRAND[3],point:[2.1524,41.4339]},
    {name:'Echo-05',person:'Carlos',color:BRAND[4],point:[2.2105,41.3743]},
  ];
  const state = {
    apiBase: localStorage.getItem('orbeosNextApi') || DEFAULT_API,
    demo: localStorage.getItem('orbeosNextDemo') !== 'false',
    view:'inicio', panel:'actividad', map:null, mapReady:false,
    center:[2.1686,41.3874], zoom:11.8, style:'dark',
    layers:{incidents:true,parking:true,bikes:false,traffic:false,pmr:false},
    status:{backend:'loading',incidents:'loading',parking:'loading',bikes:'loading',azure:'loading',traffic:'unconfigured',fleet:'demo'},
    events:[], parking:[], bikes:[], hasRealEvents:false,
    markers:{incidents:[],parking:[],bikes:[],pmr:[],origin:[],destination:[],multi:[]},
    pick:null, origin:null,destination:null,route:null,multiRoute:null,
    originText:'', destinationText:'', loadingRoute:false,
    selectedOrb:0, orbExpanded:false, orbMini:false, selectedPoint:null, pointPopup:null,
    zones:[], zoneMaps:{}, zoneMarkers:{}, zoneRefreshing:false, zonePaused:false, zoneEpoch:0, zoneTimer:null, watchChanges:[],
    immersive:false, immersiveTimer:null, currentTrafficTest:0, lastChecked:null,
    activityDemo:[
      {title:'Obras en la calzada',description:'Ejemplo de incidencia · no corresponde a un evento confirmado',road:'Zona de ejemplo',severity:'warning',source:'DEMO',kind:'obras',lat:41.394,lon:2.153},
      {title:'Congestión de tráfico',description:'Dato de muestra para validar la representación',road:'Zona de ejemplo',severity:'warning',source:'DEMO',kind:'trafico',lat:41.405,lon:2.188},
      {title:'Vehículo detenido',description:'Evento simulado, no recibido desde la DGT',road:'Zona de ejemplo',severity:'critical',source:'DEMO',kind:'averia',lat:41.376,lon:2.175},
    ],
  };
  const orbitActions = [
    {id:'zonas',label:'Zonas',icon:'▦'},
    {id:'mapa',label:'Mapa',icon:'⌖'},
    {id:'navegador',label:'Rutas',icon:'↗'},
    {id:'capas',label:'Capas',icon:'▱'},
    {id:'actividad',label:'Alertas',icon:'⚠'},
    {id:'sistemas',label:'Fuentes',icon:'◉'},
    {id:'ui',label:'Interfaz',icon:'⚙'},
  ];
  const orbitalChildren={
    zonas:[['show-zones','▦','Vigilar'],['refresh-zones','↻','Actualizar'],['next-zone','➜','Siguiente'],['toggle-watch','Ⅱ','Pausar']],
    mapa:[['focus-map','⌖','Ampliar'],['map-dark','▣','Calles'],['map-sat','◈','Satélite'],['locate','◎','GPS']],
    navegador:[['open-nav','↗','Planificar'],['pick-origin','◎','Origen'],['pick-dest','⚑','Destino'],['route','⇢','Ruta']],
    capas:[['open-layers','▱','Capas'],['toggle-incidents','⚠','Alertas'],['toggle-parking','P','Parking'],['toggle-traffic','≋','Tráfico']],
    actividad:[['open-alerts','⚠','Eventos'],['refresh-zones','↻','Actualizar'],['show-zones','▦','Por zonas']],
    sistemas:[['open-systems','◉','Estado'],['refresh-zones','↻','Validar'],['toggle-watch','Ⅱ','Pausar'],['settings','⚙','Ajustes']],
    ui:[['toggle-nav','⇤','Menú'],['toggle-kpis','▤','KPIs'],['toggle-panels','◫','Panel'],['toggle-zones','▦','Zonas'],['settings','⚙','Ajustes']],
  };
  const CITY_ZONES=[
    {id:'barcelona',name:'Barcelona',lat:41.3874,lon:2.1686},
    {id:'madrid',name:'Madrid',lat:40.4168,lon:-3.7038},
    {id:'valencia',name:'Valencia',lat:39.4699,lon:-0.3763},
    {id:'sevilla',name:'Sevilla',lat:37.3891,lon:-5.9845},
    {id:'bilbao',name:'Bilbao',lat:43.2630,lon:-2.9350},
    {id:'zaragoza',name:'Zaragoza',lat:41.6488,lon:-0.8891},
    {id:'malaga',name:'Málaga',lat:36.7213,lon:-4.4214},
    {id:'tarragona',name:'Tarragona',lat:41.1189,lon:1.2445},
    {id:'girona',name:'Girona',lat:41.9794,lon:2.8214},
    {id:'granada',name:'Granada',lat:37.1773,lon:-3.5986},
  ];
  const mapStyles = {
    dark: {version:8,name:'ORBEOS Dark',sources:{base:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png','https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO',maxzoom:19}},layers:[{id:'dark-bg',type:'background',paint:{'background-color':'#081632'}},{id:'base',type:'raster',source:'base',paint:{'raster-opacity':.95}}]},
    light:{version:8,name:'ORBEOS Claro',sources:{base:{type:'raster',tiles:['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png','https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'],tileSize:256,attribution:'© OpenStreetMap © CARTO',maxzoom:19}},layers:[{id:'light-bg',type:'background',paint:{'background-color':'#d4e3f2'}},{id:'base',type:'raster',source:'base'}]},
    satellite:{version:8,name:'ORBEOS Satellite',sources:{base:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],tileSize:256,attribution:'© Esri, Maxar, Earthstar Geographics',maxzoom:19},labels:{type:'raster',tiles:['https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'],tileSize:256,maxzoom:19}},layers:[{id:'sat-bg',type:'background',paint:{'background-color':'#07102b'}},{id:'base',type:'raster',source:'base'},{id:'labels',type:'raster',source:'labels',paint:{'raster-opacity':.8}}]}
  };
  const statuses = {real:'REAL',demo:'DEMO',empty:'SIN DATOS',error:'ERROR',loading:'CARGANDO',unconfigured:'NO CONFIG.',configured:'CONFIG.',verifying:'VERIFICANDO'};
  const sourceTitle = {backend:'Backend API',incidents:'DGT / SCT',parking:'OpenStreetMap',bikes:'CityBikes',azure:'Azure Maps',traffic:'Tráfico Azure',fleet:'Flota Momentum'};
  function setText(id, value){const e=$(id);if(e) e.textContent=value;}
  function badge(id, status){const el=$(id);if(!el)return;el.className=`data-badge ${status==='real'?'real':status==='demo'?'demo':status==='error'?'off':''}`;el.textContent=statuses[status]||String(status).toUpperCase();}
  function message(text){setText('mapNotice',text);}
  async function getJson(path,timeoutMs=22000){
    const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),timeoutMs);
    try{const r=await fetch(`${state.apiBase.replace(/\/$/,'')}/api${path}`,{signal:ctrl.signal,headers:{Accept:'application/json'}});if(!r.ok)throw Error(`HTTP ${r.status}`);return await r.json();}
    finally{clearTimeout(timer)}
  }
  function getCenter(){const c=state.map?state.map.getCenter():{lng:state.center[0],lat:state.center[1]};return [c.lng,c.lat]}
  function coordsText(c){return c?`${c[1].toFixed(5)}, ${c[0].toFixed(5)}`:''}
  function refreshClock(){setText('headerClock',new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date()));}
  // Compact two-tier orbital controller. Root and child actions have distinct, real handlers.
  // The selected parent rotates to 12 o'clock; children occupy an independent outer orbit.
  function renderOrb(){
    const inner=$('orbeOrbit'),outer=$('orbeChildren');if(!inner||!outer)return;
    inner.replaceChildren();outer.replaceChildren();const n=orbitActions.length;
    orbitActions.forEach((action,i)=>{
      const shift=(i-state.selectedOrb+n)%n;
      const angle=(-90+shift*360/n)*Math.PI/180;
      const btn=document.createElement('button');btn.type='button';
      btn.className='orb-btn'+(i===state.selectedOrb?' selected':'');
      btn.style.left=`${120+63*Math.cos(angle)}px`;
      btn.style.top=`${120+63*Math.sin(angle)}px`;
      btn.setAttribute('aria-label',action.label);btn.title=action.label;
      const ico=document.createElement('span');ico.className='orb-ico';ico.textContent=action.icon;
      const label=document.createElement('span');label.className='orb-label';label.textContent=action.label;
      btn.append(ico,label);btn.addEventListener('click',()=>selectOrb(i));inner.append(btn);
    });
    const group=orbitActions[state.selectedOrb].id;
    const children=orbitalChildren[group]||[];
    children.forEach(([action,icon,label],i)=>{
      const angle=(-90+i*360/children.length)*Math.PI/180;
      const btn=document.createElement('button');btn.type='button';btn.className='orb-child';
      btn.style.left=`${120+105*Math.cos(angle)}px`;btn.style.top=`${120+105*Math.sin(angle)}px`;
      btn.title=label;btn.setAttribute('aria-label',label);
      const ico=document.createElement('span');ico.className='orb-ico';ico.textContent=icon;
      const txt=document.createElement('span');txt.className='orb-label';txt.textContent=label;
      btn.append(ico,txt);btn.addEventListener('click',()=>{void performOrbAction(action)});outer.append(btn);
    });
    setText('orbCaption',`Órbita: ${orbitActions[state.selectedOrb].label}`);syncOrbState();
  }
  function syncOrbState(){
    const wrap=$('orbeWrap');wrap.classList.toggle('orb-mini',state.orbMini);wrap.classList.toggle('orb-collapsed',!state.orbExpanded);
    const core=$('orbCore');core.setAttribute('aria-expanded',String(state.orbExpanded&&!state.orbMini));
    core.title=state.orbMini?'Clic: restaurar':'Clic: cerrar/abrir · doble clic: minimizar · arrastrar: mover';
    wrap.dataset.mode=state.orbExpanded?'abierto':'cerrado';
  }
  function selectOrb(i){
    state.selectedOrb=i;state.orbMini=false;state.orbExpanded=true;renderOrb();
    const mode=orbitActions[i].id;
    if(mode==='actividad'&&!state.layers.incidents){state.layers.incidents=true;drawMarkers()}
    openView(mode);
    if(mode==='zonas'){$('watchCenter')?.classList.add('watch-expanded');$('watchCenter')?.scrollIntoView({behavior:'smooth',block:'nearest'});} 
    if(mode==='ui') {state.view='ui';openView('sistemas');}
  }
  async function performOrbAction(action){
    if(action==='show-zones'){openView('zonas');$('watchCenter')?.classList.add('watch-expanded');$('watchCenter')?.scrollIntoView({behavior:'smooth',block:'nearest'})}
    else if(action==='refresh-zones')await refreshZones(true);
    else if(action==='next-zone'){const index=state.zones.findIndex(z=>z.id===state.activeZone);focusZone(state.zones[(index+1)%state.zones.length]?.id)}
    else if(action==='toggle-watch')toggleZonePause();
    else if(action==='focus-map'){openView('mapa');$('map')?.scrollIntoView({behavior:'smooth',block:'center'});state.map?.resize()}
    else if(action==='map-dark')setMapStyle('dark');
    else if(action==='map-sat')setMapStyle('satellite');
    else if(action==='locate')locate();
    else if(action==='open-nav')openView('navegador');
    else if(action==='pick-origin'){openView('navegador');setPick('origin')}
    else if(action==='pick-dest'){openView('navegador');setPick('destination')}
    else if(action==='route'){openView('navegador');await calculateRoute()}
    else if(action==='open-layers')openView('capas');
    else if(action==='toggle-incidents')await toggleLayer('incidents');
    else if(action==='toggle-parking')await toggleLayer('parking');
    else if(action==='toggle-traffic')await toggleLayer('traffic');
    else if(action==='open-alerts')openView('actividad');
    else if(action==='open-systems')openView('sistemas');
    else if(action==='toggle-nav') {document.body.classList.toggle('nav-full');queueMapResize()}
    else if(action==='toggle-kpis') {document.body.classList.toggle('hide-kpis');queueMapResize()}
    else if(action==='toggle-panels') {document.body.classList.toggle('hide-panel');queueMapResize()}
    else if(action==='toggle-zones') {$('watchCenter').classList.toggle('watch-expanded');$('watchCenter').scrollIntoView({behavior:'smooth',block:'nearest'})}
    else if(action==='settings') $('settingsBtn').click();
  }
  function openView(view){
    if(view==='mapa'){state.view='mapa';state.panel='actividad'}
    else if(view==='inicio'){state.view='inicio';state.panel='actividad'}
    else if(view==='actividad'){state.view='inicio';state.panel='actividad'}
    else if(view==='sistemas'){state.view='sistemas';state.panel='sistemas'}
    else if(view==='zonas'){state.view='zonas';state.panel='zonas'}
    else{state.view=view;state.panel=view}
    document.querySelectorAll('.nav-item[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===state.view));
    const titles={zonas:['Centro de operaciones · Multizona','Mapa, alertas y fuentes verificadas para varias zonas a la vez'],inicio:['Vista general','Movilidad operativa · datos reales donde existan'],mapa:['Mapa de movilidad','Geolocalización, incidentes y capas verificadas'],navegador:['Navegador','Origen y destino · rutas por vías públicas'],multi:['Operaciones multi-ruta','Coordinación · vehículos y posiciones DEMO'],capas:['Capas del mapa','Activación independiente y procedencia visible'],sistemas:['Fuentes conectadas','Conectividad, procedencia y fallos']};
    setText('pageTitle',(titles[state.view]||titles.inicio)[0]);setText('pageSubtitle',(titles[state.view]||titles.inicio)[1]);
    document.querySelectorAll('.right-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.panel===state.panel));
    drawPanel();
  }
  function sourceStatus(id, kind){state.status[id]=kind;renderSourceSummary();drawKpis()}
  function drawKpis(){
    setText('kpiVehicles',state.demo?'5':'—');badge('kpiVehiclesMode',state.demo?'demo':'empty');
    setText('kpiRoutes',state.demo?'5':'—');badge('kpiRoutesMode',state.demo?'demo':'empty');
    setText('kpiIncidents',state.hasRealEvents?nfmt(state.events.length):state.demo?nfmt(state.activityDemo.length):'—');badge('kpiIncidentsMode',state.hasRealEvents?'real':state.demo?'demo':'empty');
    setText('kpiParking',state.status.parking==='real'?nfmt(state.parking.length):'—');badge('kpiParkingMode',state.status.parking==='real'?'real':state.status.parking);
    setText('kpiBikes',state.status.bikes==='real'?nfmt(state.bikes.length):'—');badge('kpiBikesMode',state.status.bikes==='real'?'real':state.status.bikes);
    setText('routesActive',state.demo?'5':'—');setText('eventsKnown',state.hasRealEvents?String(state.events.length):'—');
    const num=Object.values(state.status).filter(x=>x==='real').length;setText('sourcesActive',String(num));
    const strip=$('routeStrip');strip.innerHTML=state.demo?BRAND.map(x=>`<span style="background:${x}"></span>`).join(''):'<span style="background:#294477"></span>';
    setText('modeChip',state.status.backend==='real'?'● API disponible · origen verificado por capa':'● Preview / disponibilidad limitada');
    drawIncidentBars();
  }
  function renderSourceSummary(){
    const ids=['backend','incidents','parking','bikes','azure','traffic','fleet'];
    $('sourceSummary').innerHTML=ids.map(id=>`<div class="source-tile"><span>${esc(sourceTitle[id])}</span><span class="status ${state.status[id]==='real'?'good':state.status[id]==='demo'?'demo':['error','unconfigured'].includes(state.status[id])?'error':''}">${esc(statuses[state.status[id]]||'—')}</span></div>`).join('');
    setText('sourcesActive',String(Object.values(state.status).filter(x=>x==='real').length));
  }
  function eventsToShow(){return state.hasRealEvents?state.events:state.demo?state.activityDemo:[]}
  function drawIncidentBars(){
    const ev=eventsToShow();const groups={Accidentes:0,Congestión:0,Obras:0,Averías:0,Otros:0};
    ev.forEach(e=>{const s=((e.kind||'')+' '+(e.title||'')).toLowerCase();
      if(/accident|colisi|choque/.test(s))groups.Accidentes++;
      else if(/tr[aá]fic|congest|retenci/.test(s))groups.Congestión++;
      else if(/obra/.test(s))groups.Obras++;
      else if(/aver[ií]|veh[ií]culo detenido/.test(s))groups.Averías++;else groups.Otros++;
    });
    const max=Math.max(1,...Object.values(groups)); const colors=['#ff5a77','#ffab42','#f5d555','#3e9dff','#9678de'];
    $('incidentBars').innerHTML=Object.entries(groups).map(([key,val],i)=>`<div class="bar-line"><label>${key}</label><b>${val}</b><div class="bar-track"><div class="bar-fill" style="width:${val/max*100}%;background:${colors[i]}"></div></div></div>`).join('');
    badge('incidentSummaryMode',state.hasRealEvents?'real':state.demo?'demo':'empty');
  }
  function markerEl(icon,title,subtitle='',cls=''){
    const root=document.createElement('div');root.className=`map-marker ${cls}`;const dot=document.createElement('span');dot.className='map-dot';dot.textContent=icon;
    root.appendChild(dot);if(title){const label=document.createElement('div');label.className='map-text';const b=document.createElement('b');b.textContent=title;label.appendChild(b);if(subtitle){const s=document.createElement('small');s.textContent=subtitle;label.appendChild(s)}root.appendChild(label)}return root;
  }
  function addMarker(layer,point,element,anchor='left'){
    if(!state.map||!Number.isFinite(Number(point[0]))||!Number.isFinite(Number(point[1])))return null;
    const marker=new maplibregl.Marker({element,anchor}).setLngLat(point).addTo(state.map);
    element.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      handlePointSelection(point,{label:element.querySelector('.map-text b')?.textContent||'Punto en mapa',detail:element.querySelector('.map-text small')?.textContent||'',kind:layer});
    });
    state.markers[layer].push(marker);return marker;
  }
  function clearLayer(layer){state.markers[layer]?.forEach(marker=>marker.remove());state.markers[layer]=[]}
  function drawMarkers(){
    ['incidents','parking','bikes','pmr'].forEach(clearLayer);
    if(state.layers.incidents){eventsToShow().slice(0,35).forEach(e=>{
      if(!Number.isFinite(+e.lon)||!Number.isFinite(+e.lat))return;
      const isDemo=e.source==='DEMO';const el=markerEl('!',(e.road||e.title||'Incidencia').slice(0,26),isDemo?'DEMO · ejemplo':`${e.source||'Fuente pública'}`,`incident ${isDemo?'demo':''}`);
      el.title=(e.description||'')+' · '+(e.source||'');addMarker('incidents',[+e.lon,+e.lat],el);
    })}
    if(state.layers.parking){state.parking.slice(0,35).forEach(f=>{const el=markerEl('P',f.name||'Aparcamiento','OSM · ocupación desconocida','parking');addMarker('parking',[+f.lon,+f.lat],el)})}
    if(state.layers.bikes){state.bikes.slice(0,30).forEach(f=>{const p=stationCoords(f);if(!p)return;const el=markerEl('♧',f.name||'Estación bici','CityBikes · ubicación','bike');addMarker('bikes',p,el)})}
    if(state.layers.pmr&&state.demo){const c=getCenter();[[.016,-.006],[-.014,.008],[.004,.018]].forEach((xy,i)=>{const el=markerEl('♿',`Punto PMR ${i+1}`,'DEMO · sin evaluación técnica','demo bike');addMarker('pmr',[c[0]+xy[0],c[1]+xy[1]],el)})}
    drawEndpoints();
  }
  // A map click always yields a real coordinate. A source marker may add sourced metadata.
  // Never infer parking availability, PMR suitability, traffic or an ETA from the coordinate.
  function handlePointSelection(point,info={}){
    if(state.pick){
      const target=state.pick;
      setPick(null);setRoutePoint(target,point,info.label||coordsText(point));
      state.map?.flyTo({center:point,zoom:Math.max(14,state.map.getZoom()),duration:700});
      drawPanel();message(`Punto ${target==='origin'?'de inicio':'de destino'} marcado en el mapa`);
      return;
    }
    if(!state.map && state.tileFallbackActive){
      state.selectedPoint={point:[...point],label:info.label||'Punto seleccionado',detail:info.detail||'',kind:'mapa'};
      let menu=$('fallbackActions');if(menu)menu.remove();
      menu=document.createElement('div');menu.id='fallbackActions';menu.className='fallback-actions glass';
      const heading=document.createElement('b');heading.textContent='Punto seleccionado';
      const coords=document.createElement('small');coords.textContent=coordsText(point)+' · mapa de emergencia';
      menu.append(heading,coords);
      [['origin','◎ Inicio'],['destination','⚑ Destino'],['parking','P Parking'],['copy','⧉ Copiar']].forEach(([action,label])=>{
        const btn=document.createElement('button');btn.textContent=label;btn.onclick=e=>{e.stopPropagation();void executePointAction(action)};menu.appendChild(btn)
      });
      menu.onclick=e=>e.stopPropagation();$('map').appendChild(menu);
      message('Punto geográfico identificado; se necesita MapLibre para rutas y capas detalladas');return;
    }
    if(!state.map)return;
    state.selectedPoint={point:[...point],label:info.label||'Punto seleccionado',detail:info.detail||'',kind:info.kind||'mapa'};
    state.map.flyTo({center:point,zoom:Math.max(15,state.map.getZoom()),duration:900,essential:true});
    showPointOptions();
    message(`Punto seleccionado · ${coordsText(point)} · menú contextual abierto`);
  }
  function dismissPoint(){state.pointPopup?.remove();$('fallbackActions')?.remove();state.pointPopup=null;state.selectedPoint=null;}
  function showPointOptions(){
    if(!state.map||!state.selectedPoint)return;
    state.pointPopup?.remove();
    const {point,label,detail,kind}=state.selectedPoint;
    const wrap=document.createElement('div');wrap.className='point-actions';
    const head=document.createElement('div');head.className='point-actions-heading';
    const name=document.createElement('strong');name.textContent=label;
    const sub=document.createElement('small');sub.textContent=`${coordsText(point)} · ${detail|| (kind==='mapa'?'Coordenadas del mapa':'Origen: '+kind)}`;
    head.append(name,sub);wrap.appendChild(head);
    const menu=document.createElement('div');menu.className='point-actions-grid';
    const opts=[
      ['origin','◎','Marcar inicio'],['destination','⚑','Marcar destino'],
      ['parking','P','Parking cerca'],['bikes','♧','Bicis cerca'],
      ['incidents','⚠','Incidencias'],['copy','⧉','Copiar coordenadas']
    ];
    opts.forEach(([action,icon,title])=>{
      const b=document.createElement('button');b.type='button';b.dataset.pointAction=action;
      const i=document.createElement('span');i.textContent=icon;const t=document.createElement('span');t.textContent=title;
      b.append(i,t);b.addEventListener('click',ev=>{ev.stopPropagation();void executePointAction(action)});menu.appendChild(b);
    });
    wrap.appendChild(menu);
    const popup=new maplibregl.Popup({closeButton:true,closeOnClick:false,offset:28,maxWidth:'325px',className:'orbe-point-popup',focusAfterOpen:false})
      .setLngLat(point).setDOMContent(wrap).addTo(state.map);
    popup.on('close',()=>{if(state.pointPopup===popup){state.pointPopup=null;state.selectedPoint=null}});
    state.pointPopup=popup;
  }
  async function executePointAction(action){
    const selection=state.selectedPoint;if(!selection)return;
    const p=[...selection.point];const label=selection.label==='Punto seleccionado'?coordsText(p):selection.label;
    if(action==='origin'||action==='destination'){
      setRoutePoint(action,p,label);dismissPoint();openView('navegador');
      message((action==='origin'?'Inicio':'Destino')+' fijado: '+label);return;
    }
    if(action==='copy'){
      try{await navigator.clipboard.writeText(coordsText(p));message('Coordenadas copiadas: '+coordsText(p))}
      catch{message('Coordenadas: '+coordsText(p)+' · selecciónalas en el menú si necesitas copiarlas')}
      return;
    }
    if(['parking','bikes','incidents'].includes(action)){
      state.layers[action]=true;drawMarkers();openView('capas');
      dismissPoint();
      message('Consultando '+(action==='parking'?'aparcamientos':action==='bikes'?'bicicletas':'incidencias')+' cerca del punto seleccionado…');
      await refreshAll(p);return;
    }
  }
  function setImmersiveMap(enabled){
    if(state.immersive===enabled)return;
    clearTimeout(state.immersiveTimer);state.immersive=enabled;
    document.body.classList.toggle('map-immersive',enabled);
    const resize=()=>{try{state.map?.resize()}catch{}};
    requestAnimationFrame(resize);
    state.immersiveTimer=setTimeout(resize,enabled?360:390);
  }
  function stationCoords(f){const lat=f.lat??f.latitude??f.location?.latitude;const lon=f.lon??f.lng??f.longitude??f.location?.longitude;return Number.isFinite(+lat)&&Number.isFinite(+lon)?[+lon,+lat]:null}
  function drawEndpoints(){
    ['origin','destination'].forEach(clearLayer);
    if(state.origin){addMarker('origin',state.origin,markerEl('◎','Punto 1 · Inicio',state.originText||coordsText(state.origin),'origin'))}
    if(state.destination){addMarker('destination',state.destination,markerEl('⚑','Punto 2 · Destino',state.destinationText||coordsText(state.destination),'end'))}
  }
  function drawGeoLine(id,features,paint,layout={}){
    if(!state.map||!state.map.isStyleLoaded())return;
    const geo={type:'FeatureCollection',features};
    if(state.map.getSource(id))state.map.getSource(id).setData(geo);
    else {state.map.addSource(id,{type:'geojson',data:geo});state.map.addLayer({id,source:id,type:'line',layout:{'line-join':'round','line-cap':'round',...layout},paint})}
  }
  function redrawLines(){
    if(state.route?.geometry?.coordinates?.length>1){const data=[{type:'Feature',geometry:state.route.geometry,properties:{}}];drawGeoLine('next-route',data,{'line-color':state.route.real?'#47b7ff':'#ffbd62','line-width':5,'line-opacity':.96,'line-dasharray':state.route.real?[1,0]:[2,1]})}
    if(state.multiRoute?.length){const data=state.multiRoute.map(x=>({type:'Feature',geometry:{type:'LineString',coordinates:[x.point,x.dest]},properties:{color:x.color}}));drawGeoLine('next-multi',data,{'line-color':['get','color'],'line-width':3,'line-opacity':.92,'line-dasharray':[2,1]})}
  }
  function syncTraffic(){
    const id='azure-flow';if(!state.map||!state.map.isStyleLoaded())return;
    if(state.map.getLayer(id))state.map.removeLayer(id);if(state.map.getSource(id))state.map.removeSource(id);
    if(!state.layers.traffic||state.status.traffic!=='real')return;
    const url=state.apiBase.replace(/\/$/,'')+'/api/azure/tile/flow/{z}/{x}/{y}';
    state.map.addSource(id,{type:'raster',tiles:[url],tileSize:256});state.map.addLayer({id,source:id,type:'raster',paint:{'raster-opacity':.85}});
  }
  function setMapStyle(name){
    state.style=name;
    document.querySelectorAll('#styleStreet,#styleLight,#styleSatellite').forEach(b=>b?.classList.remove('selected'));
    $(name==='dark'?'styleStreet':name==='light'?'styleLight':'styleSatellite')?.classList.add('selected');
    if(state.map)state.map.setStyle(mapStyles[name]);
    if(state.tileFallbackActive)renderFallbackMap();
    message(name==='dark'?'Mapa nocturno · CARTO / OSM':name==='light'?'Mapa claro · CARTO / OSM':'Satélite · Esri');
  }
  function queueMapResize(){requestAnimationFrame(()=>state.map?.resize());setTimeout(()=>state.map?.resize(),350)}
  // If all WebGL/CDN attempts fail, show real raster tiles with attribution, not a blank rectangle.
  function renderFallbackMap(){
    const container=$('map'), center=state.center, zoom=10;
    if(!container)return;
    let fallback=$('rasterFallback');if(!fallback){fallback=document.createElement('div');fallback.id='rasterFallback';fallback.className='raster-fallback';container.appendChild(fallback)}
    fallback.replaceChildren();const width=Math.max(320,container.clientWidth),height=Math.max(360,container.clientHeight);
    const warning=document.createElement('div');warning.className='raster-warning';warning.textContent='Comprobando proveedor de cartografía…';fallback.appendChild(warning);
    let tilesLoaded=0,tilesFailed=0;
    const lat=Math.max(-85,Math.min(85,center[1]));const sin=Math.sin(lat*Math.PI/180);
    const x=(center[0]+180)/360*(2**zoom)*256;
    const y=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*(2**zoom)*256;
    const minX=Math.floor((x-width/2)/256),maxX=Math.floor((x+width/2)/256);
    const minY=Math.floor((y-height/2)/256),maxY=Math.floor((y+height/2)/256);
    for(let tx=minX;tx<=maxX;tx++)for(let ty=minY;ty<=maxY;ty++){
      if(ty<0||ty>=2**zoom)continue;
      const pic=document.createElement('img');pic.alt='';pic.loading='lazy';pic.decoding='async';pic.draggable=false;
      const xmod=(tx+(2**zoom))%(2**zoom);
      pic.src=state.style==='satellite'?`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${ty}/${xmod}`:`https://a.basemaps.cartocdn.com/${state.style==='light'?'light_all':'dark_all'}/${zoom}/${xmod}/${ty}.png`;
      pic.style.cssText=`left:${Math.round(tx*256-x+width/2)}px;top:${Math.round(ty*256-y+height/2)}px;width:256px;height:256px;position:absolute;`;
      pic.onload=()=>{tilesLoaded++;warning.remove()};pic.onerror=()=>{tilesFailed++;pic.remove();if(!tilesLoaded&&tilesFailed>=2){warning.textContent='No se pudieron cargar las teselas. Comprueba tu red, bloqueo de CDN o proveedor de mapas. La interfaz y las zonas siguen disponibles.'}};
      fallback.appendChild(pic);
    }
    const credit=document.createElement('div');credit.className='raster-credits';credit.textContent='© OpenStreetMap © CARTO · Vista de emergencia';fallback.appendChild(credit);
    fallback.onclick=e=>{if(e.target===credit)return;const r=fallback.getBoundingClientRect();const wx=x+(e.clientX-r.left-width/2);const wy=y+(e.clientY-r.top-height/2);const lon=wx/((2**zoom)*256)*360-180;const lat=(180/Math.PI)*Math.atan(Math.sinh(Math.PI*(1-2*wy/((2**zoom)*256))));handlePointSelection([lon,lat]);};
    fallback.onwheel=e=>{e.preventDefault();message('Modo de emergencia · instala/habilita WebGL para navegación fluida')};
  }
  function enableFallback(reason){
    if(state.tileFallbackActive)return;
    state.tileFallbackActive=true;
    $('mapUnavailable')?.classList.add('hidden');renderFallbackMap();
    message(`Modo cartografía de emergencia: ${reason}. MapLibre no disponible; funciones 3D desactivadas.`);
  }
  function initMap(){
    if(typeof maplibregl==='undefined'){enableFallback('no se descargó MapLibre');return}
    try{
      state.map=new maplibregl.Map({container:'map',style:mapStyles.dark,center:state.center,zoom:state.zoom,pitch:0,maxZoom:18,attributionControl:true});
      state.map.addControl(new maplibregl.NavigationControl({showCompass:false}),'bottom-left');
      state.map.on('load',()=>{state.mapReady=true;message('Mapa CARTO / OSM · conectado a teselas públicas');drawMarkers();redrawLines();syncTraffic()});
      state.map.on('style.load',()=>{redrawLines();syncTraffic()});
      state.map.on('click',e=>handlePointSelection([e.lngLat.lng,e.lngLat.lat]));
      state.map.on('dragstart',()=>{dismissPoint();setImmersiveMap(true)});
      state.map.on('dragend',()=>{setImmersiveMap(false)});
      state.map.on('moveend',()=>{const c=getCenter();state.center=c;setText('areaCoords',`${c[1].toFixed(3)}°, ${c[0].toFixed(3)}°`)});
      let tileErrorCount=0;
      state.map.on('error',e=>{if(!e?.error)return;if(++tileErrorCount<=2)message('Problema de teselas; prueba Claro o Satélite.');if(tileErrorCount>=8)enableFallback('errores continuados del proveedor de teselas')});
      setTimeout(()=>{if(!state.mapReady){enableFallback('no se completó la carga del mapa')} },10000);
    }catch(e){enableFallback('error al inicializar MapLibre: '+e.message)}
  }
  function setPick(mode){state.pick=mode;$('pickBanner').classList.toggle('hidden',!mode);$('pickBanner').textContent=mode===null?'':`Haz clic en el mapa para elegir ${mode==='origin'?'INICIO (Punto 1)':'DESTINO (Punto 2)'} · ESC para cancelar`;
    if(state.map?.getCanvas())state.map.getCanvas().style.cursor=mode?'crosshair':'';
  }
  function clearRouteLine(){
    if(state.map?.getLayer('next-route'))state.map.removeLayer('next-route');
    if(state.map?.getSource('next-route'))state.map.removeSource('next-route');
    state.route=null;
  }
  function setRoutePoint(target,point,label){clearRouteLine();state[target]=point;state[target+'Text']=label;drawEndpoints()}
  async function geocodeQuery(query){
    const q=query.trim();if(!q)throw Error('Introduce una ubicación');
    const match=q.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
    if(match){const lat=Number(match[1]),lon=Number(match[2]);if(Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordenadas fuera de rango');return{point:[lon,lat],name:q,source:'coordinates'}}
    try{const data=await getJson('/geocode?q='+encodeURIComponent(q),10000);if(Number.isFinite(+data.lat)&&Number.isFinite(+data.lon))return{point:[+data.lon,+data.lat],name:data.display_name||q,source:'backend'}}catch(e){}
    const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),10000);
    try{const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,{signal:ctl.signal});if(!r.ok)throw Error('Geocodificación no disponible');const a=await r.json();if(!a.length)throw Error('Ubicación no encontrada');return{point:[+a[0].lon,+a[0].lat],name:a[0].display_name||q,source:'Nominatim'}}finally{clearTimeout(t)}
  }
  function fitLine(coords){if(!state.map||!coords?.length)return;const bounds=new maplibregl.LngLatBounds(coords[0],coords[0]);coords.forEach(p=>bounds.extend(p));state.map.fitBounds(bounds,{padding:{top:90,bottom:75,left:65,right:65},maxZoom:13,duration:900})}
  async function calculateRoute(){
    const from=$('routeFrom')?.value?.trim()||state.originText;const to=$('routeTo')?.value?.trim()||state.destinationText;
    if(!from&&!state.origin){message('Marca un inicio o escribe una dirección');return}
    if(!to&&!state.destination){message('Marca un destino o escribe una dirección');return}
    state.loadingRoute=true;drawPanel();message('Consultando geocodificación y motor de rutas…');
    try{
      const a=state.origin&&(!from||from===state.originText)?{point:state.origin,name:state.originText}:await geocodeQuery(from);
      const b=state.destination&&(!to||to===state.destinationText)?{point:state.destination,name:state.destinationText}:await geocodeQuery(to);
      setRoutePoint('origin',a.point,a.name);setRoutePoint('destination',b.point,b.name);
      let resp=null;
      try{resp=await getJson(`/route?from=${encodeURIComponent(coordsText(a.point))}&to=${encodeURIComponent(coordsText(b.point))}&mode=car`,25000)}catch(e){
        // The public routing service may be reachable even when the backend is asleep.
        const url=`https://router.project-osrm.org/route/v1/driving/${a.point.join(',')};${b.point.join(',')}?overview=full&geometries=geojson`;
        const r=await fetch(url);if(r.ok){const json=await r.json();if(json.code==='Ok'&&json.routes?.[0])resp={geometry:json.routes[0].geometry,distance_km:json.routes[0].distance/1000,duration_min:json.routes[0].duration/60,source:'OSRM public'}}
      }
      if(resp?.geometry?.coordinates?.length>1){const real=/osrm/i.test(resp.source||'');state.route={geometry:resp.geometry,real,distanceKm:resp.distance_km,durationMin:resp.duration_min,source:resp.source};message(real?'Ruta calculada con OSRM · trazado por vías':'Trayecto indicativo, no navegable · proveedor de rutas no disponible')}
      else{state.route={geometry:{type:'LineString',coordinates:[a.point,b.point]},real:false,source:'indicativa'};message('Ruta INDICATIVA: sin motor disponible, no usar para conducir')}
      redrawLines();fitLine(state.route.geometry.coordinates);
    }catch(e){message('No se pudo generar la ruta: '+e.message)}finally{state.loadingRoute=false;drawPanel()}
  }
  function loadSampleMulti(){
    if(!state.demo){message('Habilita el modo DEMO para visualizar los vehículos de muestra');return}
    state.multiRoute=demoFleet.map(f=>({...f,dest:[2.173,41.385]}));
    clearLayer('multi');state.multiRoute.forEach(f=>addMarker('multi',f.point,markerEl('◈',f.name,`${f.person} · DEMO`,'demo')));
    redrawLines();fitLine(state.multiRoute.flatMap(f=>[f.point,f.dest]));message('Multi-ruta DEMO · líneas indicativas, sin localización ni ETA real');drawPanel();
  }
  function clearMulti(){state.multiRoute=null;clearLayer('multi');if(state.map?.getLayer('next-multi'))state.map.removeLayer('next-multi');if(state.map?.getSource('next-multi'))state.map.removeSource('next-multi');drawPanel()}
  function renderActivity(){
    const items=eventsToShow(); const live=state.hasRealEvents;
    if(!items.length)return `<div class="empty-box">${state.status.incidents==='real'?'No se han recibido incidencias para esta zona.':state.demo?'No hay registros de ejemplo.':'Sin datos confirmados del servicio de incidencias.'}</div>`;
    return `<p class="panel-help">${live?'Eventos devueltos por DGT/SCT/Madrid; revisar fecha real del origen.':'Eventos ilustrativos claramente identificados · no proceden de un feed real.'}</p>`+items.slice(0,22).map((e,i)=>`<div class="feed-item"><div class="feed-icon ${e.severity==='critical'?'critical':e.severity==='warning'?'warning':''}">${e.severity==='critical'?'!':'△'}</div><div class="feed-copy"><strong>${esc(e.title||'Incidencia')} <span class="data-badge ${live?'real':'demo'}">${live?'FUENTE':'DEMO'}</span></strong><small>${esc(e.road||'')} · ${esc(e.description||'')}</small><small>Origen: ${esc(e.source||'sin especificar')}</small></div><span class="feed-time">${live?'FEED':'EJ.'}</span></div>`).join('');
  }
  function renderNavigator(){return `<p class="panel-help">Escribe direcciones reales o utiliza el mapa para marcar el inicio y el destino. La ruta solo es navegable si la calcula OSRM.</p><label class="form-label" for="routeFrom">◎ Inicio · Punto 1</label><div class="form-row"><input id="routeFrom" class="text-field" placeholder="Dirección o lat, lon" value="${esc(state.originText)}"/><button class="pick-btn" data-action="pick-origin" title="Marcar inicio en mapa">⌖</button></div><label class="form-label" for="routeTo">⚑ Destino · Punto 2</label><div class="form-row"><input id="routeTo" class="text-field" placeholder="Dirección o lat, lon" value="${esc(state.destinationText)}"/><button class="pick-btn" data-action="pick-destination" title="Marcar destino en mapa">⚑</button></div><div class="form-row" style="margin-top:9px"><button class="ghost-btn" data-action="use-location">◎ Usar mi ubicación</button><button class="ghost-btn" data-action="swap-points">⇄ Intercambiar</button></div><button class="primary-btn" data-action="route" ${state.loadingRoute?'disabled':''}>${state.loadingRoute?'Calculando…':'↗ Calcular ruta'}</button>${state.route?`<div class="route-result"><strong>${state.route.distanceKm?state.route.distanceKm.toFixed(1)+' km':'Trazado indicativo'}</strong><small>${state.route.durationMin?Math.round(state.route.durationMin)+' minutos estimados':''}</small><small>Proveedor: ${esc(state.route.source||'desconocido')}</small><span class="data-badge ${state.route.real?'real':'demo'}">${state.route.real?'RUTA OSRM REAL':'NO NAVEGABLE · INDICATIVA'}</span></div>`:''}`}
  function renderLayers(){
    const rows=[['incidents','⚠','Incidencias DGT / SCT','Marcadores geográficos o ejemplos'],['parking','P','Aparcamientos OSM','Ubicación real · ocupación desconocida'],['bikes','♧','Bicicletas','Estaciones CityBikes'],['traffic','≋','Tráfico Azure','Solo si la tesela responde'],['pmr','♿','Accesibilidad PMR','DEMO visual · sin certificación de rutas']];
    return `<p class="panel-help">Puedes superponer capas. Cada fuente mantiene su propio estado y no se declara operativa por activar un botón.</p>`+rows.map(([id,icon,title,subtitle])=>`<div class="stack-row"><span><b style="color:#7db9ff;margin-right:8px">${icon}</b><b>${title}</b><small>${subtitle} ${id==='traffic'?'<span class="state-note">('+esc(statuses[state.status.traffic]||'')+')</span>':''}</small></span><button class="toggle ${state.layers[id]?'on':''}" role="switch" aria-checked="${state.layers[id]}" aria-label="Activar ${title}" data-layer-toggle="${id}"></button></div>`).join('')+`<div class="route-result" style="font-size:11px">El satélite utiliza imágenes Esri. Los datos de parking proceden de OSM, pero <b>no conocemos sus plazas libres</b> sin una fuente de ocupación autorizada.</div>`;
  }
  function renderMulti(){return `<p class="panel-help">Prueba funcional con cinco salidas hacia un destino común. Hasta integrar GPS autorizado, las posiciones y los trayectos son ejemplos.</p><div class="route-result"><b>Destino común · Barcelona centro</b><small>41.3850, 2.1730 · Coordenadas de la demostración</small><span class="data-badge demo">MULTI-RUTA DEMO</span></div>`+demoFleet.map((f,i)=>`<div class="stack-row"><span><span style="color:${f.color};margin-right:9px">●</span><b>${esc(f.name)}</b><small>${esc(f.person)} · posición de muestra</small></span><span class="data-badge demo">DEMO</span></div>`).join('')+`<button class="primary-btn" data-action="multi">⇶ Mostrar las cinco rutas</button><button class="ghost-btn" data-action="clear-multi" style="width:100%;margin-top:8px">Borrar rutas DEMO</button>`}
  function renderSystems(){return `<p class="panel-help">Un proveedor configurado no equivale a un servicio operativo. La disponibilidad aparece solamente tras recibir una respuesta utilizable. Última consulta: ${state.lastChecked?nowText(state.lastChecked):'pendiente'}.</p>`+Object.entries(sourceTitle).map(([id,title])=>`<div class="status-row"><div><b>${title}</b><small>${id==='fleet'?'Pendiente: registro de dispositivos, consentimiento y telemetría':id==='parking'?'OpenStreetMap · geometría; no ocupación real':id==='traffic'?'Proxy Azure · prueba de imagen válida':id==='incidents'?'Parser de DGT/SCT/Madrid · respuesta del backend':id==='azure'?'Estado de configuración; cada servicio requiere verificación':'Integración preexistente del backend'}</small></div><span class="data-badge ${state.status[id]==='real'?'real':state.status[id]==='demo'?'demo':state.status[id]==='error'?'off':''}">${esc(statuses[state.status[id]]||'—')}</span></div>`).join('')+`<button class="primary-btn" data-action="refresh">↻ Revalidar fuentes para esta zona</button>`}
  function drawPanel(){
    const p=state.panel;const title={zonas:'Vigilancia multizona',actividad:'Actividad y eventos',navegador:'Planificar ruta',capas:'Capas del mapa',multi:'Coordinación multi-ruta',sistemas:'Fuentes conectadas'};
    setText('panelTitle',title[p]||title.actividad);setText('panelSubtitle',p==='actividad'?'Datos reales o muestras identificadas':p==='navegador'?'Pick point y ruta OSRM':p==='capas'?'Fuentes independientes':p==='multi'?'Posiciones DEMO hasta conectar dispositivos':'Diagnóstico de conectividad');
    badge('panelMode',p==='actividad'?(state.hasRealEvents?'real':state.demo?'demo':'empty'):p==='multi'?'demo':p==='navegador'?(state.route?.real?'real':'demo'):'configured');
    $('panelBody').innerHTML=p==='zonas'?renderZonePanel():p==='actividad'?renderActivity():p==='navegador'?renderNavigator():p==='capas'?renderLayers():p==='multi'?renderMulti():renderSystems();
  }
  async function testAzureTile(){
    if(state.status.azure!=='configured'&&state.status.azure!=='real'){state.status.traffic='unconfigured';renderSourceSummary();drawPanel();return false}
    state.status.traffic='verifying';renderSourceSummary();drawPanel();
    const [lng,lat]=getCenter(),z=11;const x=Math.floor((lng+180)/360*2**z);const rad=lat*Math.PI/180;const y=Math.floor((1-Math.asinh(Math.tan(rad))/Math.PI)/2*2**z);
    try{const url=`${state.apiBase}/api/azure/tile/flow/${z}/${x}/${y}`;const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),11000);
      let r;try{r=await fetch(url,{signal:ctrl.signal})}finally{clearTimeout(timer)}
      const blob=r.ok?await r.blob():null;
      if(!r.ok||!blob||!blob.type.includes('image')||blob.size<25)throw Error('Tesela no válida');
      state.status.traffic='real';renderSourceSummary();return true;
    }catch(e){state.status.traffic='error';state.layers.traffic=false;renderSourceSummary();message('Tráfico Azure no disponible · capa desactivada');drawPanel();return false}
  }
  async function toggleLayer(layer){
    state.layers[layer]=!state.layers[layer];
    if(layer==='traffic'&&state.layers.traffic){const ok=await testAzureTile();if(ok)syncTraffic()}
    else if(layer==='traffic')syncTraffic();
    else {drawMarkers()}
    if(state.layers.parking&&state.status.parking!=='real'&&layer==='parking')message('Parking: sin fuente verificada. No se muestra disponibilidad inventada.');
    if(layer==='pmr'&&state.layers.pmr)message('Capa PMR DEMO. No representa rutas accesibles certificadas.');
    drawPanel();
  }
  async function refreshAll(atPoint=null){
    const [lon,lat]=Array.isArray(atPoint)?atPoint:getCenter();
    message('Consultando fuentes públicas…');
    state.status.backend='loading';state.status.incidents='loading';state.status.parking='loading';state.status.bikes='loading';state.status.azure='loading';renderSourceSummary();
    // Parallel requests; one failing provider never blocks others.
    const results=await Promise.allSettled([
      getJson(`/events?city=${encodeURIComponent(getZone(state.activeZone)?.id||'custom')}&lat=${lat}&lon=${lon}&radius_km=35`,28000),
      getJson(`/parking?lat=${lat}&lon=${lon}&radius=2500`,18000),
      getJson(`/mobility/stations?lat=${lat}&lon=${lon}&radius_km=4&country=ES`,18000),
      getJson('/azure/status',12000),
    ]);
    if(results.some(r=>r.status==='fulfilled'))state.status.backend='real';else state.status.backend='error';
    if(results[0].status==='fulfilled'&&Array.isArray(results[0].value.features)){
      const e=results[0].value;const good=Object.values(e.sources||{}).some(x=>x==='OK');
      if(good){state.events=e.features.filter(f=>Number.isFinite(+f.lat)&&Number.isFinite(+f.lon));state.status.incidents='real';state.hasRealEvents=true}
      else{state.events=[];state.status.incidents='error';state.hasRealEvents=false}
    }else{state.events=[];state.status.incidents='error';state.hasRealEvents=false}
    if(results[1].status==='fulfilled'&&results[1].value.status==='OK'&&Array.isArray(results[1].value.features)){
      // Never consume available_estimate from the legacy endpoint: it is pseudorandom.
      state.parking=results[1].value.features.map(({available_estimate, ...rest})=>rest);state.status.parking='real';
    }else{state.parking=[];state.status.parking='error'}
    if(results[2].status==='fulfilled'&&Array.isArray(results[2].value.stations)){state.bikes=results[2].value.stations;state.status.bikes='real'}else{state.bikes=[];state.status.bikes='error'}
    if(results[3].status==='fulfilled'){state.status.azure=results[3].value.enabled?'configured':'unconfigured';if(!results[3].value.enabled)state.status.traffic='unconfigured'}else{state.status.azure='error';state.status.traffic='unconfigured'}
    if(state.layers.traffic){if(await testAzureTile())syncTraffic();else syncTraffic()}
    state.lastChecked=new Date();
    drawMarkers();drawKpis();renderSourceSummary();drawPanel();
    const real=Object.values(state.status).filter(x=>x==='real').length;
    message(`Consulta terminada · ${real} fuentes/servicios con respuesta verificable · ${state.hasRealEvents?'Incidencias FEED':'Incidencias sin feed válido'} · ${nowText(new Date())}`);
  }
  async function locate(){
    if(!navigator.geolocation){message('Geolocalización no disponible en este navegador');return}
    message('Solicitando permiso de geolocalización…');
    navigator.geolocation.getCurrentPosition(pos=>{
      const p=[pos.coords.longitude,pos.coords.latitude];state.map?.flyTo({center:p,zoom:13});setRoutePoint('origin',p,'Mi ubicación · GPS navegador');openView('navegador');message('Punto 1 marcado según GPS del dispositivo');
    },err=>message('No fue posible obtener la ubicación: '+err.message),{enableHighAccuracy:false,timeout:12000,maximumAge:15000});
  }
  function enableOrbDrag(){
    const core=$('orbCore');const wrap=$('orbeWrap');const stage=$('map').parentElement;
    let down=null;let suppressClick=false;
    core.addEventListener('pointerdown',e=>{
      if(e.button!==0)return;
      down={x:e.clientX,y:e.clientY,left:wrap.offsetLeft,top:wrap.offsetTop,moved:false};
      core.setPointerCapture?.(e.pointerId);
    });
    core.addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-down.x,dy=e.clientY-down.y;
      if(!down.moved&&Math.hypot(dx,dy)<7)return;
      down.moved=true;
      const rect=stage.getBoundingClientRect();
      // Keep the center of the draggable orb within the map canvas.
      const guard=state.orbMini?32:120;
      const x=Math.max(guard,Math.min(rect.width-guard,down.left+dx));
      const y=Math.max(guard,Math.min(rect.height-guard,down.top+dy));
      wrap.style.left=x+'px';wrap.style.top=y+'px';
    });
    function endDrag(){if(down?.moved)suppressClick=true;down=null}
    core.addEventListener('pointerup',endDrag);
    core.addEventListener('pointercancel',endDrag);
    core.addEventListener('click',e=>{
      if(suppressClick){suppressClick=false;e.stopImmediatePropagation();e.preventDefault()}
    },true);
  }
  function wireEvents(){
    document.querySelectorAll('[data-view]').forEach(el=>el.addEventListener('click',()=>openView(el.dataset.view)));
    document.querySelectorAll('[data-layer]').forEach(el=>el.addEventListener('click',async()=>{await toggleLayer(el.dataset.layer);openView('capas')}));
    $('refreshBtn').onclick=refreshAll;$('locateBtn').onclick=locate;$('panelRefresh').onclick=refreshAll;
    $('styleStreet').onclick=()=>setMapStyle('dark');$('styleLight').onclick=()=>setMapStyle('light');$('styleSatellite').onclick=()=>setMapStyle('satellite');
    $('pickHelp').onclick=()=>{openView('navegador');setPick(state.origin?'destination':'origin')};
    $('mapFullscreen').onclick=()=>{const e=$('map').parentElement;if(!document.fullscreenElement)e.requestFullscreen?.().then(()=>state.map?.resize());else document.exitFullscreen?.()};
    document.addEventListener('fullscreenchange',()=>setTimeout(()=>state.map?.resize(),150));
    $('orbeOrbit').addEventListener('mousedown',e=>e.stopPropagation());
    const core=$('orbCore');let singleTimer=null;
    core.addEventListener('click',()=>{
      clearTimeout(singleTimer);
      singleTimer=setTimeout(()=>{
        if(state.orbMini){state.orbMini=false;state.orbExpanded=true;}
        else state.orbExpanded=!state.orbExpanded;
        syncOrbState();
      },260);
    });
    core.addEventListener('dblclick',e=>{
      clearTimeout(singleTimer);e.preventDefault();e.stopPropagation();
      state.orbMini=!state.orbMini;state.orbExpanded=!state.orbMini;syncOrbState();
      message(state.orbMini?'Orbe minimizado · clic para restaurar':'Orbe restaurado');
    });
    enableOrbDrag();
    document.querySelectorAll('.right-tabs button').forEach(b=>b.onclick=()=>{state.panel=b.dataset.panel;document.querySelectorAll('.right-tabs button').forEach(x=>x.classList.toggle('active',x===b));drawPanel()});
    $('panelBody').addEventListener('click',async e=>{
      const button=e.target.closest('[data-action],[data-layer-toggle]');if(!button)return;
      if(button.dataset.layerToggle){await toggleLayer(button.dataset.layerToggle);return}
      const action=button.dataset.action;
      if(action==='pick-origin')setPick('origin');
      else if(action==='pick-destination')setPick('destination');
      else if(action==='use-location')locate();
      else if(action==='swap-points'){clearRouteLine();const a=state.origin,b=state.destination,at=state.originText,bt=state.destinationText;state.origin=b;state.destination=a;state.originText=bt;state.destinationText=at;drawEndpoints();drawPanel()}
      else if(action==='route')calculateRoute();
      else if(action==='multi')loadSampleMulti();
      else if(action==='clear-multi')clearMulti();
      else if(action==='refresh')refreshAll();
      else if(action==='refresh-zones')refreshZones(true);
    });
    $('searchPlace').onclick=async()=>{const q=$('globalSearch').value.trim();if(!q)return;message('Buscando '+q);try{const a=await geocodeQuery(q);state.map?.flyTo({center:a.point,zoom:12.5});setText('areaName',a.name.split(',').slice(0,2).join(','));message('Ubicación: '+a.name)}catch(e){message('Búsqueda: '+e.message)}};
    $('globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')$('searchPlace').click()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'){setPick(null);dismissPoint();setImmersiveMap(false)}});
    $('settingsBtn').onclick=()=>{$('apiBaseInput').value=state.apiBase;$('allowDemo').checked=state.demo;$('settingsModal').classList.remove('hidden')};
    $('closeSettings').onclick=()=>{$('settingsModal').classList.add('hidden')};
    $('settingsModal').addEventListener('click',e=>{if(e.target.id==='settingsModal')$('closeSettings').click()});
    $('saveSettings').onclick=()=>{const v=$('apiBaseInput').value.trim().replace(/\/$/,'');if(!/^https?:\/\//.test(v)){alert('Introduce una URL pública HTTP(S) válida');return}state.apiBase=v;state.demo=$('allowDemo').checked;if(!state.demo)clearMulti();localStorage.setItem('orbeosNextApi',v);localStorage.setItem('orbeosNextDemo',String(state.demo));$('settingsModal').classList.add('hidden');refreshAll()};
  }
  // Multi-zone watch center. Zone configuration persists locally, not raw incident data.
  function hydrateZones(){
    let ids=['barcelona','madrid','valencia','sevilla'];
    try{const stored=JSON.parse(localStorage.getItem('orbeosNextZonesV3')||'null');if(Array.isArray(stored)&&stored.length){ids=stored.filter(x=>typeof x==='string').slice(0,6)}}catch{}
    state.zones=[...new Set(ids)].map(id=>CITY_ZONES.find(z=>z.id===id)).filter(Boolean).map(z=>({...z,kind:'loading',events:[],checked:null,sources:{},message:'Esperando consulta'}));
    state.activeZone=state.zones[0]?.id;
    $('addZoneSelect').innerHTML='<option value="">Selecciona ciudad…</option>'+CITY_ZONES.map(z=>`<option value="${z.id}">${esc(z.name)}</option>`).join('');
    renderZones();
  }
  function persistZones(){localStorage.setItem('orbeosNextZonesV3',JSON.stringify(state.zones.map(z=>z.id)))}
  function zoneStatusLabel(z){if(z.kind==='real')return 'FEED';if(z.kind==='loading')return 'CONSULTANDO';if(z.kind==='empty')return 'SIN FEED';return 'NO DISPONIBLE'}
  function getZone(id){return state.zones.find(z=>z.id===id)}
  function formatZoneAge(d){if(!d)return 'Pendiente';const secs=Math.round((Date.now()-d)/1000);return secs<90?'Ahora':secs<3600?`Hace ${Math.round(secs/60)} min`:`Hace ${Math.round(secs/3600)} h`}
  function renderZones(){
    const grid=$('watchGrid');if(!grid)return;
    grid.innerHTML=state.zones.map(z=>`<article class="zone-card ${z.id===state.activeZone?'active':''}" data-zone="${esc(z.id)}">
      <div class="zone-head"><div><div class="zone-name"><span class="zone-bubble ${z.kind}"></span><strong>${esc(z.name)}</strong><span class="zone-state ${z.kind}">${zoneStatusLabel(z)}</span></div><small>Vigilancia · radio 35 km · ${formatZoneAge(z.checked)}</small></div><div class="zone-tools"><button data-zone-action="focus" data-zone="${z.id}" title="Ampliar en el mapa principal">↗</button><button data-zone-action="remove" data-zone="${z.id}" title="Retirar zona">×</button></div></div>
      <div class="zone-map" id="zone-map-${z.id}"><div class="zone-map-fallback">Cargando cartografía…</div></div>
      <div class="zone-stats"><div><b>${z.kind==='real'?nfmt(z.events.length):'—'}</b><small>Incidencias públicas</small></div><div><b>${z.kind==='real'?nfmt(z.events.filter(e=>e.severity==='critical').length):'—'}</b><small>Graves</small></div><div><b>${z.kind==='real'?Object.values(z.sources).filter(s=>s==='OK').length:'—'}</b><small>Fuentes OK</small></div></div>
      <div class="zone-foot"><span title="${esc(z.message)}">${esc(z.message)}</span><button data-zone-action="focus" data-zone="${z.id}">Inspeccionar →</button></div>
    </article>`).join('');
    setText('watchCount',`${state.zones.length} zona${state.zones.length!==1?'s':''}`);
    const ok=state.zones.filter(z=>z.kind==='real').length;
    setText('watchHealth',state.zonePaused?'Vigilancia periódica pausada':`${ok}/${state.zones.length} zonas con al menos una fuente pública verificada`);
    // Mini zones are raster thumbnails, NOT additional WebGL maps.
    state.zones.forEach(z=>initZoneMap(z));
  }
  function initZoneMap(z){
    const target=$('zone-map-'+z.id);if(!target)return;
    target.replaceChildren();target.classList.add('zone-thumb');
    const zz=10, lat=Math.max(-85,Math.min(85,z.lat)),sin=Math.sin(lat*Math.PI/180);
    const cx=(z.lon+180)/360*2**zz*256;
    const cy=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*2**zz*256;
    const w=330,h=135;
    for(let ix=-1;ix<=1;ix++)for(let iy=-1;iy<=1;iy++){
      const tx=Math.floor(cx/256)+ix,ty=Math.floor(cy/256)+iy;
      if(ty<0||ty>=2**zz)continue;
      const image=document.createElement('img');image.alt='';image.loading='lazy';image.decoding='async';image.draggable=false;
      image.src=`https://a.basemaps.cartocdn.com/dark_all/${zz}/${(tx+2**zz)%(2**zz)}/${ty}.png`;
      image.style.cssText=`position:absolute;left:calc(50% + ${Math.round(tx*256-cx)}px);top:calc(50% + ${Math.round(ty*256-cy)}px);width:256px;height:256px;pointer-events:none`;
      image.onerror=()=>image.remove();target.appendChild(image);
    }
    const dot=document.createElement('span');dot.className='zone-focus-dot';dot.title=z.name;target.appendChild(dot);
    const attribution=document.createElement('span');attribution.className='zone-map-credit';attribution.textContent='© OSM · CARTO';target.appendChild(attribution);
    target.addEventListener('click',()=>focusZone(z.id));
    renderZoneMarkers(z.id);
  }
  function renderZoneMarkers(id){
    const z=getZone(id),target=$('zone-map-'+id);if(!z||!target)return;
    target.querySelectorAll('.zone-count').forEach(x=>x.remove());
    if(z.kind!=='real'||!z.events?.length)return;
    const bubble=document.createElement('span');bubble.className='zone-count';bubble.textContent=z.events.length+' incidencias';target.appendChild(bubble);
  }
  function renderZonePanel(){
    const zones=state.zones;let output='<p class="panel-help">Consulta simultánea de DGT/DATEX II, SCT y Madrid cuando respondan. Una fuente no accesible no significa ausencia de incidentes.</p>';
    if(state.watchChanges.length)output+=`<div class="watch-alert-list"><b>Eventos detectados tras la última consulta</b>${state.watchChanges.slice(0,8).map(c=>`<div class="watch-event"><span>${esc(c.city)} · ${esc(c.title)}</span><small>${esc(c.source)} · ${esc(c.when)}</small></div>`).join('')}</div>`;
    zones.forEach(z=>{
      output+=`<button class="watch-panel-row" data-zone-action="focus" data-zone="${z.id}"><span><b>${esc(z.name)}</b><small>${z.kind==='real'?`${z.events.length} incidencias · ${Object.keys(z.sources).join(' + ')}`:z.message}</small></span><span class="zone-state ${z.kind}">${zoneStatusLabel(z)}</span></button>`;
      if(z.kind==='real')output+=z.events.slice(0,2).map(e=>`<div class="watch-event"><span>${esc(e.title||'Incidencia')}</span><small>${esc(e.road||'')} · ${esc(e.source||'Fuente pública')}</small></div>`).join('');
    });
    return output+'<button class="primary-btn" data-action="refresh-zones">↻ Actualizar zonas</button>';
  }
  async function fetchZone(z){
    const epoch=state.zoneEpoch;
    z.kind='loading';z.message='Comprobando fuentes…';updateZoneCard(z);
    try{
      const data=await getJson(`/events?city=${encodeURIComponent(z.id)}&lat=${z.lat}&lon=${z.lon}&radius_km=35`,20000);
      if(epoch!==state.zoneEpoch||!getZone(z.id))return;
      const sources=data?.sources||{};
      const confirmed=Object.values(sources).some(s=>String(s).toUpperCase()==='OK');
      const previous=z.kind==='real'?new Set(z.events.map(e=>[e.title,e.road,e.lat,e.lon].join('|'))):null;
      z.sources=sources;z.events=confirmed&&Array.isArray(data.features)?data.features.filter(e=>Number.isFinite(+e.lat)&&Number.isFinite(+e.lon)):[];
      if(previous&&confirmed){
        const news=z.events.filter(e=>!previous.has([e.title,e.road,e.lat,e.lon].join('|')));
        for(const e of news.slice(0,10))state.watchChanges.unshift({city:z.name,title:e.title||'Incidencia',source:e.source||'Feed público',when:nowText(new Date())});
        state.watchChanges=state.watchChanges.slice(0,30);
      }
      z.kind=confirmed?'real':'error';z.checked=Date.now();
      z.message=confirmed?`${Object.entries(sources).filter(([,s])=>s==='OK').map(([k])=>k).join(' + ')} · datos públicos`:'Fuentes no disponibles o sin confirmar';
    }catch(e){if(epoch!==state.zoneEpoch||!getZone(z.id))return;z.kind='error';z.events=[];z.checked=Date.now();z.message='Error de consulta / sin datos verificados'}
    updateZoneCard(z);
  }
  function updateZoneCard(z){
    const card=document.querySelector(`.zone-card[data-zone="${z.id}"]`);if(!card)return;
    card.classList.toggle('active',z.id===state.activeZone);
    const st=card.querySelector('.zone-state');st.className='zone-state '+z.kind;st.textContent=zoneStatusLabel(z);
    const b=card.querySelector('.zone-bubble');b.className='zone-bubble '+z.kind;
    const small=card.querySelector('.zone-head small');if(small)small.textContent='Vigilancia · radio 35 km · '+formatZoneAge(z.checked);
    const numbers=card.querySelectorAll('.zone-stats b');if(numbers.length){numbers[0].textContent=z.kind==='real'?nfmt(z.events.length):'—';numbers[1].textContent=z.kind==='real'?nfmt(z.events.filter(e=>e.severity==='critical').length):'—';numbers[2].textContent=z.kind==='real'?Object.values(z.sources).filter(s=>s==='OK').length:'—'}
    const info=card.querySelector('.zone-foot span');if(info){info.title=z.message;info.textContent=z.message}
    renderZoneMarkers(z.id);
    if(state.panel==='zonas')drawPanel();
  }
  async function refreshZones(force=false){
    if(state.zoneRefreshing)return;
    if(state.zonePaused&&!force)return;
    state.zoneRefreshing=true;
    $('refreshZonesBtn').disabled=true;
    const batch=[...state.zones];
    // Limit concurrent network requests to avoid saturating the Render free backend.
    for(let i=0;i<batch.length;i+=2)await Promise.all(batch.slice(i,i+2).map(fetchZone));
    state.zoneRefreshing=false;$('refreshZonesBtn').disabled=false;
    const ok=state.zones.filter(z=>z.kind==='real').length;
    setText('watchHealth',`${ok}/${state.zones.length} zonas con feed verificado · ${nowText(new Date())}`);
    drawPanel();
  }
  function addZone(){const id=$('addZoneSelect').value;if(!id){$('addZoneSelect').focus();return}
    if(state.zones.some(z=>z.id===id)){focusZone(id);return}
    if(state.zones.length>=6){message('Máximo seis zonas simultáneas para no saturar proveedores públicos');return}
    const record=CITY_ZONES.find(z=>z.id===id);if(!record)return;
    const z={...record,kind:'loading',events:[],checked:null,sources:{},message:'Esperando consulta'};
    state.zones.push(z);persistZones();renderZones();void fetchZone(z);
    $('addZoneSelect').value='';
  }
  function removeZone(id){if(state.zones.length<=1){message('Deja al menos una zona en vigilancia');return}
    state.zones=state.zones.filter(z=>z.id!==id);state.zoneEpoch++;
    if(state.activeZone===id)state.activeZone=state.zones[0]?.id;
    persistZones();renderZones();void refreshZones(true);
  }
  function focusZone(id){const z=getZone(id);if(!z)return;
    state.activeZone=id;state.center=[z.lon,z.lat];
    state.zones.forEach(x=>{document.querySelector(`.zone-card[data-zone="${x.id}"]`)?.classList.toggle('active',x.id===id)});
    state.map?.flyTo({center:[z.lon,z.lat],zoom:Math.max(11.5,state.map?.getZoom()||11.5),duration:750});if(state.tileFallbackActive)renderFallbackMap();
    setText('areaName',z.name);setText('areaCoords',`${z.lat.toFixed(3)}°, ${z.lon.toFixed(3)}°`);
    message(`${z.name} · zona seleccionada · ${zoneStatusLabel(z)} · clic en mapa para opciones`);
    void refreshAll([z.lon,z.lat]);
  }
  function toggleZonePause(){state.zonePaused=!state.zonePaused;$('pauseZonesBtn').textContent=state.zonePaused?'▶ Reanudar':'Ⅱ Pausar';
    if(!state.zonePaused)void refreshZones(true);else setText('watchHealth','Vigilancia periódica pausada · mapas y datos existentes siguen visibles');
  }
  function wireZones(){
    hydrateZones();
    $('addZoneBtn').addEventListener('click',addZone);
    $('refreshZonesBtn').addEventListener('click',()=>void refreshZones(true));
    $('pauseZonesBtn').addEventListener('click',toggleZonePause);
    $('zonesDetailBtn').addEventListener('click',()=>{openView('mapa');$('map').scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>state.map?.resize(),400)});
    $('watchGrid').addEventListener('click',e=>{const b=e.target.closest('[data-zone-action]');if(!b)return;
      if(b.dataset.zoneAction==='focus')focusZone(b.dataset.zone);
      else if(b.dataset.zoneAction==='remove')removeZone(b.dataset.zone);
    });
    $('panelBody').addEventListener('click',e=>{const b=e.target.closest('[data-zone-action]');if(b){focusZone(b.dataset.zone);$('map').scrollIntoView({behavior:'smooth',block:'center'})}});
    state.zoneTimer=setInterval(()=>{if(!document.hidden&&!state.zonePaused)void refreshZones()},180000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!state.zonePaused){queueMapResize();const old=state.zones.some(z=>!z.checked||Date.now()-z.checked>180000);if(old)void refreshZones()}});
  }
  function start(){document.body.classList.add('nav-compact');const watch=$('watchCenter');watch.classList.remove('watch-expanded');window.addEventListener('resize',()=>{if(state.tileFallbackActive)renderFallbackMap();queueMapResize()});refreshClock();setInterval(refreshClock,30000);renderOrb();drawKpis();renderSourceSummary();drawPanel();wireEvents();wireZones();initMap();void refreshZones();refreshAll()}
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
})();